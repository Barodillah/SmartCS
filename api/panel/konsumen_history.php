<?php
// === Konsumen History API ===
// Fetches booking history for a specific consumer by nopol
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $nopol = mysqli_real_escape_string($conn, str_replace(' ', '', strtoupper($_GET['nopol'] ?? '')));
    
    if (empty($nopol)) {
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Nopol is required']);
        exit;
    }

    // 1. Fetch Summary
    $summaryQuery = "SELECT COUNT(*) as total_booking, MAX(tanggal) as last_booking_date FROM booking WHERE nopol = '$nopol'";
    $summaryRes = mysqli_query($conn, $summaryQuery);
    $summary = mysqli_fetch_assoc($summaryRes);

    // 2. Fetch Detail History
    $historyQuery = "SELECT * FROM booking WHERE nopol = '$nopol' ORDER BY tanggal DESC, jam DESC";
    $historyRes = mysqli_query($conn, $historyQuery);
    
    $history = [];
    while ($row = mysqli_fetch_assoc($historyRes)) {
        $history[] = $row;
    }

    echo json_encode([
        'status' => true,
        'summary' => [
            'total_booking' => (int)$summary['total_booking'],
            'last_booking_date' => $summary['last_booking_date'] ?? null,
        ],
        'history' => $history
    ]);
} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
}

mysqli_close($conn);
?>
