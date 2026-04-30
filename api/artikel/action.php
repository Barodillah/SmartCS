<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config.php';
$pdo = getDB();

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->article_id) || !isset($data->action)) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $article_id = intval($data->article_id);
    $action = $data->action; // 'view' or 'like'
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    if ($action === 'view') {
        // Log view
        $stmt = $pdo->prepare("INSERT INTO article_views (article_id, ip_address, user_agent) VALUES (?, ?, ?)");
        $stmt->execute([$article_id, $ip_address, $user_agent]);
        
        echo json_encode(["status" => true, "message" => "View logged"]);
    } 
    else if ($action === 'like') {
        // Check if already liked by this IP
        $stmt = $pdo->prepare("SELECT id FROM article_likes WHERE article_id = ? AND ip_address = ?");
        $stmt->execute([$article_id, $ip_address]);
        
        if ($stmt->rowCount() > 0) {
            // Unlike (Toggle)
            $stmt = $pdo->prepare("DELETE FROM article_likes WHERE article_id = ? AND ip_address = ?");
            $stmt->execute([$article_id, $ip_address]);
            echo json_encode(["status" => true, "action" => "unliked"]);
        } else {
            // Like
            $stmt = $pdo->prepare("INSERT INTO article_likes (article_id, ip_address) VALUES (?, ?)");
            $stmt->execute([$article_id, $ip_address]);
            echo json_encode(["status" => true, "action" => "liked"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Invalid action"]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
