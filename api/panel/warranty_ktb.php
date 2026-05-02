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
        $where = "WHERE status = 'PDI'";

        if (!empty($search)) {
            $search = mysqli_real_escape_string($conn, $search);
            $where = "WHERE (nama LIKE '%$search%' OR rangka LIKE '%$search%' OR spv LIKE '%$search%' OR kendaraan LIKE '%$search%' OR sales LIKE '%$search%')";
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
    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid.']);
    }

} elseif ($method === 'PUT') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id       = (int)($body['id'] ?? 0);
    $status   = mysqli_real_escape_string($conn, $body['status'] ?? '');
    $pkt_date = mysqli_real_escape_string($conn, $body['pkt_date'] ?? '');

    if ($id <= 0 || empty($status)) {
        echo json_encode(['status' => false, 'message' => 'ID dan status wajib diisi']);
        exit;
    }

    $pktDateSql = !empty($pkt_date) ? ", pkt_date = '$pkt_date'" : "";
    $updateQuery = "UPDATE pkt_cv SET 
                    status = '$status'
                    $pktDateSql
                    WHERE id = $id";

    if (mysqli_query($conn, $updateQuery)) {
        echo json_encode(['status' => true, 'message' => 'Status PDI berhasil diubah menjadi PKT']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal memperbarui status']);
    }
}

mysqli_close($conn);
?>
