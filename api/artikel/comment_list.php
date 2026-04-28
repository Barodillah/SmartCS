<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../chat/config.php';
$pdo = getDB();

try {
    if (!isset($_GET['article_id'])) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Missing article_id"]);
        exit;
    }
    
    $article_id = intval($_GET['article_id']);
    
    $query = "SELECT id, parent_id, sender_name, sender_type, comment, created_at 
              FROM article_comments 
              WHERE article_id = ? AND is_approved = 1 
              ORDER BY created_at ASC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$article_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "status" => true, 
        "data" => $comments
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
