<?php
// === Sales Survey Link API ===
// Handles survey link operations that require BOTH databases (PDO + Legacy)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/config_legacy.php';

$pdo = getDB();
$conn = getLegacyDB();

// Validate both connections are available
if ($pdo === null && $conn === null) {
    http_response_code(503);
    echo json_encode(['status' => false, 'message' => 'Kedua database sedang tidak tersedia. Silakan coba lagi nanti.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];
    $action = $_POST['action'] ?? ($body['action'] ?? ($_GET['action'] ?? ''));

    if ($action === 'generate_link') {
        // === GENERATE EXTERNAL SURVEY LINK ===
        if ($pdo === null) {
            echo json_encode(['status' => false, 'message' => 'Database utama sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }
        if ($conn === null) {
            echo json_encode(['status' => false, 'message' => 'Database legacy sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }

        $unit_id = (int)($body['unit_id'] ?? ($_POST['unit_id'] ?? 0));
        
        if ($unit_id <= 0) {
            echo json_encode(['status' => false, 'message' => 'Unit ID tidak valid.']);
            exit;
        }

        $uuid = bin2hex(random_bytes(16));
        $uuid = sprintf('%s-%s-%s-%s-%s',
            substr($uuid, 0, 8),
            substr($uuid, 8, 4),
            substr($uuid, 12, 4),
            substr($uuid, 16, 4),
            substr($uuid, 20, 12)
        );
        $expires_at = date('Y-m-d H:i:s', strtotime('+3 days'));

        try {
            $stmt = $pdo->prepare("INSERT INTO survey_external_links (survey_id, uuid, expires_at) VALUES (?, ?, ?)");
            if ($stmt->execute([$unit_id, $uuid, $expires_at])) {
                // Update status in surveyupdate to SURVEY_WA
                mysqli_query($conn, "UPDATE surveyupdate SET status = 'SURVEY_WA' WHERE id = $unit_id");
                
                // Insert log to surveyupdate_record
                mysqli_query($conn, "INSERT INTO surveyupdate_record (id, time, unit_id, status, pkt, note) VALUES (NULL, NULL, $unit_id, 'SURVEY_WA', 'No', 'Link Survey dikirim via WA')");

                $link = "https://csdwindo.com/survey/" . $uuid;
                echo json_encode(['status' => true, 'link' => $link, 'uuid' => $uuid]);
            } else {
                echo json_encode(['status' => false, 'message' => 'Gagal membuat link.']);
            }
        } catch (PDOException $e) {
            echo json_encode(['status' => false, 'message' => 'Gagal membuat link: ' . $e->getMessage()]);
        }
        exit;

    } elseif ($action === 'submit_survey_link') {
        // === SUBMIT EXTERNAL SURVEY ===
        if ($pdo === null) {
            echo json_encode(['status' => false, 'message' => 'Database utama sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }
        if ($conn === null) {
            echo json_encode(['status' => false, 'message' => 'Database legacy sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }

        $uuid = mysqli_real_escape_string($conn, $body['uuid'] ?? '');
        $status = mysqli_real_escape_string($conn, $body['status'] ?? '');
        $est = mysqli_real_escape_string($conn, $body['est'] ?? '');
        $note = mysqli_real_escape_string($conn, $body['note'] ?? '');
        $pkt = mysqli_real_escape_string($conn, $body['pkt'] ?? 'No');

        if (empty($uuid) || empty($status)) {
            echo json_encode(['status' => false, 'message' => 'Data tidak lengkap.']);
            exit;
        }

        // Validate UUID again using PDO
        $stmt = $pdo->prepare("SELECT * FROM survey_external_links WHERE uuid = ? AND is_used = 0 AND expires_at > NOW()");
        $stmt->execute([$uuid]);
        $linkData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$linkData) {
            echo json_encode(['status' => false, 'message' => 'Link tidak valid atau sudah kedaluwarsa/digunakan.']);
            exit;
        }

        $survey_id = (int)$linkData['survey_id'];

        // Update survey_external_links using PDO
        $updateStmt = $pdo->prepare("UPDATE survey_external_links SET is_used = 1, used_at = NOW() WHERE id = ?");
        $updateStmt->execute([$linkData['id']]);

        // Update surveyupdate (Legacy DB via mysqli)
        $updateQuery = "UPDATE surveyupdate SET 
                        status = '$status',
                        est = '$est',
                        note = '$note'
                        WHERE id = $survey_id";
        
        if (mysqli_query($conn, $updateQuery)) {
            // Insert first log: SURVEY_SENT to indicate consumer filled the link
            $logWA = "INSERT INTO surveyupdate_record (id, time, unit_id, status, pkt, note) VALUES (NULL, NULL, $survey_id, 'SURVEY_SENT', 'No', 'Konsumen merespon survey via Link WA')";
            mysqli_query($conn, $logWA);

            // Insert second log: Actual survey result
            $recordQuery = "INSERT INTO surveyupdate_record (id, time, unit_id, status, pkt, note) VALUES (NULL, NULL, $survey_id, '$status', '$pkt', '$note')";
            mysqli_query($conn, $recordQuery);

            echo json_encode(['status' => true, 'message' => 'Terima kasih, survey berhasil dikirim!']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Terjadi kesalahan sistem.']);
        }
        exit;
    }
}

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'get_survey_link') {
        // === GET SURVEY LINK INFO ===
        if ($pdo === null) {
            echo json_encode(['status' => false, 'message' => 'Database utama sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }

        $uuid = $_GET['uuid'] ?? '';
        if (empty($uuid)) {
            echo json_encode(['status' => false, 'message' => 'UUID tidak valid.']);
            exit;
        }

        // Fetch link from new DB via PDO
        $stmt = $pdo->prepare("SELECT * FROM survey_external_links WHERE uuid = ?");
        $stmt->execute([$uuid]);
        $linkData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$linkData) {
            echo json_encode(['status' => false, 'message' => 'Link survey tidak ditemukan.']);
            exit;
        }

        if ($linkData['is_used'] == 1) {
            echo json_encode(['status' => false, 'is_used' => true, 'message' => 'Survey sudah pernah diisi sebelumnya.']);
            exit;
        }

        if (strtotime($linkData['expires_at']) < time()) {
            echo json_encode(['status' => false, 'is_expired' => true, 'message' => 'Link survey sudah kedaluwarsa.']);
            exit;
        }

        if ($conn === null) {
            echo json_encode(['status' => false, 'message' => 'Database legacy sedang tidak tersedia. Silakan coba lagi nanti.']);
            exit;
        }

        // Fetch surveyupdate from legacy DB via mysqli
        $survey_id = (int)$linkData['survey_id'];
        $query = "SELECT nama, telp, kendaraan, rangka, sales, spv, pdi_date, wa_date 
                  FROM surveyupdate 
                  WHERE id = $survey_id";
        $result = mysqli_query($conn, $query);
        $surveyData = mysqli_fetch_assoc($result);

        if (!$surveyData) {
            echo json_encode(['status' => false, 'message' => 'Data survey asli tidak ditemukan.']);
            exit;
        }

        // Merge data
        $data = array_merge($linkData, $surveyData);

        echo json_encode(['status' => true, 'data' => $data]);
        exit;
    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid. Gunakan: get_survey_link']);
    }
}

if ($conn) mysqli_close($conn);
?>
