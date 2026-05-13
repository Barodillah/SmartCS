<?php
// === Combined Notifications API ===
// Single endpoint for all panel notifications to minimize DB connections
// Replaces: data_booking.php?status=INDIKASI_KOMPLEN + survey_notifications.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/config_legacy.php';

$pdo = getDB();
$conn = getLegacyDB();

$response = [
    'status' => true,
    'indikasi_komplen' => [],
    'survey_masuk' => []
];

// --- 1. Indikasi Komplen (from legacy booking table) ---
if ($conn) {
    $result = mysqli_query($conn, "SELECT * FROM booking WHERE status = 'INDIKASI_KOMPLEN' ORDER BY time DESC LIMIT 50");
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $response['indikasi_komplen'][] = $row;
        }
    }
}

// --- 2. Survey Masuk (survey_external_links used in last 24h) ---
if ($pdo && $conn) {
    try {
        $stmt = $pdo->prepare("SELECT id, survey_id, uuid, used_at FROM survey_external_links WHERE is_used = 1 AND used_at >= NOW() - INTERVAL 24 HOUR ORDER BY used_at DESC");
        $stmt->execute();
        $links = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($links)) {
            // Fix N+1: batch fetch all survey data in one query
            $surveyIds = array_map(function ($l) { return (int)$l['survey_id']; }, $links);
            $placeholders = implode(',', $surveyIds);
            $surveyRes = mysqli_query($conn, "SELECT id, nama, telp, kendaraan, rangka, sales, status, est FROM surveyupdate WHERE id IN ($placeholders)");

            $surveyMap = [];
            if ($surveyRes) {
                while ($row = mysqli_fetch_assoc($surveyRes)) {
                    $surveyMap[$row['id']] = $row;
                }
            }

            foreach ($links as $link) {
                $sid = (int)$link['survey_id'];
                if (isset($surveyMap[$sid])) {
                    $survey = $surveyMap[$sid];
                    $response['survey_masuk'][] = [
                        'id' => $link['id'],
                        'survey_id' => $link['survey_id'],
                        'nama' => $survey['nama'],
                        'kendaraan' => $survey['kendaraan'],
                        'rangka' => $survey['rangka'],
                        'sales' => $survey['sales'],
                        'status' => $survey['status'],
                        'est' => $survey['est'],
                        'used_at' => $link['used_at']
                    ];
                }
            }
        }
    } catch (PDOException $e) {
        error_log('notifications_combined survey error: ' . $e->getMessage());
    }
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

if ($conn) mysqli_close($conn);
?>
