<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../chat/config.php';
$pdo = getDB();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!isset($_GET['article_id'])) {
            http_response_code(400);
            echo json_encode(["status" => false, "message" => "Missing article_id"]);
            exit;
        }
        
        $article_id = intval($_GET['article_id']);
        
        $query = "SELECT id, parent_id, sender_name, sender_type, comment, is_approved, created_at, ip_address 
                  FROM article_comments 
                  WHERE article_id = ? 
                  ORDER BY created_at DESC";
                  
        $stmt = $pdo->prepare($query);
        $stmt->execute([$article_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fetch Stats
        $stats = [
            'views' => ['total' => 0, 'unique_ip' => 0],
            'likes' => ['total' => 0, 'unique_ip' => 0],
            'comments' => ['total' => 0, 'unique_ip' => 0]
        ];

        $stmt = $pdo->prepare("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ip FROM article_views WHERE article_id = ?");
        $stmt->execute([$article_id]);
        $stats['views'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: $stats['views'];

        $stmt = $pdo->prepare("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ip FROM article_likes WHERE article_id = ?");
        $stmt->execute([$article_id]);
        $stats['likes'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: $stats['likes'];

        $stmt = $pdo->prepare("SELECT COUNT(*) as total, COUNT(DISTINCT ip_address) as unique_ip FROM article_comments WHERE article_id = ?");
        $stmt->execute([$article_id]);
        $stats['comments'] = $stmt->fetch(PDO::FETCH_ASSOC) ?: $stats['comments'];
        
        echo json_encode([
            "status" => true, 
            "data" => $comments,
            "stats" => $stats
        ]);
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->action) || !isset($data->id)) {
            http_response_code(400);
            echo json_encode(["status" => false, "message" => "Missing required fields"]);
            exit;
        }
        
        $id = intval($data->id);
        
        if ($data->action === 'approve') {
            $stmt = $pdo->prepare("UPDATE article_comments SET is_approved = 1 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => true, "message" => "Komentar berhasil disetujui"]);
        } else if ($data->action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM article_comments WHERE id = ? OR parent_id = ?");
            $stmt->execute([$id, $id]);
            echo json_encode(["status" => true, "message" => "Komentar berhasil dihapus"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => false, "message" => "Invalid action"]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
