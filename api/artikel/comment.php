<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Method not allowed"]);
    exit;
}

require_once '../config.php';
$pdo = getDB();

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->article_id) || !isset($data->comment)) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "Missing required fields"]);
        exit;
    }
    
    $article_id = intval($data->article_id);
    $comment = trim($data->comment);
    $sender_name = isset($data->sender_name) && !empty(trim($data->sender_name)) ? trim($data->sender_name) : 'Anonim';
    $parent_id = isset($data->parent_id) ? intval($data->parent_id) : null;
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
    
    // Auto approve setting (1 = auto approve, 0 = pending)
    $is_approved = 0; 
    
    $query = "INSERT INTO article_comments (article_id, parent_id, sender_name, comment, ip_address, is_approved) 
              VALUES (?, ?, ?, ?, ?, ?)";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$article_id, $parent_id, $sender_name, $comment, $ip_address, $is_approved]);
    
    echo json_encode([
        "status" => true, 
        "message" => "Komentar berhasil ditambahkan",
        "data" => [
            "id" => $pdo->lastInsertId(),
            "sender_name" => $sender_name,
            "comment" => $comment,
            "created_at" => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
