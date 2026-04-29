<?php
// === SmartCS — Dynamic Sitemap Handler ===
require_once __DIR__ . '/api/chat/config.php';

header('Content-Type: application/xml; charset=utf-8');

$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http');
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . "://" . $host;

$db = getDB();

echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// 1. Static Pages
$staticPages = [
    '' => '1.0',
    '/aksesoris' => '0.8',
    '/artikel' => '0.9',
    '/dealer' => '0.8',
    '/pricelist' => '0.9',
    '/llms.txt' => '0.7',
    '/llms-products.txt' => '0.7',
    '/llms-lokasi-dealer.txt' => '0.7',
    '/llms-artikel.txt' => '0.7',
    '/llms-full.txt' => '0.7'
];

foreach ($staticPages as $path => $priority) {
    echo '  <url>' . PHP_EOL;
    echo '    <loc>' . $baseUrl . $path . '</loc>' . PHP_EOL;
    echo '    <changefreq>weekly</changefreq>' . PHP_EOL;
    echo '    <priority>' . $priority . '</priority>' . PHP_EOL;
    echo '  </url>' . PHP_EOL;
}

// 2. Dynamic Articles
try {
    $stmt = $db->query("SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC");
    while ($row = $stmt->fetch()) {
        echo '  <url>' . PHP_EOL;
        echo '    <loc>' . $baseUrl . '/artikel/' . $row['slug'] . '</loc>' . PHP_EOL;
        echo '    <lastmod>' . date('Y-m-d', strtotime($row['updated_at'])) . '</lastmod>' . PHP_EOL;
        echo '    <changefreq>monthly</changefreq>' . PHP_EOL;
        echo '    <priority>0.7</priority>' . PHP_EOL;
        echo '  </url>' . PHP_EOL;
    }
} catch (Exception $e) {
    // Fail silently in sitemap or log error
}

echo '</urlset>';
