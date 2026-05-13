<?php
// === Upload Kedatangan API ===
// Handles bulk upload for walk-in / arrival data
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
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!isset($body['data']) || !is_array($body['data'])) {
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Format data tidak valid']);
        exit;
    }

    $user = mysqli_real_escape_string($conn, $body['user'] ?? 'ADMIN');
    $records = $body['data'];
    $successCount = 0;
    $skipCount = 0;
    $errorCount = 0;

    mysqli_begin_transaction($conn);

    try {
        foreach ($records as $item) {
            $tanggal   = mysqli_real_escape_string($conn, $item['tanggal'] ?? '');
            $jam       = mysqli_real_escape_string($conn, $item['jam'] ?? '');
            $nama      = mysqli_real_escape_string($conn, strtoupper($item['nama'] ?? ''));
            $telp      = mysqli_real_escape_string($conn, $item['telp'] ?? '');
            $kendaraan = mysqli_real_escape_string($conn, $item['kendaraan'] ?? '');
            $nopol     = mysqli_real_escape_string($conn, str_replace(' ', '', strtoupper($item['nopol'] ?? '')));
            $jenis     = mysqli_real_escape_string($conn, $item['jenis'] ?? '');
            $keluhan   = ''; // Default empty keluhan

            if (empty($tanggal) || empty($nopol)) {
                $errorCount++;
                continue;
            }

            // Sync Konsumen
            $checkKonsumen = mysqli_query($conn, "SELECT id FROM konsumen WHERE nopol = '$nopol'");
            if (mysqli_num_rows($checkKonsumen) == 0) {
                mysqli_query($conn, "INSERT INTO konsumen (nopol, kendaraan, nama, telp) VALUES ('$nopol', '$kendaraan', '$nama', '$telp')");
            } else {
                mysqli_query($conn, "UPDATE konsumen SET kendaraan = '$kendaraan', nama = '$nama', telp = '$telp' WHERE nopol = '$nopol'");
            }

            // Check existing booking
            $checkBooking = mysqli_query($conn, "SELECT * FROM booking WHERE tanggal = '$tanggal' AND nopol = '$nopol' LIMIT 1");
            
            if (mysqli_num_rows($checkBooking) > 0) {
                $oldData = mysqli_fetch_assoc($checkBooking);
                $id = $oldData['id'];
                
                $query = "UPDATE booking SET status = 'DATANG', jenis = '$jenis' WHERE id = $id";
                if (mysqli_query($conn, $query)) {
                    $beforeRecord = "{$oldData['user']} - {$oldData['tanggal']} - {$oldData['jam']} - {$oldData['kendaraan']} - {$oldData['nopol']} - {$oldData['nama']} - {$oldData['telp']} - {$oldData['jenis']} - {$oldData['keluhan']} - {$oldData['status']}";
                    $afterRecord = "$user - {$oldData['tanggal']} - {$oldData['jam']} - {$oldData['kendaraan']} - {$oldData['nopol']} - {$oldData['nama']} - {$oldData['telp']} - $jenis - {$oldData['keluhan']} - DATANG";
                    
                    $recordStatus = (strtoupper($oldData['status']) === 'DATANG') ? 'IMPORT_UPDATE' : 'IMPORT';
                    
                    mysqli_query($conn, "INSERT INTO booking_record (booking_id, user, status, `before`, `after`) 
                                         VALUES ($id, '$user', '$recordStatus', '$beforeRecord', '$afterRecord')");
                    $successCount++;
                } else {
                    $errorCount++;
                }

            } else {
                // Insert new WALK IN
                $status = 'WALK IN';
                $antrian = 0;
                
                $query = "INSERT INTO booking (user, tanggal, jam, kendaraan, nopol, nama, telp, jenis, keluhan, status, antrian) 
                          VALUES ('$user', '$tanggal', '$jam', '$kendaraan', '$nopol', '$nama', '$telp', '$jenis', '$keluhan', '$status', '$antrian')";
                          
                if (mysqli_query($conn, $query)) {
                    $id = mysqli_insert_id($conn);
                    $recordInfo = "$tanggal - $jam - $kendaraan - $nopol - $nama - $telp - $jenis - $keluhan";
                    mysqli_query($conn, "INSERT INTO booking_record (booking_id, user, status, `before`, `after`) 
                                         VALUES ($id, '$user', 'IMPORT', '', 'New Walk In: $recordInfo')");
                    $successCount++;
                } else {
                    $errorCount++;
                }
            }
        }
        
        mysqli_commit($conn);
        echo json_encode([
            'status' => true, 
            'message' => "Proses selesai: $successCount berhasil, $skipCount dilewati, $errorCount gagal."
        ]);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method Not Allowed']);
}

mysqli_close($conn);
?>
