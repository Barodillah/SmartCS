<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $dnet = mysqli_real_escape_string($conn, $input['dnet'] ?? '');
    
    if (!empty($dnet)) {
        $check = mysqli_query($conn, "SELECT id FROM dissatisfation WHERE dnet = '$dnet'");
        if (mysqli_num_rows($check) > 0) {
            echo json_encode(['status' => false, 'message' => 'Dnet ID sudah tercatat di database (Duplikat).']);
            exit;
        }
    }
    
    $criteria = mysqli_real_escape_string($conn, $input['criteria'] ?? '');
    $sa = mysqli_real_escape_string($conn, $input['sa'] ?? '');
    $tgl_svc = empty($input['tgl_svc']) ? '0000-00-00' : mysqli_real_escape_string($conn, $input['tgl_svc']);
    $tgl_srvy = empty($input['tgl_srvy']) ? '0000-00-00' : mysqli_real_escape_string($conn, $input['tgl_srvy']);
    $nama = mysqli_real_escape_string($conn, $input['nama'] ?? '');
    $telp = mysqli_real_escape_string($conn, $input['telp'] ?? '');
    $rangka = mysqli_real_escape_string($conn, $input['rangka'] ?? '');
    $nopol = mysqli_real_escape_string($conn, $input['nopol'] ?? '');
    $atribut = mysqli_real_escape_string($conn, $input['atribut'] ?? '');
    $keluhan = mysqli_real_escape_string($conn, $input['keluhan'] ?? '');
    
    $query = "INSERT INTO dissatisfation (
                dnet, tgl_svc, tgl_srvy, status, rangka, nama, telp, nopol, criteria, atribut, sa, keluhan
              ) VALUES (
                '$dnet', '$tgl_svc', '$tgl_srvy', 'NEW', '$rangka', '$nama', '$telp', '$nopol', '$criteria', '$atribut', '$sa', '$keluhan'
              )";
              
    if (mysqli_query($conn, $query)) {
        // Sync with konsumen table
        if (!empty($nopol)) {
            $checkKonsumen = mysqli_query($conn, "SELECT nopol FROM konsumen WHERE nopol = '$nopol'");
            if (mysqli_num_rows($checkKonsumen) > 0) {
                mysqli_query($conn, "UPDATE konsumen SET prioritas = 3 WHERE nopol = '$nopol'");
            } else {
                mysqli_query($conn, "INSERT INTO konsumen (nopol, nama, telp, prioritas) VALUES ('$nopol', '$nama', '$telp', 3)");
            }
        }
        
        echo json_encode(['status' => true, 'message' => 'Berhasil mencatat data baru.']);
    } else {
        echo json_encode(['status' => false, 'message' => mysqli_error($conn)]);
    }
}

mysqli_close($conn);
?>
