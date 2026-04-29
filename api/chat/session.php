<?php
// === DINA Chat API — Session Management ===
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'create':
        createSession();
        break;
    case 'close':
        closeSession();
        break;
    case 'get':
        getSession();
        break;
    case 'list':
        listSessions();
        break;
    case 'admin_list':
        adminListSessions();
        break;
    case 'delete':
        deleteSession();
        break;
    default:
        jsonResponse(false, 'Invalid action. Use: create, close, get, list, admin_list', null, 400);
}

// --- Create New Session ---
function createSession() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $id = generateUUID();
    $ip = getClientIP();

    $db = getDB();
    $stmt = $db->prepare("
        INSERT INTO chat_sessions (id, status, ip_address, user_agent, device_type, browser, os, city, country, created_at)
        VALUES (:id, 'active', :ip, :ua, :device, :browser, :os, :city, :country, NOW())
    ");

    $stmt->execute([
        ':id'      => $id,
        ':ip'      => $ip,
        ':ua'      => $body['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? null),
        ':device'  => $body['device_type'] ?? null,
        ':browser' => $body['browser'] ?? null,
        ':os'      => $body['os'] ?? null,
        ':city'    => $body['city'] ?? null,
        ':country' => $body['country'] ?? null
    ]);

    jsonResponse(true, 'Session created', [
        'session_id' => $id,
        'created_at' => date('Y-m-d H:i:s')
    ]);
}

// --- Close Session ---
function closeSession() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $sessionId = $body['session_id'] ?? '';

    if (empty($sessionId)) {
        jsonResponse(false, 'session_id is required', null, 400);
    }

    $db = getDB();
    $stmt = $db->prepare("
        UPDATE chat_sessions SET status = 'closed', closed_at = NOW() WHERE id = :id AND status = 'active'
    ");
    $stmt->execute([':id' => $sessionId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Session not found or already closed', null, 404);
    }

    jsonResponse(true, 'Session closed');
}

// --- Get Session Detail ---
function getSession() {
    $sessionId = $_GET['id'] ?? '';

    if (empty($sessionId)) {
        jsonResponse(false, 'id parameter is required', null, 400);
    }

    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM chat_sessions WHERE id = :id");
    $stmt->execute([':id' => $sessionId]);
    $session = $stmt->fetch();

    if (!$session) {
        jsonResponse(false, 'Session not found', null, 404);
    }

    // Get message count and first message preview
    $msgStmt = $db->prepare("
        SELECT COUNT(*) as total_messages,
               (SELECT message FROM chat_messages WHERE session_id = :id2 AND sender_type = 'user' ORDER BY created_at ASC LIMIT 1) as first_user_message
        FROM chat_messages WHERE session_id = :id
    ");
    $msgStmt->execute([':id' => $sessionId, ':id2' => $sessionId]);
    $msgInfo = $msgStmt->fetch();

    $session['total_messages'] = (int)($msgInfo['total_messages'] ?? 0);
    $session['first_user_message'] = $msgInfo['first_user_message'] ?? null;

    jsonResponse(true, '', $session);
}

// --- List Sessions by IDs ---
function listSessions() {
    $idsParam = $_GET['ids'] ?? '';

    if (empty($idsParam)) {
        jsonResponse(false, 'ids parameter is required (comma-separated UUIDs)', null, 400);
    }

    $ids = array_filter(array_map('trim', explode(',', $idsParam)));

    if (empty($ids) || count($ids) > 50) {
        jsonResponse(false, 'Provide 1-50 valid session IDs', null, 400);
    }

    $db = getDB();
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmt = $db->prepare("
        SELECT s.*,
            (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as total_messages,
            (SELECT message FROM chat_messages WHERE session_id = s.id AND sender_type = 'user' ORDER BY created_at ASC LIMIT 1) as first_user_message
        FROM chat_sessions s
        WHERE s.id IN ($placeholders)
        ORDER BY s.created_at DESC
    ");
    $stmt->execute($ids);
    $sessions = $stmt->fetchAll();

    // Cast numeric fields
    foreach ($sessions as &$s) {
        $s['total_messages'] = (int)$s['total_messages'];
    }

    jsonResponse(true, '', $sessions);
}

// --- Admin List All Sessions ---
function adminListSessions() {
    $db = getDB();

    $stmt = $db->query("
        SELECT s.*,
            (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as total_messages,
            (SELECT message FROM chat_messages WHERE session_id = s.id AND sender_type = 'user' ORDER BY created_at ASC LIMIT 1) as first_user_message,
            (SELECT MAX(created_at) FROM chat_messages WHERE session_id = s.id) as last_message_at
        FROM chat_sessions s
        ORDER BY COALESCE((SELECT MAX(created_at) FROM chat_messages WHERE session_id = s.id), s.created_at) DESC
        LIMIT 100
    ");
    $sessions = $stmt->fetchAll();

    // Cast numeric fields
    foreach ($sessions as &$s) {
        $s['total_messages'] = (int)$s['total_messages'];
    }

    jsonResponse(true, '', $sessions);
}

// --- Delete Session and Messages ---
function deleteSession() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(false, 'Method not allowed', null, 405);
    }

    $body = getPostBody();
    $sessionId = $body['session_id'] ?? '';

    if (empty($sessionId)) {
        jsonResponse(false, 'session_id is required', null, 400);
    }

    $db = getDB();
    
    // Delete messages first
    $stmtMsg = $db->prepare("DELETE FROM chat_messages WHERE session_id = :id");
    $stmtMsg->execute([':id' => $sessionId]);
    
    // Delete session
    $stmtSession = $db->prepare("DELETE FROM chat_sessions WHERE id = :id");
    $stmtSession->execute([':id' => $sessionId]);

    jsonResponse(true, 'Session and messages deleted');
}
