<?php
// === Konsumen Stats API ===
// Lightweight endpoint for booking frequency distribution
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

$stats = ['0x' => 0, '1x' => 0, '2x' => 0, '3x+' => 0];

// Count consumers with empty tax data
$emptyPajakRes = mysqli_query($conn, "SELECT COUNT(*) as total FROM konsumen WHERE one_year = '' OR five_year = '' OR one_year IS NULL OR five_year IS NULL");
$totalEmptyPajak = 0;
if ($emptyPajakRes) {
    $totalEmptyPajak = (int)mysqli_fetch_assoc($emptyPajakRes)['total'];
}

$stats['empty_pajak'] = $totalEmptyPajak;

// Distribution of Priority (1: Biasa, 2: Loyal, 3: Prioritas)
$priorityRes = mysqli_query($conn, "SELECT prioritas, COUNT(*) as num FROM konsumen GROUP BY prioritas");
$priorityStats = [1 => 0, 2 => 0, 3 => 0];

if ($priorityRes) {
    while ($row = mysqli_fetch_assoc($priorityRes)) {
        $p = (int)$row['prioritas'];
        if ($p >= 1 && $p <= 3) {
            $priorityStats[$p] = (int)$row['num'];
        }
    }
}

echo json_encode([
    'status' => true, 
    'stats' => [
        'empty_pajak' => $stats['empty_pajak'],
        'priority' => [
            'biasa' => $priorityStats[1],
            'loyal' => $priorityStats[2],
            'prioritas' => $priorityStats[3]
        ]
    ]
]);

mysqli_close($conn);
?>
