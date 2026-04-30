<?php
// === DINA Chat API — Legacy Booking Sync ===
// Menyimpan data booking ke database lama (u444914729_csdwindo)
// Table: booking & konsumen

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
    exit;
}

// --- Require Legacy Config ---
require_once dirname(__DIR__) . '/config_legacy.php';


// --- Get POST Body ---
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'Invalid JSON body']);
    exit;
}

// --- Extract & Validate Required Fields ---
$tanggal   = $body['tanggal'] ?? '';   // Format: YYYY-MM-DD
$jam       = $body['jam'] ?? '';       // Format: HH:MM
$kendaraan = $body['kendaraan'] ?? '';
$nopol     = $body['nopol'] ?? '';
$nama      = $body['nama'] ?? '';
$telp      = $body['telp'] ?? '';
$jenis     = $body['jenis'] ?? '';
$keluhan   = $body['keluhan'] ?? '';

// Validate minimum required
if (empty($tanggal) || empty($nopol) || empty($nama)) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'tanggal, nopol, dan nama wajib diisi']);
    exit;
}

// --- Convert all values to UPPERCASE ---
$tanggal   = strtoupper(trim($tanggal));
$jam       = strtoupper(trim($jam));
$kendaraan = strtoupper(trim($kendaraan));
$nopol     = strtoupper(str_replace(' ', '', trim($nopol)));
$nama      = strtoupper(trim($nama));
$telp      = trim($telp); // phone stays as-is (digits only)
$jenis     = strtoupper(trim($jenis));
$keluhan   = strtoupper(trim($keluhan));

$conn = getLegacyDB();

// ============================================================
// 1. Check if konsumen exists by nopol, if not — insert new
// ============================================================
$nopolEscaped = mysqli_real_escape_string($conn, $nopol);
$checkKonsumen = mysqli_query($conn, "SELECT id FROM konsumen WHERE nopol = '{$nopolEscaped}' LIMIT 1");

$konsumenInserted = false;
if ($checkKonsumen && mysqli_num_rows($checkKonsumen) === 0) {
    // Konsumen belum ada, simpan baru
    $stmt = mysqli_prepare($conn, "INSERT INTO konsumen (nopol, kendaraan, nama, telp, one_year, five_year, prioritas) VALUES (?, ?, ?, ?, NULL, NULL, 0)");
    mysqli_stmt_bind_param($stmt, "ssss", $nopol, $kendaraan, $nama, $telp);
    $konsumenInserted = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);
}

// ============================================================
// 2. Insert into booking table
// ============================================================
$status = 'REQUEST';
$user   = 'CHATBOT';

$antrian = 0;
$stmt = mysqli_prepare($conn, "INSERT INTO booking (tanggal, jam, kendaraan, nopol, nama, telp, jenis, keluhan, status, user, antrian) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
mysqli_stmt_bind_param($stmt, "ssssssssssi", $tanggal, $jam, $kendaraan, $nopol, $nama, $telp, $jenis, $keluhan, $status, $user, $antrian);
$bookingInserted = mysqli_stmt_execute($stmt);
$bookingError = mysqli_stmt_error($stmt);
$bookingId = mysqli_stmt_insert_id($stmt);
mysqli_stmt_close($stmt);

mysqli_close($conn);

if ($bookingInserted) {
    echo json_encode([
        'status' => true,
        'message' => 'Booking berhasil disimpan ke database legacy',
        'data' => [
            'booking_id' => $bookingId,
            'konsumen_new' => $konsumenInserted,
            'nopol' => $nopol,
            'tanggal' => $tanggal,
            'jam' => $jam
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => false, 'message' => 'Gagal menyimpan booking', 'error' => $bookingError]);
}
