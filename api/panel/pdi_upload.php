<?php
// === PDI Upload API ===
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
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);
    
    $month = $body['month'] ?? '';
    $rows = $body['rows'] ?? [];

    if (empty($month)) {
        echo json_encode(['status' => false, 'message' => 'Bulan RS wajib diisi.']);
        exit;
    }

    if (empty($rows) || !is_array($rows)) {
        echo json_encode(['status' => false, 'message' => 'Data Excel tidak boleh kosong.']);
        exit;
    }

    $rs_date = mysqli_real_escape_string($conn, $month . '-01');

    $inserted = 0;
    $skipped = 0;

    foreach ($rows as $row) {
        $rangka = isset($row['Rangka']) ? mysqli_real_escape_string($conn, trim($row['Rangka'])) : '';
        $nama = isset($row['Nama']) ? mysqli_real_escape_string($conn, trim($row['Nama'])) : '';
        $note = isset($row['Note']) ? mysqli_real_escape_string($conn, trim($row['Note'])) : '';

        if (empty($rangka)) continue;

        // Check for duplicate rangka
        $checkQuery = "SELECT id FROM pkt_cv WHERE rangka = '$rangka' LIMIT 1";
        $checkResult = mysqli_query($conn, $checkQuery);

        if ($checkResult && mysqli_num_rows($checkResult) > 0) {
            $skipped++;
            continue;
        }

        // Insert new record
        $insertQuery = "INSERT INTO pkt_cv (status, rs, rangka, nama, note, telp, kendaraan, spv, sales) 
                        VALUES ('Belum', '$rs_date', '$rangka', '$nama', '$note', '', '', '', '')";
        
        if (mysqli_query($conn, $insertQuery)) {
            $inserted++;
        }
    }

    echo json_encode([
        'status' => true, 
        'inserted' => $inserted,
        'skipped' => $skipped
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
}

mysqli_close($conn);
?>
