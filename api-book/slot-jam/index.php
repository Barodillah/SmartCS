<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
date_default_timezone_set("Asia/Jakarta");

$conn = mysqli_connect("localhost", "root", "", "smartcs");

if (!$conn) {
    echo json_encode([
        'status' => false,
        'message' => 'Koneksi database gagal'
    ]);
    exit;
}

// ======================
// PARAMETER
// ======================
$tanggal = isset($_GET['tanggal']) ? mysqli_real_escape_string($conn, $_GET['tanggal']) : '';

if (empty($tanggal)) {
    echo json_encode([
        'status' => false,
        'message' => 'Parameter tanggal wajib diisi (format: YYYY-MM-DD)'
    ]);
    exit;
}

// ======================
// CEK HARI LIBUR
// ======================
$urlLibur = "https://api.kemendesa.link/libur-nasional/api/is-holiday?date=" . urlencode($tanggal);

$contextLibur = stream_context_create([
    'http' => [
        'timeout' => 5,
        'user_agent' => 'SmartCS/1.0'
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
]);

$responseLibur = @file_get_contents($urlLibur, false, $contextLibur);
$dataLibur = $responseLibur ? json_decode($responseLibur, true) : null;

if ($dataLibur && isset($dataLibur['is_holiday']) && $dataLibur['is_holiday'] === true) {
    // Ambil keterangan hari libur dari data.name
    $keterangan = !empty($dataLibur['data']['name']) ? $dataLibur['data']['name'] : 'Hari Libur Nasional';

    // Cek apakah merupakan Cuti Bersama (bisa dari flag boolean is_cuti_bersama atau nama libur)
    $isCutiBersama = !empty($dataLibur['data']['is_cuti_bersama']) || (stripos($keterangan, 'Cuti Bersama') !== false);

    if (!$isCutiBersama) {
        // Jika BUKAN Cuti Bersama, maka benar-benar libur (bengkel tutup, status false)
        echo json_encode([
            'status' => false,
            'tanggal' => $tanggal,
            'keterangan_libur' => $keterangan
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // Jika ada Cuti Bersama, bengkel tetap buka dan skrip lanjut mengeksekusi slot di bawahnya.
}

// ======================
// HARI INDONESIA
// ======================
$hariIndo = [
    'Sunday' => 'Minggu',
    'Monday' => 'Senin',
    'Tuesday' => 'Selasa',
    'Wednesday' => 'Rabu',
    'Thursday' => 'Kamis',
    'Friday' => 'Jumat',
    'Saturday' => 'Sabtu'
];

$hari = $hariIndo[date('l', strtotime($tanggal))];

// ======================
// TOTAL BOOKING
// ======================
$qTotal = mysqli_query($conn, "
    SELECT COUNT(*) as total 
    FROM booking 
    WHERE tanggal = '$tanggal'
");
$total_booking = (int) mysqli_fetch_assoc($qTotal)['total'];

// ======================
// BOOKING PER SLOT JAM
// ======================
// Menggunakan SUBSTRING(jam,1,5) agar mengambil format 'HH:MM'
$query = mysqli_query($conn, "
    SELECT 
        SUBSTRING(jam,1,5) as slot_jam,
        COUNT(*) as total
    FROM booking
    WHERE tanggal = '$tanggal'
    GROUP BY SUBSTRING(jam,1,5)
");

$dataDb = [];
while ($row = mysqli_fetch_assoc($query)) {
    $dataDb[$row['slot_jam']] = (int) $row['total'];
}

// Range jam yang diinginkan (termasuk .30)
$rangeJam = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '13:00',
    '14:00'
];

$jam = [];
foreach ($rangeJam as $j) {
    // Mengecek apakah ada data di database untuk slot jam tersebut
    $jam[$j] = isset($dataDb[$j]) ? $dataDb[$j] : 0;
}

// ======================
// RESPONSE
// ======================
$response = [
    'status' => true,
    'hari' => $hari,
    'tanggal' => $tanggal,
    'total_booking' => $total_booking,
    'jam' => $jam
];

echo json_encode($response, JSON_PRETTY_PRINT);