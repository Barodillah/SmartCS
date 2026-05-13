<?php
// === Survey Notifications API ===
// Returns survey_external_links with is_used = 1 and used_at within last 24 hours
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

try {
    // Fetch survey links used in last 24 hours
    $stmt = $pdo->prepare("SELECT id, survey_id, uuid, used_at FROM survey_external_links WHERE is_used = 1 AND used_at >= NOW() - INTERVAL 24 HOUR ORDER BY used_at DESC");
    $stmt->execute();
    $links = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($links)) {
        echo json_encode(['status' => true, 'data' => []]);
        exit;
    }

    // Fetch survey details from legacy DB
    $results = [];
    foreach ($links as $link) {
        $survey_id = (int)$link['survey_id'];
        $query = "SELECT nama, telp, kendaraan, rangka, sales, status, est FROM surveyupdate WHERE id = $survey_id";
        $res = mysqli_query($conn, $query);
        $survey = mysqli_fetch_assoc($res);

        if ($survey) {
            $results[] = [
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

    echo json_encode(['status' => true, 'data' => $results]);

} catch (PDOException $e) {
    echo json_encode(['status' => false, 'message' => $e->getMessage()]);
}

mysqli_close($conn);
?>
