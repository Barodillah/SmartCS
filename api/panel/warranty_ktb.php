<?php
// === Warranty KTB API ===
// Endpoint for PKT CV management
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        $search = $_GET['search'] ?? '';
        $source = $_GET['source'] ?? 'pdi';
        
        $where = "WHERE status = 'PDI'";
        if ($source === 'survey') {
            $where = "WHERE status != 'PDI'";
        }

        if (!empty($search)) {
            $search = mysqli_real_escape_string($conn, $search);
            if ($source === 'survey') {
                $where = "WHERE status != 'PDI' AND (nama LIKE '%$search%' OR rangka LIKE '%$search%' OR spv LIKE '%$search%' OR kendaraan LIKE '%$search%' OR sales LIKE '%$search%')";
            } else {
                $where = "WHERE (nama LIKE '%$search%' OR rangka LIKE '%$search%' OR spv LIKE '%$search%' OR kendaraan LIKE '%$search%' OR sales LIKE '%$search%')";
            }
        }

        $query  = "SELECT * FROM pkt_cv $where ORDER BY id DESC";
        $result = mysqli_query($conn, $query);

        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }

        echo json_encode([
            'status' => true,
            'data' => $data
        ]);
    } elseif ($action === 'logs') {
        $unit_id = (int)($_GET['unit_id'] ?? 0);

        if ($unit_id <= 0) {
            echo json_encode(['status' => false, 'message' => 'unit_id wajib diisi']);
            exit;
        }

        $query = "SELECT * FROM surveyupdate_record WHERE unit_id = $unit_id ORDER BY time ASC";
        $result = mysqli_query($conn, $query);

        $logs = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $logs[] = [
                    'id'     => $row['id'],
                    'date'   => $row['time'],
                    'status' => $row['status'],
                    'pkt'    => $row['pkt'] ?? ''
                ];
            }
        }

        echo json_encode(['status' => true, 'data' => $logs]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid.']);
    }

} elseif ($method === 'PUT') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id       = (int)($body['id'] ?? 0);
    $status   = mysqli_real_escape_string($conn, $body['status'] ?? '');
    $pkt_date = mysqli_real_escape_string($conn, $body['pkt_date'] ?? '');
    
    // Additional survey fields
    $est      = isset($body['est']) ? mysqli_real_escape_string($conn, $body['est']) : null;
    $note     = isset($body['note']) ? mysqli_real_escape_string($conn, $body['note']) : null;
    $pkt      = isset($body['pkt']) ? mysqli_real_escape_string($conn, $body['pkt']) : null;

    if ($id <= 0 || empty($status)) {
        echo json_encode(['status' => false, 'message' => 'ID dan status wajib diisi']);
        exit;
    }

    $updates = ["status = '$status'"];
    if (!empty($pkt_date)) $updates[] = "pkt_date = '$pkt_date'";
    
    // Only update est, note, and pkt if they are provided (prevent errors if columns don't exist and not passed)
    if ($est !== null) $updates[] = "est = '$est'";
    if ($note !== null) $updates[] = "note = '$note'";
    if ($pkt !== null) $updates[] = "pkt = '$pkt'";

    $updateString = implode(', ', $updates);
    $updateQuery = "UPDATE pkt_cv SET $updateString WHERE id = $id";

    if (mysqli_query($conn, $updateQuery)) {
        // If it's a survey update (not just PDI to PKT), we should also insert a log
        if ($est !== null || $note !== null) {
            $logPkt = $pkt !== null ? $pkt : 'No';
            $recordQuery = "INSERT INTO surveyupdate_record VALUES (NULL, NULL, $id, '$status', '$logPkt')";
            mysqli_query($conn, $recordQuery);
        }
        
        echo json_encode(['status' => true, 'message' => 'Data berhasil disimpan']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal memperbarui status: ' . mysqli_error($conn)]);
    }
}

mysqli_close($conn);
?>
