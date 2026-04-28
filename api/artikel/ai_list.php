<?php
// === AI Article Context API ===
// Fetches simplified article data (slug, title, subtitle, image)
// for the AI chatbot to use as fallback recommendations.
require_once __DIR__ . '/../chat/config.php';

$pdo = getDB();

try {
    $sql = "
        SELECT slug, title, subtitle, image 
        FROM articles 
        WHERE status = 'published' 
        ORDER BY created_at DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->query($sql);
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(true, '', $articles);
} catch (Exception $e) {
    jsonResponse(false, 'Failed to fetch AI article context', null, 500);
}
