<?php
// === Article Update API ===
// POST: Update article fields (full or partial)
require_once __DIR__ . '/../chat/config.php';

$body = getPostBody();

if (empty($body['id'])) {
    jsonResponse(false, 'ID artikel wajib disertakan.', null, 400);
}

$pdo = getDB();

$id = intval($body['id']);

// Check article exists
$check = $pdo->prepare("SELECT id, status, published_at FROM articles WHERE id = ?");
$check->execute([$id]);
$article = $check->fetch();

if (!$article) {
    jsonResponse(false, 'Artikel tidak ditemukan.', null, 404);
}

// Build dynamic UPDATE query
$fields = [];
$params = [];

$updatableFields = ['title', 'subtitle', 'category', 'author', 'image', 'content', 'read_time', 'cta_type', 'status', 'is_featured'];

foreach ($updatableFields as $field) {
    if (isset($body[$field])) {
        if ($field === 'is_featured') {
            $fields[] = "$field = ?";
            $params[] = !empty($body[$field]) ? 1 : 0;
        } else {
            $fields[] = "$field = ?";
            $params[] = $body[$field];
        }
    }
}

// Handle slug regeneration if title changed
if (isset($body['title'])) {
    $slug = strtolower(trim($body['title']));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    
    $checkSlug = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE slug = ? AND id != ?");
    $checkSlug->execute([$slug, $id]);
    if ($checkSlug->fetchColumn() > 0) {
        $slug .= '-' . time();
    }
    $fields[] = "slug = ?";
    $params[] = $slug;
}

// Handle gallery JSON
if (isset($body['gallery']) && is_array($body['gallery'])) {
    $filtered = array_filter($body['gallery'], fn($url) => !empty(trim($url)));
    $fields[] = "gallery = ?";
    $params[] = !empty($filtered) ? json_encode(array_values($filtered)) : null;
}

// Handle tags JSON
if (isset($body['tags']) && is_array($body['tags'])) {
    $fields[] = "tags = ?";
    $params[] = json_encode($body['tags']);
}

// Handle published_at based on status changes
if (isset($body['status'])) {
    if ($body['status'] === 'published' && empty($article['published_at'])) {
        $fields[] = "published_at = ?";
        $params[] = date('Y-m-d H:i:s');
    }
}

if (empty($fields)) {
    jsonResponse(false, 'Tidak ada field yang diperbarui.', null, 400);
}

$params[] = $id;
$sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = ?";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

jsonResponse(true, 'Artikel berhasil diperbarui.', [
    'id' => $id,
    'status' => $body['status'] ?? $article['status']
]);
