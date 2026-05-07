<?php
// === Upload STNK API ===
// Processes chassis (rangka) and license plate (stnk/nopol) data
// Syncs with surveyupdate and konsumen tables
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
    
    $data = $body['data'] ?? [];
    if (empty($data)) {
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Data tidak boleh kosong']);
        exit;
    }

    $results = [
        'total' => count($data),
        'updated_survey' => 0,
        'inserted_konsumen' => 0,
        'skipped' => 0,
        'errors' => []
    ];

    foreach ($data as $item) {
        $exrangka = mysqli_real_escape_string($conn, strtoupper(trim($item['rangka'] ?? '')));
        $exnopol = mysqli_real_escape_string($conn, strtoupper(str_replace(' ', '', trim($item['stnk'] ?? ''))));

        if (empty($exrangka) || empty($exnopol)) {
            $results['skipped']++;
            continue;
        }

        // 1. Check if rangka exists in surveyupdate
        $surveyQuery = mysqli_query($conn, "SELECT * FROM surveyupdate WHERE rangka = '$exrangka' LIMIT 1");
        if (mysqli_num_rows($surveyQuery) > 0) {
            $surveyData = mysqli_fetch_assoc($surveyQuery);
            $raw_kendaraan = $surveyData['kendaraan'] ?? '';
            $exnama = mysqli_real_escape_string($conn, $surveyData['nama'] ?? '');
            $extelp = mysqli_real_escape_string($conn, '0' . ($surveyData['telp'] ?? ''));

            // Vehicle mapping logic
            $vehicle = 'MITSUBISHI';
            if (stristr($raw_kendaraan, 'XPANDER')) {
                $vehicle = 'MITSUBISHI XPANDER';
            } elseif (stristr($raw_kendaraan, 'PAJERO')) {
                $vehicle = 'MITSUBISHI PAJERO';
            } elseif (stristr($raw_kendaraan, 'DESTINATOR')) {
                $vehicle = 'MITSUBISHI DESTINATOR';
            } elseif (stristr($raw_kendaraan, 'XFORCE')) {
                $vehicle = 'MITSUBISHI XFORCE';
            } elseif (stristr($raw_kendaraan, 'L300')) {
                $vehicle = 'MITSUBISHI L300';
            } elseif (stristr($raw_kendaraan, 'TRITON')) {
                $vehicle = 'MITSUBISHI TRITON';
            } else {
                $vehicle = strtoupper($raw_kendaraan);
            }

            // Update STNK in surveyupdate (always update even if exists)
            mysqli_query($conn, "UPDATE surveyupdate SET stnk = '$exnopol' WHERE rangka = '$exrangka'");
            if (empty($surveyData['stnk']) || $surveyData['stnk'] !== $exnopol) {
                $results['updated_survey']++;
            }

            // 2. Check if nopol already exists in konsumen
            $konsumenCheck = mysqli_query($conn, "SELECT id FROM konsumen WHERE nopol = '$exnopol' LIMIT 1");
            if (mysqli_num_rows($konsumenCheck) === 0) {
                // Insert into konsumen
                $insertQuery = "INSERT INTO konsumen (nopol, kendaraan, nama, telp, one_year, five_year, prioritas) 
                                VALUES ('$exnopol', '$vehicle', '$exnama', '$extelp', '', '', '1')";
                if (mysqli_query($conn, $insertQuery)) {
                    $results['inserted_konsumen']++;
                } else {
                    $results['errors'][] = "Gagal insert konsumen: $exnopol";
                }
            } else {
                $results['skipped']++; // Already exists
            }
        } else {
            $results['skipped']++; // Rangka not found in surveyupdate
        }
    }

    echo json_encode([
        'status' => true,
        'message' => 'Proses upload selesai',
        'results' => $results
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
}

mysqli_close($conn);
?>
