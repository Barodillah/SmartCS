<?php
// === SmartCS — Booking Record Logs API ===
// Mengambil log data booking dari table booking_record di database legacy

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
    exit;
}

// --- Require Legacy Config ---
require_once dirname(__DIR__) . '/config_legacy.php';

$booking_id = $_GET['booking_id'] ?? '';

if (empty($booking_id)) {
    http_response_code(400);
    echo json_encode(['status' => false, 'message' => 'booking_id is required']);
    exit;
}

$conn = getLegacyDB();
$booking_id = mysqli_real_escape_string($conn, $booking_id);

// Fetch logs from booking_record table
$query = "SELECT * FROM booking_record WHERE booking_id = '$booking_id' ORDER BY time DESC";
$result = mysqli_query($conn, $query);

$logs = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $logs[] = [
            'id' => (int)$row['id'],
            'booking_id' => (int)$row['booking_id'],
            'time' => $row['time'],
            'user' => $row['user'],
            'status' => $row['status'],
            'before' => $row['before'],
            'after' => $row['after']
        ];
    }
}

mysqli_close($conn);

echo json_encode([
    'status' => true,
    'data' => $logs
]);
