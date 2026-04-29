<?php
// === DINA Chat API — Lead Management ===
// Single table `chat_leads` menyimpan semua respon spesifik per konteks
// Labels: booking, test_drive, prospect, emergency, sparepart, complaint, aksesoris
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        createLead();
        break;
    case 'list':
        listLeads();
        break;
    case 'get':
        getLead();
        break;
    case 'update':
        updateLead();
        break;
    case 'by_session':
        getLeadsBySession();
        break;
    case 'count_new':
        countNewLeads();
        break;
    case 'delete':
        deleteLead();
        break;
    default:
        jsonResponse(false, 'Invalid action. Use: create, list, get, update, by_session, count_new', null, 400);
}

// ============================================================
// CREATE — Simpan lead baru dari percakapan VirtualCS
// ============================================================
function createLead()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();

    $sessionId     = $body['session_id'] ?? '';
    $label         = $body['label'] ?? '';
    $customerName  = $body['customer_name'] ?? null;
    $customerPhone = $body['customer_phone'] ?? null;
    $customerNopol = $body['customer_nopol'] ?? null;
    $vehicleModel  = $body['vehicle_model'] ?? null;
    $data          = $body['data'] ?? [];

    // Validate required fields
    if (empty($sessionId) || empty($label)) {
        jsonResponse(false, 'session_id and label are required', null, 400);
    }

    // Validate label
    $validLabels = ['booking', 'test_drive', 'prospect', 'emergency', 'sparepart', 'complaint', 'aksesoris'];
    if (!in_array($label, $validLabels)) {
        jsonResponse(false, 'Invalid label. Valid labels: ' . implode(', ', $validLabels), null, 400);
    }

    // Validate data is array/object
    if (!is_array($data)) {
        jsonResponse(false, 'data must be a JSON object', null, 400);
    }

    $db = getDB();

    // Verify session exists
    $sessionStmt = $db->prepare("SELECT id FROM chat_sessions WHERE id = :id");
    $sessionStmt->execute([':id' => $sessionId]);
    if (!$sessionStmt->fetch()) {
        jsonResponse(false, 'Session not found', null, 404);
    }

    // Insert lead
    $leadId = generateUUID();
    $stmt = $db->prepare("
        INSERT INTO chat_leads (id, session_id, label, customer_name, customer_phone, customer_nopol, vehicle_model, data, status, created_at)
        VALUES (:id, :session_id, :label, :customer_name, :customer_phone, :customer_nopol, :vehicle_model, :data, 'new', NOW())
    ");

    $stmt->execute([
        ':id'             => $leadId,
        ':session_id'     => $sessionId,
        ':label'          => $label,
        ':customer_name'  => $customerName,
        ':customer_phone' => $customerPhone,
        ':customer_nopol' => $customerNopol,
        ':vehicle_model'  => $vehicleModel,
        ':data'           => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ]);

    jsonResponse(true, 'Lead berhasil disimpan', [
        'lead_id'    => $leadId,
        'label'      => $label,
        'status'     => 'new',
        'created_at' => date('Y-m-d H:i:s')
    ]);
}

// ============================================================
// LIST — List leads dengan filter (label, status, search, pagination)
// ============================================================
function listLeads()
{
    $db = getDB();

    $label  = $_GET['label'] ?? '';
    $status = $_GET['status'] ?? '';
    $search = $_GET['search'] ?? '';
    $page   = max(1, (int)($_GET['page'] ?? 1));
    $limit  = min(100, max(10, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    // Build query with filters
    $where   = [];
    $params  = [];

    if (!empty($label)) {
        $where[]          = 'l.label = :label';
        $params[':label'] = $label;
    }

    if (!empty($status)) {
        $where[]           = 'l.status = :status';
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $where[]           = '(l.customer_name LIKE :search OR l.customer_phone LIKE :search2 OR l.customer_nopol LIKE :search3 OR l.vehicle_model LIKE :search4)';
        $params[':search']  = "%{$search}%";
        $params[':search2'] = "%{$search}%";
        $params[':search3'] = "%{$search}%";
        $params[':search4'] = "%{$search}%";
    }

    $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

    // Count total
    $countStmt = $db->prepare("SELECT COUNT(*) FROM chat_leads l {$whereClause}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Fetch leads with session info
    $sql = "
        SELECT l.*,
            s.ip_address AS session_ip,
            s.device_type AS session_device,
            s.browser AS session_browser,
            s.os AS session_os,
            s.created_at AS session_created_at
        FROM chat_leads l
        LEFT JOIN chat_sessions s ON l.session_id = s.id
        {$whereClause}
        ORDER BY l.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $db->prepare($sql);

    // Bind filter params
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val, PDO::PARAM_STR);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $leads = $stmt->fetchAll();

    // Parse JSON data column
    foreach ($leads as &$lead) {
        if ($lead['data']) {
            $lead['data'] = json_decode($lead['data'], true);
        }
    }

    jsonResponse(true, '', [
        'leads'      => $leads,
        'total'      => $total,
        'page'       => $page,
        'limit'      => $limit,
        'total_pages' => ceil($total / $limit)
    ]);
}

// ============================================================
// GET — Detail lead by ID
// ============================================================
function getLead()
{
    $id = $_GET['id'] ?? '';

    if (empty($id)) {
        jsonResponse(false, 'id parameter is required', null, 400);
    }

    $db = getDB();

    $stmt = $db->prepare("
        SELECT l.*,
            s.ip_address AS session_ip,
            s.device_type AS session_device,
            s.browser AS session_browser,
            s.os AS session_os,
            s.status AS session_status,
            s.created_at AS session_created_at,
            s.closed_at AS session_closed_at
        FROM chat_leads l
        LEFT JOIN chat_sessions s ON l.session_id = s.id
        WHERE l.id = :id
    ");
    $stmt->execute([':id' => $id]);
    $lead = $stmt->fetch();

    if (!$lead) {
        jsonResponse(false, 'Lead not found', null, 404);
    }

    // Parse JSON data
    if ($lead['data']) {
        $lead['data'] = json_decode($lead['data'], true);
    }

    // Fetch related chat messages (last 20 from the session)
    $msgStmt = $db->prepare("
        SELECT id, sender_type, message, created_at
        FROM chat_messages
        WHERE session_id = :session_id
        ORDER BY created_at DESC
        LIMIT 20
    ");
    $msgStmt->execute([':session_id' => $lead['session_id']]);
    $lead['recent_messages'] = array_reverse($msgStmt->fetchAll());

    jsonResponse(true, '', $lead);
}

// ============================================================
// UPDATE — Update status, assigned_to, notes, atau data JSON
// ============================================================
function updateLead()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $id   = $body['id'] ?? '';

    if (empty($id)) {
        jsonResponse(false, 'id is required', null, 400);
    }

    $db = getDB();

    // Verify lead exists
    $checkStmt = $db->prepare("SELECT id, data FROM chat_leads WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        jsonResponse(false, 'Lead not found', null, 404);
    }

    // Build dynamic UPDATE
    $updates = [];
    $params  = [':id' => $id];

    // Status
    if (isset($body['status'])) {
        $validStatuses = ['new', 'in_progress', 'followed_up', 'completed', 'cancelled'];
        if (!in_array($body['status'], $validStatuses)) {
            jsonResponse(false, 'Invalid status. Valid: ' . implode(', ', $validStatuses), null, 400);
        }
        $updates[]           = 'status = :status';
        $params[':status']   = $body['status'];
    }

    // Assigned to
    if (isset($body['assigned_to'])) {
        $updates[]                = 'assigned_to = :assigned_to';
        $params[':assigned_to']   = $body['assigned_to'];
    }

    // Notes
    if (isset($body['notes'])) {
        $updates[]          = 'notes = :notes';
        $params[':notes']   = $body['notes'];
    }

    // Customer fields
    if (isset($body['customer_name'])) {
        $updates[]                  = 'customer_name = :customer_name';
        $params[':customer_name']   = $body['customer_name'];
    }
    if (isset($body['customer_phone'])) {
        $updates[]                   = 'customer_phone = :customer_phone';
        $params[':customer_phone']   = $body['customer_phone'];
    }
    if (isset($body['customer_nopol'])) {
        $updates[]                   = 'customer_nopol = :customer_nopol';
        $params[':customer_nopol']   = $body['customer_nopol'];
    }
    if (isset($body['vehicle_model'])) {
        $updates[]                  = 'vehicle_model = :vehicle_model';
        $params[':vehicle_model']   = $body['vehicle_model'];
    }

    // Data JSON — merge with existing data
    if (isset($body['data']) && is_array($body['data'])) {
        $existingData = json_decode($existing['data'], true) ?: [];
        $mergedData   = array_merge($existingData, $body['data']);
        $updates[]          = 'data = :data';
        $params[':data']    = json_encode($mergedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    if (empty($updates)) {
        jsonResponse(false, 'No fields to update', null, 400);
    }

    // Always update updated_at
    $updates[] = 'updated_at = NOW()';

    $sql = "UPDATE chat_leads SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    jsonResponse(true, 'Lead updated successfully');
}

// ============================================================
// BY_SESSION — Get all leads for a specific chat session
// ============================================================
function getLeadsBySession()
{
    $sessionId = $_GET['session_id'] ?? '';

    if (empty($sessionId)) {
        jsonResponse(false, 'session_id parameter is required', null, 400);
    }

    $db = getDB();

    $stmt = $db->prepare("
        SELECT * FROM chat_leads
        WHERE session_id = :session_id
        ORDER BY created_at ASC
    ");
    $stmt->execute([':session_id' => $sessionId]);
    $leads = $stmt->fetchAll();

    // Parse JSON data
    foreach ($leads as &$lead) {
        if ($lead['data']) {
            $lead['data'] = json_decode($lead['data'], true);
        }
    }

    jsonResponse(true, '', [
        'session_id' => $sessionId,
        'leads'      => $leads,
        'total'      => count($leads)
    ]);
}

// ============================================================
// COUNT_NEW — Count leads with status 'new' per label
// Digunakan untuk sidebar badge notification
// ============================================================
function countNewLeads()
{
    $db = getDB();

    $stmt = $db->query("
        SELECT label, COUNT(*) as count
        FROM chat_leads
        WHERE status = 'new'
        GROUP BY label
    ");
    $rows = $stmt->fetchAll();

    // Build keyed result with all labels initialized to 0
    $counts = [
        'booking'    => 0,
        'test_drive' => 0,
        'prospect'   => 0,
        'emergency'  => 0,
        'sparepart'  => 0,
        'complaint'  => 0,
        'aksesoris'  => 0
    ];

    foreach ($rows as $row) {
        $counts[$row['label']] = (int)$row['count'];
    }

    // Total across all labels
    $counts['total'] = array_sum($counts);

    jsonResponse(true, '', $counts);
}

// ============================================================
// DELETE — Hapus lead by ID
// ============================================================
function deleteLead()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $id   = $body['id'] ?? '';

    if (empty($id)) {
        jsonResponse(false, 'id parameter is required', null, 400);
    }

    $db = getDB();

    $stmt = $db->prepare("DELETE FROM chat_leads WHERE id = :id");
    $stmt->execute([':id' => $id]);

    jsonResponse(true, 'Lead berhasil dihapus');
}
