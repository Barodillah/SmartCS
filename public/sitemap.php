<?php
/**
 * SmartCS — Dynamic Canonical Sitemap Handler
 * Mengikuti standar Bab 3.5 PANDUAN_SEO_AEO_GEO_UNIVERSAL.md:
 * - Hanya memuat URL HTML kanonis berstatus 200
 * - Tanpa /llms*.txt, tanpa <priority> & <changefreq> yang diabaikan Google
 * - Dilengkapi <lastmod> akurat dan file caching + stale fallback
 */

require_once __DIR__ . '/api/config.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=21600, s-maxage=21600');
header('Vary: Accept-Encoding');

$baseUrl = 'https://csdwindo.com';
$cacheFile = sys_get_temp_dir() . '/smartcs_sitemap_v2.xml';
$cacheTtl = 21600; // 6 jam

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl) && !isset($_GET['nocache'])) {
    readfile($cacheFile);
    exit;
}

$priceListMtime = file_exists(__DIR__ . '/knowledge/price_list.json')
    ? date('Y-m-d', filemtime(__DIR__ . '/knowledge/price_list.json'))
    : date('Y-m-d');
$aksesorisMtime = file_exists(__DIR__ . '/knowledge/aksesoris.json')
    ? date('Y-m-d', filemtime(__DIR__ . '/knowledge/aksesoris.json'))
    : date('Y-m-d');
$dealerMtime = file_exists(__DIR__ . '/knowledge/lokasi_dealer.json')
    ? date('Y-m-d', filemtime(__DIR__ . '/knowledge/lokasi_dealer.json'))
    : date('Y-m-d');
$today = date('Y-m-d');

// 1. Halaman Publik Statis Kanonis (Status 200)
$staticPages = [
    '/'              => $today,
    '/price-list'    => $priceListMtime,
    '/lokasi-dealer' => $dealerMtime,
    '/aksesoris'     => $aksesorisMtime,
    '/booking'       => $today,
    '/artikel'       => $today,
    '/faq'           => $today,
    '/kanal-resmi'   => $dealerMtime,
];

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

foreach ($staticPages as $path => $lastmod) {
    $loc = htmlspecialchars($baseUrl . ($path === '/' ? '/' : $path), ENT_XML1 | ENT_QUOTES, 'UTF-8');
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . $loc . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . $lastmod . '</lastmod>' . PHP_EOL;
    $xml .= '  </url>' . PHP_EOL;
}

// 2. Artikel Dinamis (Published)
$db = null;
try {
    $db = getDB();
} catch (Throwable $e) {
    $db = null;
}

if ($db) {
    try {
        $stmt = $db->query("SELECT slug, updated_at, published_at, created_at FROM articles WHERE status = 'published' AND slug IS NOT NULL AND slug != '' ORDER BY COALESCE(published_at, created_at) DESC LIMIT 5000");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $slug = trim($row['slug']);
            if ($slug === '') continue;
            $dateSource = $row['updated_at'] ?: ($row['published_at'] ?: $row['created_at']);
            $lastmod = $dateSource ? date('Y-m-d', strtotime($dateSource)) : $today;
            $loc = htmlspecialchars($baseUrl . '/artikel/' . rawurlencode($slug), ENT_XML1 | ENT_QUOTES, 'UTF-8');

            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . $loc . '</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . $lastmod . '</lastmod>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }
    } catch (Throwable $e) {
        // Jika query gagal dan ada stale cache, gunakan stale cache
        if (file_exists($cacheFile)) {
            readfile($cacheFile);
            exit;
        }
    }
}

$xml .= '</urlset>' . PHP_EOL;

@file_put_contents($cacheFile, $xml);
echo $xml;
