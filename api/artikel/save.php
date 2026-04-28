<?php
// === Article Save API ===
// POST: Create new article
require_once __DIR__ . '/../chat/config.php';

$body = getPostBody();

// Validate required fields
if (empty($body['title']) || empty($body['content'])) {
    jsonResponse(false, 'Title dan content wajib diisi.', null, 400);
}

$pdo = getDB();

// Generate slug from title
$slug = strtolower(trim($body['title']));
$slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
$slug = trim($slug, '-');

// Ensure slug uniqueness
$checkSlug = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE slug = ?");
$checkSlug->execute([$slug]);
if ($checkSlug->fetchColumn() > 0) {
    $slug .= '-' . time();
}

// Prepare gallery JSON
$gallery = null;
if (!empty($body['gallery']) && is_array($body['gallery'])) {
    $filtered = array_filter($body['gallery'], fn($url) => !empty(trim($url)));
    if (!empty($filtered)) {
        $gallery = json_encode(array_values($filtered));
    }
}

// Prepare tags JSON
$tags = null;
if (!empty($body['tags']) && is_array($body['tags'])) {
    $tags = json_encode($body['tags']);
}

// Determine published_at
$status = $body['status'] ?? 'draft';
$publishedAt = null;
if ($status === 'published') {
    $publishedAt = date('Y-m-d H:i:s');
}

$stmt = $pdo->prepare("
    INSERT INTO articles 
        (slug, title, subtitle, category, author, image, content, gallery, tags, read_time, cta_type, status, published_at, is_featured, sort_order)
    VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $slug,
    $body['title'],
    $body['subtitle'] ?? null,
    $body['category'] ?? 'berita',
    $body['author'] ?? 'Mitsubishi Dwindo',
    $body['image'] ?? null,
    $body['content'],
    $gallery,
    $tags,
    $body['read_time'] ?? '3 min read',
    $body['cta_type'] ?? 'test_drive',
    $status,
    $publishedAt,
    !empty($body['is_featured']) ? 1 : 0,
    0
]);

$articleId = $pdo->lastInsertId();

// Create initial engagement record
$engStmt = $pdo->prepare("INSERT INTO article_views (article_id, ip_address, viewed_at) VALUES (?, ?, NOW())");
// We don't create a view yet, just return success

jsonResponse(true, 'Artikel berhasil disimpan.', [
    'id' => (int)$articleId,
    'slug' => $slug,
    'status' => $status
]);
