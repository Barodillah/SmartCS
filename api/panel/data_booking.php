<?php
// === Data Booking Legacy API ===
// Handles CRUD for legacy booking data (u444914729_csdwindo)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
    if (isset($_GET['nopol'])) {
        $nopol = mysqli_real_escape_string($conn, str_replace(' ', '', strtoupper($_GET['nopol'])));
        $res = mysqli_query($conn, "SELECT * FROM konsumen WHERE nopol = '$nopol'");
        if (mysqli_num_rows($res) > 0) {
            $data = mysqli_fetch_assoc($res);
            echo json_encode(['status' => true, 'data' => $data]);
        } else {
            echo json_encode(['status' => false, 'message' => 'Not found']);
        }
        exit;
    }

    if (isset($_GET['search'])) {
        $search = mysqli_real_escape_string($conn, $_GET['search']);
        $query = "SELECT * FROM booking WHERE nama LIKE '%$search%' OR nopol LIKE '%$search%' OR telp LIKE '%$search%' OR keluhan LIKE '%$search%' ORDER BY time DESC LIMIT 50";
        $result = mysqli_query($conn, $query);
        
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        
        echo json_encode(['status' => true, 'data' => $data]);
        exit;
    }

    $date = $_GET['date'] ?? date('Y-m-d');
    $dateEscaped = mysqli_real_escape_string($conn, $date);
    
    $sort = $_GET['sort'] ?? 'time';
    $orderClause = ($sort === 'jam') ? "ORDER BY b.jam ASC" : "ORDER BY b.time DESC";

    // Updated query to include dissatisfaction check and order dynamically
    $query = "SELECT b.*, 
              (SELECT COUNT(*) FROM dissatisfation d WHERE d.nopol = b.nopol) as dissatisfaction_count 
              FROM booking b 
              WHERE b.tanggal = '$dateEscaped' 
              $orderClause";
    
    $result = mysqli_query($conn, $query);
    
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }
    
    echo json_encode(['status' => true, 'data' => $data]);
} elseif ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    
    $user      = mysqli_real_escape_string($conn, $body['user'] ?? 'STAFF');
    $tanggal   = mysqli_real_escape_string($conn, $body['tanggal'] ?? '');
    $jam       = mysqli_real_escape_string($conn, $body['jam'] ?? '');
    $kendaraan = mysqli_real_escape_string($conn, $body['kendaraan'] ?? '');
    $nopol     = mysqli_real_escape_string($conn, str_replace(' ', '', strtoupper($body['nopol'] ?? '')));
    $nama      = mysqli_real_escape_string($conn, strtoupper($body['nama'] ?? ''));
    $telp      = mysqli_real_escape_string($conn, $body['telp'] ?? '');
    $jenis     = mysqli_real_escape_string($conn, $body['jenis'] ?? '');
    $keluhan   = mysqli_real_escape_string($conn, $body['keluhan'] ?? '');
    
    // Check konsumen
    $checkKonsumen = mysqli_query($conn, "SELECT id FROM konsumen WHERE nopol = '$nopol'");
    if (mysqli_num_rows($checkKonsumen) == 0) {
        mysqli_query($conn, "INSERT INTO konsumen (nopol, kendaraan, nama, telp) VALUES ('$nopol', '$kendaraan', '$nama', '$telp')");
    } else {
        mysqli_query($conn, "UPDATE konsumen SET kendaraan = '$kendaraan', nama = '$nama', telp = '$telp' WHERE nopol = '$nopol'");
    }
    
    $status = 'REQUEST';
    $antrian = 0; // Or dummy logic
    
    $query = "INSERT INTO booking (user, tanggal, jam, kendaraan, nopol, nama, telp, jenis, keluhan, status, antrian) 
              VALUES ('$user', '$tanggal', '$jam', '$kendaraan', '$nopol', '$nama', '$telp', '$jenis', '$keluhan', '$status', '$antrian')";
              
    if (mysqli_query($conn, $query)) {
        $id = mysqli_insert_id($conn);
        $recordInfo = "$tanggal - $jam - $kendaraan - $nopol - $nama - $telp - $jenis - $keluhan";
        mysqli_query($conn, "INSERT INTO booking_record (booking_id, user, status, `before`, `after`) 
                             VALUES ($id, '$user', '$status', '', 'New Booking: $recordInfo')");
                             
        echo json_encode(['status' => true, 'message' => 'Booking berhasil ditambahkan']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal menambahkan booking']);
    }
} elseif ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    
    $id        = (int)($body['id'] ?? 0);
    $user      = mysqli_real_escape_string($conn, $body['user'] ?? 'STAFF');
    $tanggal   = mysqli_real_escape_string($conn, $body['tanggal'] ?? '');
    $jam       = mysqli_real_escape_string($conn, $body['jam'] ?? '');
    $kendaraan = mysqli_real_escape_string($conn, $body['kendaraan'] ?? '');
    $nopol     = mysqli_real_escape_string($conn, str_replace(' ', '', strtoupper($body['nopol'] ?? '')));
    $nama      = mysqli_real_escape_string($conn, strtoupper($body['nama'] ?? ''));
    $telp      = mysqli_real_escape_string($conn, $body['telp'] ?? '');
    $jenis     = mysqli_real_escape_string($conn, $body['jenis'] ?? '');
    $keluhan   = mysqli_real_escape_string($conn, $body['keluhan'] ?? '');
    $forceStatus = mysqli_real_escape_string($conn, $body['forceStatus'] ?? '');
    $newStatus = !empty($forceStatus) ? $forceStatus : 'EDIT';
    
    // Check old data for record
    $oldQuery = mysqli_query($conn, "SELECT * FROM booking WHERE id = $id");
    $oldData = mysqli_fetch_assoc($oldQuery);
    
    if (!$oldData) {
        http_response_code(404);
        echo json_encode(['status' => false, 'message' => 'Data tidak ditemukan']);
        exit;
    }
    
    // Update konsumen
    $checkKonsumen = mysqli_query($conn, "SELECT id FROM konsumen WHERE nopol = '$nopol'");
    if (mysqli_num_rows($checkKonsumen) == 0) {
        mysqli_query($conn, "INSERT INTO konsumen (nopol, kendaraan, nama, telp) VALUES ('$nopol', '$kendaraan', '$nama', '$telp')");
    } else {
        mysqli_query($conn, "UPDATE konsumen SET kendaraan = '$kendaraan', nama = '$nama', telp = '$telp' WHERE nopol = '$nopol'");
    }
    
    $query = "UPDATE booking SET 
              user = '$user', tanggal = '$tanggal', jam = '$jam', kendaraan = '$kendaraan', 
              nopol = '$nopol', nama = '$nama', telp = '$telp', jenis = '$jenis', keluhan = '$keluhan', status = '$newStatus' 
              WHERE id = $id";
              
    if (mysqli_query($conn, $query)) {
        $beforeRecord = "{$oldData['user']} - {$oldData['tanggal']} - {$oldData['jam']} - {$oldData['kendaraan']} - {$oldData['nopol']} - {$oldData['nama']} - {$oldData['telp']} - {$oldData['jenis']} - {$oldData['keluhan']} - {$oldData['status']}";
        $afterRecord = "$user - $tanggal - $jam - $kendaraan - $nopol - $nama - $telp - $jenis - $keluhan - $newStatus";
        
        mysqli_query($conn, "INSERT INTO booking_record (booking_id, user, status, `before`, `after`) 
                             VALUES ($id, '$user', '$newStatus', '$beforeRecord', '$afterRecord')");
                             
        echo json_encode(['status' => true, 'message' => 'Booking berhasil diubah']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal mengubah booking']);
    }
} elseif ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $user = mysqli_real_escape_string($conn, $_GET['user'] ?? 'ADMIN');
    
    // Fetch old data before delete
    $oldQuery = mysqli_query($conn, "SELECT * FROM booking WHERE id = $id");
    $oldData = mysqli_fetch_assoc($oldQuery);
    
    if ($oldData && mysqli_query($conn, "DELETE FROM booking WHERE id = $id")) {
        $beforeRecord = "{$oldData['user']} - {$oldData['tanggal']} - {$oldData['jam']} - {$oldData['kendaraan']} - {$oldData['nopol']} - {$oldData['nama']} - {$oldData['telp']} - {$oldData['jenis']} - {$oldData['keluhan']} - {$oldData['status']}";
        mysqli_query($conn, "INSERT INTO booking_record (booking_id, user, status, `before`, `after`) 
                             VALUES ($id, '$user', 'DELETE', '$beforeRecord', 'Booking Deleted')");
                             
        echo json_encode(['status' => true, 'message' => 'Booking berhasil dihapus']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal menghapus booking atau data tidak ditemukan']);
    }
}

mysqli_close($conn);
?>
