<?php
// === WA Follow-up API ===
// Dedicated endpoint for WhatsApp follow-up panel
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
    $tab = $_GET['tab'] ?? '';

    if ($tab === 'konfirmasi') {
        // Status REQUEST atau UBAH, tanpa filter tanggal
        $query = "SELECT * FROM booking WHERE status IN ('REQUEST', 'UBAH') ORDER BY time DESC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data]);

    } elseif ($tab === 'h1') {
        // Status BOOKING, tanggal = besok
        $besok = date('Y-m-d', strtotime('+1 day'));
        $query = "SELECT * FROM booking WHERE status = 'BOOKING' AND tanggal = '$besok' ORDER BY jam ASC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data, 'tanggal' => $besok]);

    } elseif ($tab === 'h30') {
        // Status BOOKING, tanggal = hari ini
        $today = date('Y-m-d');
        $query = "SELECT * FROM booking WHERE status = 'BOOKING' AND tanggal = '$today' ORDER BY jam ASC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data, 'tanggal' => $today]);

    } else {
        echo json_encode(['status' => false, 'message' => 'Invalid tab parameter. Use: konfirmasi, h1, h30']);
    }

} elseif ($method === 'PUT') {
    // Update status booking (for konfirmasi -> BOOKING)
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id     = (int)($body['id'] ?? 0);
    $status = mysqli_real_escape_string($conn, $body['status'] ?? '');
    $user   = mysqli_real_escape_string($conn, $body['user'] ?? 'ADMIN');
    $action = mysqli_real_escape_string($conn, $body['action'] ?? 'Whatsapp Konfirmasi');

    if ($id <= 0 || empty($status)) {
        echo json_encode(['status' => false, 'message' => 'ID dan status wajib diisi']);
        exit;
    }

    // Get telp for record
    $oldQuery = mysqli_query($conn, "SELECT telp FROM booking WHERE id = $id");
    $oldData = mysqli_fetch_assoc($oldQuery);
    $telp = $oldData['telp'] ?? '';

    // Update status
    $updateQuery = "UPDATE booking SET status = '$status' WHERE id = $id";
    if (mysqli_query($conn, $updateQuery)) {
        // Insert record
        mysqli_query($conn, "INSERT INTO booking_record VALUES (NULL, $id, NULL, '$user', '$status', '$action', '$telp')");
        echo json_encode(['status' => true, 'message' => "Status berhasil diubah ke $status"]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal mengubah status']);
    }
}

mysqli_close($conn);
?>
