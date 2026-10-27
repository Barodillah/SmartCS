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

// Ambil parameter ?nopol=
$nopol = isset($_GET['nopol']) ? mysqli_real_escape_string($conn, $_GET['nopol']) : '';

if (empty($nopol)) {
    echo json_encode([
        'status' => false,
        'message' => 'Parameter nopol wajib diisi'
    ]);
    exit;
}

// Ambil data konsumen terbaru
$sql = mysqli_query($conn, "SELECT * FROM konsumen WHERE nopol = '$nopol' ORDER BY id DESC LIMIT 1");
$databooking = mysqli_fetch_assoc($sql);

if (!$databooking) {
    echo json_encode([
        'status' => false,
        'message' => 'Data tidak ditemukan'
    ]);
    exit;
}

// UPDATE: Menambahkan filter status tidak sama dengan INVALID dan CANCEL
$sqlr = mysqli_query($conn, "SELECT * FROM booking WHERE nopol = '$nopol' AND status NOT IN ('INVALID', 'CANCEL') ORDER BY id DESC");

$riwayat = [];
while ($row = mysqli_fetch_assoc($sqlr)) {
    $riwayat[] = [
        'tanggal' => $row['tanggal'],
        'jam' => $row['jam'],
        'jenis' => $row['jenis'],
        'keluhan' => $row['keluhan'],
        'by' => $row['user'],
    ];
}

// Final response
$response = [
    'status' => true,
    'data' => [
        'nama' => $databooking['nama'],
        'kendaraan' => $databooking['kendaraan'],
        'telp' => $databooking['telp'],
        'riwayat' => $riwayat
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);