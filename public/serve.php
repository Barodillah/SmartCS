<?php
/**
 * ============================================================
 * SmartCS — Social Media Preview Server (OG Meta Pre-renderer)
 * ============================================================
 * 
 * Intercepts requests from social media crawlers (Facebook, Twitter,
 * WhatsApp, Telegram, LinkedIn, etc.) and serves proper Open Graph
 * meta tags so link previews show the correct title, description,
 * and image for each page.
 *
 * For normal users/browsers, the request falls through to the
 * SPA (index.html) via .htaccess.
 */

// ── Site Configuration ──────────────────────────────────────
$SITE_URL = 'https://csdwindo.com';
$SITE_NAME = 'Mitsubishi Dwindo Bintaro';
$DEFAULT_OG = [
    'title' => 'Mitsubishi Motors Dwindo Bintaro | Dealer Resmi & Layanan Cerdas',
    'description' => 'Dealer Resmi Mitsubishi Motors Dwindo Bintaro. Dapatkan layanan terbaik 24/7 dari Virtual Assistant DINA untuk informasi Promo, Test Drive, Booking Service, Sparepart, dan lainnya dengan mudah dan cepat.',
    'image' => $SITE_URL . '/dina.png',
    'type' => 'website',
];

// ── Database Configuration ──────────────────────────────────
define('DB_HOST', '153.92.15.23');
define('DB_NAME', '');
define('DB_USER', 'u444914729_smartcs');
define('DB_PASS', '');

function getDB()
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            return null;
        }
    }
    return $pdo;
}

// ── Crawler Detection ───────────────────────────────────────
function isCrawler()
{
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $crawlers = [
        'facebookexternalhit',
        'Facebot',
        'Twitterbot',
        'LinkedInBot',
        'WhatsApp',
        'TelegramBot',
        'Slackbot',
        'Discordbot',
        'Pinterest',
        'Googlebot',
        'bingbot',
        'Applebot',
        'Slurp',
        'DuckDuckBot',
        'ia_archiver',
        'Embedly',
        'Quora Link Preview',
        'Showyoubot',
        'outbrain',
        'Swiftbot',
        'vkShare',
        'W3C_Validator',
        'redditbot',
        'Mediapartners-Google',
        'AdsBot-Google',
        'Google-InspectionTool',
    ];

    foreach ($crawlers as $crawler) {
        if (stripos($ua, $crawler) !== false) {
            return true;
        }
    }
    return false;
}

// ── Route Matching & OG Data Resolver ───────────────────────
function resolveOG($path, $siteUrl, $defaultOG)
{
    $og = $defaultOG;
    $og['url'] = $siteUrl . $path;

    // ─── Home Page ───
    if ($path === '/' || $path === '') {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if (strpos($host, 'booking.') === 0) {
            $og['title'] = 'Booking Service Mitsubishi Bintaro';
            $og['description'] = 'Jadwalkan layanan servis bengkel resmi Mitsubishi Motors Dwindo Bintaro. Cepat, mudah, dan bebas antre via online.';
            $og['image'] = $siteUrl . '/logo/mitsubishi-motors/logo_text_black.png';
            return $og;
        }
        // Use default OG
        return $og;
    }

    // ─── Booking Service ───
    if ($path === '/booking') {
        $og['title'] = 'Booking Service Mitsubishi Bintaro';
        $og['description'] = 'Jadwalkan layanan servis bengkel resmi Mitsubishi Motors Dwindo Bintaro. Cepat, mudah, dan bebas antre via online.';
        $og['image'] = $siteUrl . '/logo/mitsubishi-motors/logo_text_black.png';
        return $og;
    }

    // ─── Price List ───
    if ($path === '/price-list') {
        $og['title'] = 'Daftar Harga Kendaraan Mitsubishi 2026 | Dwindo Bintaro';
        $og['description'] = 'Lihat daftar harga terbaru seluruh lini kendaraan Mitsubishi Motors: Xpander, Pajero Sport, Xforce, Triton, L300, dan Colt Diesel. Promo dan paket kredit tersedia.';
        $og['image'] = $siteUrl . '/dina.png';
        return $og;
    }

    // ─── Lokasi Dealer ───
    if ($path === '/lokasi-dealer') {
        $og['title'] = 'Lokasi Dealer Mitsubishi Dwindo Bintaro | Peta & Alamat';
        $og['description'] = 'Temukan lokasi dealer resmi Mitsubishi Motors Dwindo di Bintaro, Tangerang Selatan. Lengkap dengan peta, alamat, dan kontak langsung.';
        $og['image'] = $siteUrl . '/dina.png';
        return $og;
    }

    // ─── Aksesoris ───
    if ($path === '/aksesoris') {
        $og['title'] = 'Aksesoris Resmi Mitsubishi | Dwindo Bintaro';
        $og['description'] = 'Lengkapi kendaraan Mitsubishi Anda dengan aksesoris resmi: body kit, kamera 360, head unit, dan lainnya. Garansi resmi Mitsubishi Motors.';
        $og['image'] = $siteUrl . '/dina.png';
        return $og;
    }

    // ─── Artikel List ───
    if ($path === '/artikel') {
        $og['title'] = 'Berita & Info Otomotif Mitsubishi | Dwindo Bintaro';
        $og['description'] = 'Baca berita terbaru, tips perawatan, info promo, dan insight dunia otomotif Mitsubishi Motors dari dealer resmi Dwindo Bintaro.';
        $og['image'] = $siteUrl . '/dina.png';
        return $og;
    }

    // ─── Artikel Detail (Dynamic) ───
    if (preg_match('#^/artikel/([^/]+)$#', $path, $matches)) {
        $identifier = $matches[1];
        $article = fetchArticle($identifier);

        if ($article) {
            $og['title'] = $article['title'] . ' | ' . 'Mitsubishi Dwindo Bintaro';
            $og['description'] = $article['subtitle']
                ? mb_substr(strip_tags($article['subtitle']), 0, 200)
                : mb_substr(strip_tags($article['content']), 0, 200);
            $og['type'] = 'article';

            // Use article image, with fallback
            if (!empty($article['image'])) {
                // If image starts with /, make it absolute
                if (strpos($article['image'], 'http') === 0) {
                    $og['image'] = $article['image'];
                } else {
                    $og['image'] = $siteUrl . $article['image'];
                }
            }

            // Extra article-specific meta
            $og['article_author'] = $article['author'] ?? 'Mitsubishi Dwindo';
            $og['article_published_at'] = $article['published_at'] ?? $article['created_at'];
            $og['article_category'] = $article['category'] ?? '';
            $og['article_tags'] = [];
            if (!empty($article['tags'])) {
                $tags = is_string($article['tags']) ? json_decode($article['tags'], true) : $article['tags'];
                $og['article_tags'] = is_array($tags) ? $tags : [];
            }
        }

        return $og;
    }

    // ─── Chat History ───
    if ($path === '/chat-history') {
        $og['title'] = 'Riwayat Chat DINA | Asisten Virtual Mitsubishi';
        $og['description'] = 'Lihat kembali riwayat percakapan Anda dengan DINA, asisten virtual AI dari dealer Mitsubishi Dwindo Bintaro.';
        $og['image'] = $siteUrl . '/dina.png';
        return $og;
    }

    return $og;
}

// ── Fetch Article from Database ─────────────────────────────
function fetchArticle($identifier)
{
    $pdo = getDB();
    if (!$pdo)
        return null;

    try {
        // Try by slug first, then by ID
        if (is_numeric($identifier)) {
            $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ? AND status = 'published' LIMIT 1");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published' LIMIT 1");
        }
        $stmt->execute([$identifier]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        return null;
    }
}

// ── HTML Renderer for Crawlers ──────────────────────────────
function renderOGPage($og, $siteUrl, $siteName)
{
    $title = htmlspecialchars($og['title'] ?? '', ENT_QUOTES, 'UTF-8');
    $description = htmlspecialchars($og['description'] ?? '', ENT_QUOTES, 'UTF-8');
    $image = htmlspecialchars($og['image'] ?? '', ENT_QUOTES, 'UTF-8');
    $url = htmlspecialchars($og['url'] ?? $siteUrl, ENT_QUOTES, 'UTF-8');
    $type = htmlspecialchars($og['type'] ?? 'website', ENT_QUOTES, 'UTF-8');
    $siteName = htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8');

    $html = '<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>' . $title . '</title>
    <meta name="title" content="' . $title . '">
    <meta name="description" content="' . $description . '">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="' . $type . '">
    <meta property="og:url" content="' . $url . '">
    <meta property="og:title" content="' . $title . '">
    <meta property="og:description" content="' . $description . '">
    <meta property="og:image" content="' . $image . '">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="' . $siteName . '">
    <meta property="og:locale" content="id_ID">';

    // Article-specific meta
    if ($type === 'article') {
        if (!empty($og['article_author'])) {
            $html .= '
    <meta property="article:author" content="' . htmlspecialchars($og['article_author'], ENT_QUOTES, 'UTF-8') . '">';
        }
        if (!empty($og['article_published_at'])) {
            $html .= '
    <meta property="article:published_time" content="' . htmlspecialchars($og['article_published_at'], ENT_QUOTES, 'UTF-8') . '">';
        }
        if (!empty($og['article_category'])) {
            $html .= '
    <meta property="article:section" content="' . htmlspecialchars($og['article_category'], ENT_QUOTES, 'UTF-8') . '">';
        }
        if (!empty($og['article_tags']) && is_array($og['article_tags'])) {
            foreach ($og['article_tags'] as $tag) {
                $html .= '
    <meta property="article:tag" content="' . htmlspecialchars($tag, ENT_QUOTES, 'UTF-8') . '">';
            }
        }
    }

    $html .= '

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="' . $url . '">
    <meta name="twitter:title" content="' . $title . '">
    <meta name="twitter:description" content="' . $description . '">
    <meta name="twitter:image" content="' . $image . '">

    <!-- Redirect for normal browsers (fallback) -->
    <link rel="canonical" href="' . $url . '">
    <link rel="icon" type="image/png" href="/logo/logo_dwindo.png">
</head>
<body>
    <h1>' . $title . '</h1>
    <p>' . $description . '</p>
    <p><a href="' . $url . '">Kunjungi halaman ini</a></p>
</body>
</html>';

    return $html;
}

// ── Main Execution ──────────────────────────────────────────

// Only process if this is a crawler request
if (!isCrawler()) {
    // Not a crawler — let .htaccess handle it (serve index.html)
    return false;
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove trailing slash (except root)
if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

// Skip if it's a real file (images, css, js, etc.)
$publicRoot = __DIR__;
$filePath = $publicRoot . $path;
if ($path !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}

// Resolve OG data for this route
$og = resolveOG($path, $SITE_URL, $DEFAULT_OG);

// Output the crawler-friendly HTML
header('Content-Type: text/html; charset=utf-8');
echo renderOGPage($og, $SITE_URL, $SITE_NAME);
exit;
