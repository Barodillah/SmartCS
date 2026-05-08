<?php
// === Potensi Booking API ===
// Handles logic for potential follow-ups based on service history and PKT
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

$type = $_GET['type'] ?? 'all'; // 'booking' or 'pkt' or 'all'

$response = [
    'status' => true,
    'data' => [
        'booking' => [
            '6_bulan' => [],
            '12_bulan' => [],
            '18_bulan' => [],
            '24_bulan' => []
        ],
        'pkt' => [
            '1k' => [],
            '10k' => [],
            '20k' => [],
            '30k' => [],
            '40k' => [],
            '50k' => [],
            '60k' => []
        ]
    ]
];

// 1. Logic for Data Booking
if ($type === 'all' || $type === 'booking') {
    $intervals = [6, 12, 18, 24];
    foreach ($intervals as $mo) {
        $key = $mo . '_bulan';
        // Ambil data booking terakhir per nopol yang jatuh tempo dalam 14 hari ke depan
        $query = "SELECT b.nopol as plate, b.nama as name, b.telp as phone, b.kendaraan as model, b.tanggal as last_service
                  FROM booking b
                  INNER JOIN (
                      SELECT nopol, MAX(tanggal) as max_tanggal
                      FROM booking
                      GROUP BY nopol
                  ) latest ON b.nopol = latest.nopol AND b.tanggal = latest.max_tanggal
                  WHERE b.status != 'INVALID' 
                  AND DATE_ADD(b.tanggal, INTERVAL $mo MONTH) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
                  GROUP BY b.nopol
                  ORDER BY last_service ASC";
        
        $result = mysqli_query($conn, $query);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $row['potential'] = "$mo Bulan dari Service Terakhir";
                $response['data']['booking'][$key][] = $row;
            }
        }
    }
}

// 2. Logic for Data PKT
if ($type === 'all' || $type === 'pkt') {
    // Mapping PKT KM to months
    $pkt_map = [
        '1k'  => 1,
        '10k' => 6,
        '20k' => 12,
        '30k' => 18,
        '40k' => 24,
        '50k' => 30,
        '60k' => 36
    ];

    foreach ($pkt_map as $label => $mo) {
        // Ambil data survey yang wa_date (tgl delivery) jika ditambahkan X bulan jatuh tempo dalam 14 hari ke depan
        $query = "SELECT id, nama as name, telp as phone, kendaraan as model, stnk as plate, rangka, wa_date as last_service
                  FROM surveyupdate
                  WHERE status != 'PDI'
                  AND wa_date IS NOT NULL AND wa_date != '0000-00-00'
                  AND DATE_ADD(wa_date, INTERVAL $mo MONTH) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
                  ORDER BY wa_date ASC";
        
        $result = mysqli_query($conn, $query);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $row['potential'] = "Potensi Service " . strtoupper(str_replace('k', '.000', $label)) . " KM";
                $response['data']['pkt'][$label][] = $row;
            }
        }
    }
}

echo json_encode($response);
mysqli_close($conn);
?>
