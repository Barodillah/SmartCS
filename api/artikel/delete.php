<?php
// === Article Delete API ===
// POST: Delete article by ID
require_once __DIR__ . '/../chat/config.php';

$body = getPostBody();

if (empty($body['id'])) {
    jsonResponse(false, 'ID artikel wajib disertakan.', null, 400);
}

$pdo = getDB();

$id = intval($body['id']);

// Check article exists
$check = $pdo->prepare("SELECT id, title FROM articles WHERE id = ?");
$check->execute([$id]);
$article = $check->fetch();

if (!$article) {
    jsonResponse(false, 'Artikel tidak ditemukan.', null, 404);
}

// Delete article (cascade will handle views, likes, comments)
$stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(true, 'Artikel berhasil dihapus.', [
    'id' => $id,
    'title' => $article['title']
]);
