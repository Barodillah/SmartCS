<?php
// === AI Article Context API ===
// Fetches simplified article data (slug, title, subtitle, image, tags)
// for the AI chatbot to use as fallback recommendations.
require_once __DIR__ . '/../config.php';

$pdo = getDB();

$keyword = isset($_GET['keyword']) ? trim($_GET['keyword']) : '';
$slugs = isset($_GET['slugs']) ? array_filter(explode(',', $_GET['slugs'])) : [];

try {
    if (!empty($slugs)) {
        // Fetch specific articles by slugs
        $placeholders = implode(',', array_fill(0, count($slugs), '?'));
        $sql = "
            SELECT slug, title, subtitle, image, tags 
            FROM articles 
            WHERE status = 'published' 
            AND slug IN ($placeholders)
            ORDER BY created_at DESC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($slugs));
    } else if (!empty($keyword)) {
        // ... (existing keyword search logic)
        // Split keywords by space and limit to top 3 for performance
        $words = array_filter(explode(' ', $keyword));
        $words = array_slice($words, 0, 3);
        
        $whereClauses = [];
        $params = [];
        
        foreach ($words as $index => $word) {
            $pTitle = "t$index";
            $pSubtitle = "s$index";
            $pTags = "g$index";
            $pContent = "c$index";
            
            $whereClauses[] = "(title LIKE :$pTitle OR subtitle LIKE :$pSubtitle OR tags LIKE :$pTags OR content LIKE :$pContent)";
            
            $searchTerm = '%' . $word . '%';
            $params[$pTitle] = $searchTerm;
            $params[$pSubtitle] = $searchTerm;
            $params[$pTags] = $searchTerm;
            $params[$pContent] = $searchTerm;
        }
        
        $whereSql = implode(' OR ', $whereClauses);

        $sql = "
            SELECT slug, title, subtitle, image, tags 
            FROM articles 
            WHERE status = 'published' 
            AND ($whereSql)
            ORDER BY created_at DESC
            LIMIT 10
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        $sql = "
            SELECT slug, title, subtitle, image, tags 
            FROM articles 
            WHERE status = 'published' 
            ORDER BY created_at DESC
            LIMIT 10
        ";
        $stmt = $pdo->query($sql);
    }
    
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    jsonResponse(true, '', $articles);
} catch (Exception $e) {
    jsonResponse(false, 'Failed to fetch AI article context: ' . $e->getMessage(), null, 500);
}
