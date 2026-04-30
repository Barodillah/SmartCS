<?php
// === Article List API ===
// GET: Fetch all articles with engagement counts
require_once __DIR__ . '/../config.php';

$pdo = getDB();

$status = $_GET['status'] ?? '';
$category = $_GET['category'] ?? '';
$search = $_GET['search'] ?? '';

$where = [];
$params = [];

if ($status) {
    $where[] = "a.status = ?";
    $params[] = $status;
}
if ($category) {
    $where[] = "a.category = ?";
    $params[] = $category;
}
if ($search) {
    $where[] = "a.title LIKE ?";
    $params[] = "%{$search}%";
}

$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

$sql = "
    SELECT 
        a.*,
        COALESCE(v.views_count, 0) AS views_count,
        COALESCE(l.likes_count, 0) AS likes_count,
        COALESCE(c.comments_count, 0) AS comments_count
    FROM articles a
    LEFT JOIN (SELECT article_id, COUNT(*) AS views_count FROM article_views GROUP BY article_id) v ON v.article_id = a.id
    LEFT JOIN (SELECT article_id, COUNT(*) AS likes_count FROM article_likes GROUP BY article_id) l ON l.article_id = a.id
    LEFT JOIN (SELECT article_id, COUNT(*) AS comments_count FROM article_comments WHERE is_approved = 1 GROUP BY article_id) c ON c.article_id = a.id
    {$whereClause}
    ORDER BY a.created_at DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$articles = $stmt->fetchAll();

// Parse JSON fields
foreach ($articles as &$article) {
    $article['gallery'] = $article['gallery'] ? json_decode($article['gallery'], true) : [];
    $article['tags'] = $article['tags'] ? json_decode($article['tags'], true) : [];
    $article['is_featured'] = (bool)$article['is_featured'];
    $article['views_count'] = (int)$article['views_count'];
    $article['likes_count'] = (int)$article['likes_count'];
    $article['comments_count'] = (int)$article['comments_count'];
}

jsonResponse(true, '', $articles);
