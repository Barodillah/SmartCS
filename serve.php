<?php
/**
 * ============================================================
 * SmartCS — Server-Side Meta, JSON-LD & Content Injection Engine
 * ============================================================
 * Sesuai Bab 2.3, Bab 3.3, Bab 4, dan Bab 5 PANDUAN_SEO_AEO_GEO_UNIVERSAL.md:
 * 1. Menyuntikkan <title>, <meta description>, <link rel="canonical">,
 *    <meta name="robots">, Open Graph, Twitter Card, dan Schema.org JSON-LD
 *    langsung ke template index.html untuk SEMUA request (bot maupun browser).
 * 2. Menyuntikkan konten semantik awal (H1, H2, Tabel, FAQ, Artikel) ke dalam
 *    <div id="root"> agar crawler tanpa JS dan bot AI membaca konten nyata.
 * 3. Mengembalikan HTTP status code 404 sungguhan untuk rute/artikel yang
 *    tidak ditemukan (mencegah Soft 404).
 */

$rootDir = file_exists(__DIR__ . '/api/config.php') ? __DIR__ : dirname(__DIR__);

// ── Early Static Asset Resolver (Before api/config.php sends JSON headers) ──
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';
if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

if ($path !== '/' && preg_match('/\.(js|mjs|css|png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|eot|json|xml|txt|map|pdf|mp4|webm)$/i', $path, $extMatch)) {
    if (PHP_SAPI === 'cli-server' && is_file(__DIR__ . $path)) {
        return false;
    }
    $ext = strtolower($extMatch[1]);
    $mimeMap = [
        'js' => 'application/javascript; charset=utf-8',
        'mjs' => 'application/javascript; charset=utf-8',
        'css' => 'text/css; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'xml' => 'application/xml; charset=utf-8',
        'txt' => 'text/plain; charset=utf-8',
        'map' => 'application/json; charset=utf-8',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'avif' => 'image/avif',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'pdf' => 'application/pdf',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
    ];
    $staticCandidates = [
        __DIR__ . $path,
        $rootDir . '/dist' . $path,
        $rootDir . '/public' . $path,
        $rootDir . $path,
    ];
    foreach ($staticCandidates as $candidate) {
        if (is_file($candidate)) {
            http_response_code(200);
            header('Content-Type: ' . ($mimeMap[$ext] ?? 'application/octet-stream'));
            header('Cache-Control: public, max-age=31536000');
            readfile($candidate);
            exit;
        }
    }
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo '404 Static Asset Not Found';
    exit;
}

if (file_exists($rootDir . '/api/config.php')) {
    require_once $rootDir . '/api/config.php';
}

$SITE_URL = 'https://csdwindo.com';
$BRAND_NAME = 'Mitsubishi Motors Dwindo Bintaro';
$LEGAL_NAME = 'PT Dwindo Berlian Samjaya';
$DEFAULT_IMAGE = $SITE_URL . '/dina.png';
$LOGO_URL = $SITE_URL . '/logo/logo_dwindo.png';

if (!function_exists('getDB')) {
    function getDB() { return null; }
}

function e($str)
{
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function truncateWords($text, $maxLen = 160)
{
    $clean = trim(preg_replace('/\s+/', ' ', strip_tags((string)$text)));
    if (mb_strlen($clean, 'UTF-8') <= $maxLen) {
        return $clean;
    }
    $cut = mb_substr($clean, 0, $maxLen - 1, 'UTF-8');
    $lastSpace = mb_strrpos($cut, ' ', 0, 'UTF-8');
    if ($lastSpace !== false && $lastSpace > 80) {
        $cut = mb_substr($cut, 0, $lastSpace, 'UTF-8');
    }
    return rtrim($cut, '.,;:- ') . '…';
}

function loadJsonKnowledge($filename, $rootDir)
{
    $candidates = [
        $rootDir . '/knowledge/' . $filename,
        $rootDir . '/' . $filename,
        __DIR__ . '/knowledge/' . $filename,
    ];
    foreach ($candidates as $path) {
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $data;
            }
        }
    }
    return null;
}

function fetchArticleFromDbOrSeed($identifier, $rootDir)
{
    $pdo = null;
    try {
        $pdo = getDB();
    } catch (Throwable $e) {
        $pdo = null;
    }

    if ($pdo) {
        try {
            if (is_numeric($identifier)) {
                $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ? AND status = 'published' LIMIT 1");
            } else {
                $stmt = $pdo->prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published' LIMIT 1");
            }
            $stmt->execute([$identifier]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) return $row;
        } catch (Throwable $e) {
            // Fall through to seed check
        }
    }

    // Fallback seed articles (sesuai api/artikel/schema.sql untuk lingkungan lokal tanpa koneksi DB remote)
    $seeds = [
        'peluncuran-model-terbaru-mitsubishi' => [
            'id' => 1,
            'slug' => 'peluncuran-model-terbaru-mitsubishi',
            'title' => 'Peluncuran Model Terbaru Mitsubishi: Inovasi Tanpa Batas',
            'subtitle' => 'Temukan fitur-fitur mutakhir dan desain revolusioner dari lini kendaraan terbaru kami di Mitsubishi Motors Dwindo Bintaro.',
            'category' => 'berita',
            'author' => 'Mitsubishi Motors Dwindo Bintaro',
            'image' => '/images/updates/news.png',
            'content' => '<p>Mitsubishi Motors kembali menggebrak pasar otomotif Tanah Air dengan peluncuran model terbarunya yang mengusung konsep Dynamic Shield generasi terkini.</p><h2>Desain Dynamic Shield & Fitur Keselamatan Aktif</h2><p>Dilengkapi teknologi keselamatan Diamond Sense dan kabin luas untuk kenyamanan keluarga Indonesia.</p>',
            'published_at' => '2026-04-23 10:00:00',
            'updated_at' => '2026-04-23 10:00:00',
            'tags' => '["otomotif","mitsubishi","peluncuran"]'
        ],
        'gathering-komunitas-mitsubishi-bintaro-2026' => [
            'id' => 2,
            'slug' => 'gathering-komunitas-mitsubishi-bintaro-2026',
            'title' => 'Gathering Komunitas Mitsubishi Bintaro 2026',
            'subtitle' => 'Kemeriahan acara kumpul bareng ratusan pemilik kendaraan Mitsubishi di Dwindo Bintaro beserta edukasi perawatan berkala.',
            'category' => 'kegiatan',
            'author' => 'Mitsubishi Motors Dwindo Bintaro',
            'image' => '/images/updates/activity.png',
            'content' => '<p>Kemeriahan acara kumpul bareng ratusan pemilik kendaraan Mitsubishi di dealer resmi Dwindo Bintaro berlangsung hangat dan penuh antusiasme.</p>',
            'published_at' => '2026-04-15 08:00:00',
            'updated_at' => '2026-04-15 08:00:00',
            'tags' => '["komunitas","gathering","bintaro"]'
        ],
        'pentingnya-perawatan-berkala-di-bengkel-resmi' => [
            'id' => 3,
            'slug' => 'pentingnya-perawatan-berkala-di-bengkel-resmi',
            'title' => 'Pentingnya Perawatan Berkala di Bengkel Resmi Mitsubishi',
            'subtitle' => 'Ketahui mengapa servis rutin dengan suku cadang asli di bengkel resmi Dwindo Bintaro menjaga garansi dan nilai jual kembali kendaraan Anda.',
            'category' => 'insight',
            'author' => 'Mitsubishi Motors Dwindo Bintaro',
            'image' => '/images/updates/insight.png',
            'content' => '<p>Servis rutin di bengkel resmi Mitsubishi Motors Dwindo Bintaro memastikan setiap komponen diperiksa oleh teknisi tersertifikasi menggunakan peralatan diagnostik MUT-III dan suku cadang asli bergaransi.</p>',
            'published_at' => '2026-04-10 09:00:00',
            'updated_at' => '2026-04-10 09:00:00',
            'tags' => '["service","perawatan","tips"]'
        ]
    ];

    return $seeds[$identifier] ?? null;
}

function buildBaseGraph($siteUrl, $brandName, $legalName, $logoUrl, $dealerData)
{
    $graph = [
        [
            '@type' => 'Organization',
            '@id' => $siteUrl . '/#organization',
            'name' => $brandName,
            'legalName' => $legalName,
            'url' => $siteUrl . '/',
            'logo' => [
                '@type' => 'ImageObject',
                'url' => $logoUrl
            ],
            'sameAs' => [
                'https://www.instagram.com/dwindoberliansamjaya/',
                'https://www.youtube.com/@dwindoberliansamjaya635'
            ],
            'contactPoint' => [
                [
                    '@type' => 'ContactPoint',
                    'contactType' => 'customer service',
                    'telephone' => '+62-21-7458383',
                    'areaServed' => 'ID',
                    'availableLanguage' => ['id']
                ]
            ]
        ],
        [
            '@type' => 'WebSite',
            '@id' => $siteUrl . '/#website',
            'url' => $siteUrl . '/',
            'name' => $brandName,
            'publisher' => ['@id' => $siteUrl . '/#organization'],
            'inLanguage' => 'id'
        ]
    ];

    return $graph;
}

function buildAutoDealerNodes($siteUrl, $dealerData, $defaultImg)
{
    $nodes = [];
    if (empty($dealerData['branches'])) return $nodes;

    foreach ($dealerData['branches'] as $b) {
        $slug = $b['slug'] ?? 'branch';
        $node = [
            '@type' => 'AutoDealer',
            '@id' => $siteUrl . '/lokasi-dealer#' . $slug,
            'name' => 'Mitsubishi ' . $b['name'] . ' (PT Dwindo Berlian Samjaya)',
            'parentOrganization' => ['@id' => $siteUrl . '/#organization'],
            'image' => $defaultImg,
            'url' => $siteUrl . '/lokasi-dealer',
            'telephone' => $b['phone_intl'] ?? $b['phone'],
            'priceRange' => 'Rp 240.000.000 - Rp 1.500.000.000',
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $b['street_address'] ?? $b['address'],
                'addressLocality' => $b['locality'] ?? 'Tangerang Selatan',
                'addressRegion' => $b['region'] ?? 'Banten',
                'postalCode' => $b['postal_code'] ?? '15220',
                'addressCountry' => 'ID'
            ],
            'openingHoursSpecification' => [
                [
                    '@type' => 'OpeningHoursSpecification',
                    'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    'opens' => '08:00',
                    'closes' => '16:30'
                ],
                [
                    '@type' => 'OpeningHoursSpecification',
                    'dayOfWeek' => ['Saturday'],
                    'opens' => '08:00',
                    'closes' => '15:00'
                ]
            ],
            'areaServed' => ['Jabodetabek', 'Tangerang Selatan', 'Jakarta Timur']
        ];
        if (!empty($b['latitude']) && !empty($b['longitude'])) {
            $node['geo'] = [
                '@type' => 'GeoCoordinates',
                'latitude' => (float)$b['latitude'],
                'longitude' => (float)$b['longitude']
            ];
        }
        if (!empty($b['maps_direction'])) {
            $node['hasMap'] = $b['maps_direction'];
        }
        $nodes[] = $node;
    }
    return $nodes;
}

function buildBreadcrumbNode($siteUrl, $items)
{
    $elements = [];
    foreach ($items as $idx => $item) {
        $el = [
            '@type' => 'ListItem',
            'position' => $idx + 1,
            'name' => $item['name']
        ];
        if (!empty($item['url'])) {
            $el['item'] = $item['url'];
        }
        $elements[] = $el;
    }
    return [
        '@type' => 'BreadcrumbList',
        'itemListElement' => $elements
    ];
}

function buildFaqNode($faqs)
{
    $entities = [];
    foreach ($faqs as $f) {
        $entities[] = [
            '@type' => 'Question',
            'name' => $f['q'],
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => $f['a']
            ]
        ];
    }
    return [
        '@type' => 'FAQPage',
        'mainEntity' => $entities
    ];
}

// ── Route Resolver ──────────────────────────────────────────
$dealerData = loadJsonKnowledge('lokasi_dealer.json', $rootDir);
$priceListData = loadJsonKnowledge('price_list.json', $rootDir);
$accessoriesData = loadJsonKnowledge('aksesoris.json', $rootDir);

$meta = [
    'status' => 200,
    'title' => 'Mitsubishi Motors Dwindo Bintaro | Dealer Resmi & Bengkel 3S',
    'description' => 'Dealer Resmi 3S Mitsubishi Motors & Fuso PT Dwindo Berlian Samjaya di Bintaro, Radin Inten, dan Cakung. Cek harga OTR terbaru, promo kredit, booking service online, & asisten AI DINA 24/7.',
    'canonical' => $SITE_URL . ($path === '/' ? '/' : $path),
    'robots' => 'index, follow, max-image-preview:large',
    'og_type' => 'website',
    'image' => $DEFAULT_IMAGE,
    'ssr_body' => '',
];

$graph = buildBaseGraph($SITE_URL, $BRAND_NAME, $LEGAL_NAME, $LOGO_URL, $dealerData);
$host = strtolower($_SERVER['HTTP_HOST'] ?? '');
$isPanelHost = strpos($host, 'panel.') === 0;
$isBookingHost = strpos($host, 'booking.') === 0;

// Normalisasi rute efektif untuk subdomain booking.csdwindo.com
$effectivePath = ($isBookingHost && ($path === '/' || $path === '')) ? '/booking' : $path;

if ($isPanelHost) {
    // Seluruh rute di subdomain panel.csdwindo.com (baik / maupun /panel/*) adalah halaman internal
    $meta['status'] = 200;
    $meta['robots'] = 'noindex, nofollow';
    $meta['title'] = 'Panel Dashboard - CSDwindo';
    $meta['description'] = 'Dashboard Admin & Customer Service PT Dwindo Berlian Samjaya.';
    $meta['canonical'] = 'https://panel.csdwindo.com' . ($path === '/' ? '/' : $path);
    $meta['ssr_body'] = '';
} elseif ($effectivePath === '/' || $effectivePath === '') {
    foreach (buildAutoDealerNodes($SITE_URL, $dealerData, $DEFAULT_IMAGE) as $node) {
        $graph[] = $node;
    }
    $meta['ssr_body'] = '
    <main>
        <h1>Dealer Resmi Mitsubishi Motors &amp; Fuso Dwindo Bintaro — Your Journey Our Care</h1>
        <p>Selamat datang di <strong>PT Dwindo Berlian Samjaya (Mitsubishi Motors Dwindo Bintaro)</strong>, dealer resmi 3S (Sales, Service, Sparepart) Mitsubishi Motors dan Mitsubishi Fuso untuk wilayah Bintaro (Tangerang Selatan), Radin Inten, dan Cakung (Jakarta Timur).</p>
        <section>
            <h2>Layanan Utama Dealer &amp; Bengkel Resmi</h2>
            <ul>
                <li><a href="/price-list">Daftar Harga Mobil Mitsubishi Terbaru (OTR Jabodetabek)</a></li>
                <li><a href="/booking">Booking Service Bengkel Resmi Mitsubishi Online</a></li>
                <li><a href="/aksesoris">Katalog Aksesoris Resmi Mitsubishi Motors</a></li>
                <li><a href="/lokasi-dealer">Lokasi, Alamat &amp; Telepon Cabang Dealer Dwindo</a></li>
                <li><a href="/artikel">Berita, Promo &amp; Tips Otomotif Terbaru</a></li>
                <li><a href="/faq">Pertanyaan yang Sering Diajukan (FAQ)</a></li>
                <li><a href="/kanal-resmi">Verifikasi Kanal Resmi PT Dwindo Berlian Samjaya</a></li>
            </ul>
        </section>
    </main>';
} elseif ($effectivePath === '/price-list') {
    $periode = $priceListData['meta']['periode'] ?? '2026';
    $meta['title'] = "Daftar Harga Mobil Mitsubishi {$periode} | Dwindo Bintaro";
    $meta['description'] = "Daftar harga OTR Jabodetabek periode {$periode} untuk seluruh lini kendaraan Mitsubishi: Xpander, Xpander Cross, Xforce, Destinator, Pajero Sport, Triton, L300, dan Fuso Canter.";

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Daftar Harga Mitsubishi']
    ]);

    $itemListElements = [];
    $pos = 1;
    $tableHtml = '<main><h1>Daftar Harga Mobil Mitsubishi Terbaru — Periode ' . e($periode) . ' (OTR Jabodetabek)</h1>';
    $tableHtml .= '<p>Berikut adalah daftar harga resmi On The Road (OTR) Jabodetabek di dealer resmi <strong>Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya)</strong>.</p>';

    if (!empty($priceListData['passenger_car'])) {
        $tableHtml .= '<section><h2>Harga Kendaraan Penumpang (Passenger Car - MMKSI)</h2>';
        foreach ($priceListData['passenger_car'] as $modelKey => $mData) {
            $modelName = 'Mitsubishi ' . ucwords(str_replace('_', ' ', $modelKey));
            $prices = array_column($mData['items'] ?? [], 'price');
            if (!empty($prices)) {
                $img = !empty($mData['image']) ? (strpos($mData['image'], 'http') === 0 ? $mData['image'] : $SITE_URL . $mData['image']) : $DEFAULT_IMAGE;
                $itemListElements[] = [
                    '@type' => 'ListItem',
                    'position' => $pos++,
                    'item' => [
                        '@type' => 'Product',
                        '@id' => $SITE_URL . '/price-list#' . $modelKey,
                        'name' => $modelName,
                        'image' => $img,
                        'brand' => ['@type' => 'Brand', 'name' => 'Mitsubishi Motors'],
                        'description' => "Harga OTR Jabodetabek {$modelName} di dealer resmi Mitsubishi Dwindo Bintaro.",
                        'offers' => [
                            '@type' => 'AggregateOffer',
                            'url' => $SITE_URL . '/price-list#' . $modelKey,
                            'priceCurrency' => 'IDR',
                            'lowPrice' => (string)min($prices),
                            'highPrice' => (string)max($prices),
                            'offerCount' => count($prices),
                            'availability' => 'https://schema.org/InStock',
                            'seller' => ['@id' => $SITE_URL . '/#organization']
                        ]
                    ]
                ];
            }
            $tableHtml .= '<h3>' . e($modelName) . '</h3><table><thead><tr><th>Tipe / Varian</th><th>Harga OTR Jabodetabek</th></tr></thead><tbody>';
            foreach (($mData['items'] ?? []) as $it) {
                $tableHtml .= '<tr><td>' . e($it['type']) . '</td><td>Rp ' . number_format((int)$it['price'], 0, ',', '.') . '</td></tr>';
            }
            $tableHtml .= '</tbody></table>';
        }
        $tableHtml .= '</section>';
    }

    if (!empty($itemListElements)) {
        $graph[] = [
            '@type' => 'ItemList',
            'name' => 'Katalog Harga Mobil Mitsubishi OTR Jabodetabek',
            'itemListElement' => $itemListElements
        ];
    }

    $priceFaqs = [
        [
            'q' => 'Apakah harga OTR Mitsubishi di atas sudah termasuk gratis servis berkala?',
            'a' => 'Ya, setiap pembelian unit baru kendaraan penumpang Mitsubishi Motors dilengkapi paket SMART Package yang mencakup gratis biaya jasa dan suku cadang perawatan berkala hingga 50.000 KM atau 4 tahun (sesuai ketentuan buku servis).'
        ],
        [
            'q' => 'Berapa tambahan biaya untuk pilihan warna putih (Quartz White Pearl) pada Xpander dan Pajero Sport?',
            'a' => 'Terdapat tambahan biaya sebesar Rp 1.500.000 untuk warna putih pada model Mitsubishi Xpander, Xpander Cross, dan Xforce, serta Rp 3.000.000 untuk warna putih pada New Pajero Sport.'
        ]
    ];
    $graph[] = buildFaqNode($priceFaqs);
    $tableHtml .= '</main>';
    $meta['ssr_body'] = $tableHtml;

} elseif ($path === '/lokasi-dealer') {
    $meta['title'] = 'Lokasi & Alamat Dealer Mitsubishi Dwindo | Bintaro & Jaktim';
    $meta['description'] = 'Temukan alamat lengkap, nomor telepon resmi, jam buka bengkel, dan petunjuk arah Google Maps cabang Mitsubishi Dwindo di Bintaro, Radin Inten, dan Cakung.';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Lokasi Dealer']
    ]);
    foreach (buildAutoDealerNodes($SITE_URL, $dealerData, $DEFAULT_IMAGE) as $node) {
        $graph[] = $node;
    }

    $body = '<main><h1>Lokasi Dealer &amp; Bengkel Resmi PT Dwindo Berlian Samjaya</h1>';
    foreach (($dealerData['branches'] ?? []) as $b) {
        $body .= '<section><h2>' . e($b['name']) . '</h2>';
        $body .= '<p><strong>Alamat:</strong> ' . e($b['address']) . '</p>';
        $body .= '<p><strong>Telepon:</strong> ' . e($b['phone']) . '</p>';
        $body .= '<p><strong>Jam Operasional:</strong> ' . e($b['opening_hours'] ?? 'Senin–Sabtu 08:00–16:30 WIB') . '</p>';
        $body .= '<p><a href="' . e($b['maps_direction']) . '">Buka Petunjuk Arah Google Maps</a></p></section>';
    }
    $body .= '</main>';
    $meta['ssr_body'] = $body;

} elseif ($path === '/aksesoris') {
    $meta['title'] = 'Katalog & Harga Aksesoris Resmi Mitsubishi | Dwindo Bintaro';
    $meta['description'] = 'Lengkapi mobil Mitsubishi Destinator, Xforce, Xpander, Xpander Cross, dan Pajero Sport Anda dengan aksesoris asli bergaransi resmi di Dwindo Bintaro.';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Aksesoris Resmi']
    ]);

    $body = '<main><h1>Aksesoris Resmi Mitsubishi Motors</h1><p>Daftar paket dan item aksesoris asli Mitsubishi Motors untuk meningkatkan estetika serta fungsionalitas kendaraan Anda.</p>';
    if (!empty($accessoriesData['mitsubishi_accessories'])) {
        foreach ($accessoriesData['mitsubishi_accessories'] as $modelKey => $cats) {
            $modelLabel = str_replace('_', ' ', $modelKey);
            $body .= '<section><h2>Aksesoris Mitsubishi ' . e($modelLabel) . '</h2><table><thead><tr><th>Kategori</th><th>Nama Aksesoris</th><th>Estimasi Harga</th></tr></thead><tbody>';
            foreach (['paket_aksesoris' => 'Paket', 'exterior' => 'Eksterior', 'interior' => 'Interior'] as $ck => $cl) {
                foreach (($cats[$ck] ?? []) as $acc) {
                    $body .= '<tr><td>' . e($cl) . '</td><td>' . e($acc['item']) . '</td><td>Rp ' . number_format((int)$acc['price'], 0, ',', '.') . '</td></tr>';
                }
            }
            $body .= '</tbody></table></section>';
        }
    }
    $body .= '</main>';
    $meta['ssr_body'] = $body;

} elseif ($effectivePath === '/booking') {
    $meta['title'] = 'Booking Service Bengkel Resmi Mitsubishi | Dwindo Bintaro';
    $meta['description'] = 'Jadwalkan servis berkala mobil Mitsubishi Anda secara online tanpa antre di bengkel resmi Dwindo Bintaro. Tersedia paket perawatan AC & Extended SMART Package.';
    $meta['canonical'] = $SITE_URL . '/booking';
    $meta['image'] = $SITE_URL . '/logo/mitsubishi-motors/logo_text_black.png';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Booking Service']
    ]);
    $bookingFaqs = [
        [
            'q' => 'Kapan saja jam slot booking service yang tersedia di bengkel Mitsubishi Dwindo Bintaro?',
            'a' => 'Slot booking service tersedia setiap Senin–Sabtu pukul 08:00, 09:00, 10:00, 11:00, dan 13:00 WIB (khusus servis ringan), serta hari Minggu pukul 08:00 hingga 11:00 WIB.'
        ],
        [
            'q' => 'Berapa biaya paket perawatan AC dan Extended SMART Package di Dwindo Bintaro?',
            'a' => 'Paket AC Care mulai Rp 195.000, Cooling Grid Cleaner Rp 273.000, dan AC Clean Rp 338.000. Untuk kendaraan di atas 50.000 KM, tersedia Extended SMART Package Xpander mulai Rp 1.387.500 (1XPM) dan Pajero Sport mulai Rp 2.497.500 (1XPM) dengan penghematan hingga 25%.'
        ]
    ];
    $graph[] = buildFaqNode($bookingFaqs);
    $meta['ssr_body'] = '<main><h1>Booking Service Bengkel Resmi Mitsubishi Dwindo Bintaro</h1><p>Atur jadwal perawatan berkala kendaraan Mitsubishi Anda secara online tanpa antre. Masukkan nomor polisi kendaraan, pilih jarak tempuh (KM), dan tentukan jadwal kedatangan.</p></main>';

} elseif ($path === '/artikel') {
    $meta['title'] = 'Berita, Promo & Tips Otomotif Mitsubishi | Dwindo Bintaro';
    $meta['description'] = 'Baca berita terbaru, informasi promo penjualan & servis, tips merawat mobil Mitsubishi, serta liputan kegiatan komunitas dari dealer resmi Dwindo Bintaro.';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Berita & Artikel']
    ]);
    $meta['ssr_body'] = '<main><h1>Berita, Promo &amp; Tips Otomotif Mitsubishi</h1><p>Kumpulan informasi resmi, tips perawatan berkala, dan pembaruan produk dari Mitsubishi Motors Dwindo Bintaro.</p></main>';

} elseif (preg_match('#^/artikel/([^/]+)$#', $path, $matches)) {
    $identifier = urldecode($matches[1]);
    $article = fetchArticleFromDbOrSeed($identifier, $rootDir);

    if ($article) {
        $slug = $article['slug'] ?: $identifier;
        $cleanDescContent = preg_replace('/\[(img|video|vidio):[^\]]+\]/i', '', $article['content'] ?? '');
        $meta['title'] = $article['title'] . ' | Mitsubishi Dwindo Bintaro';
        $meta['description'] = !empty($article['subtitle'])
            ? truncateWords($article['subtitle'], 160)
            : truncateWords($cleanDescContent, 160);
        $meta['canonical'] = $SITE_URL . '/artikel/' . rawurlencode($slug);
        $meta['og_type'] = 'article';

        if (!empty($article['image'])) {
            $meta['image'] = (strpos($article['image'], 'http') === 0)
                ? $article['image']
                : $SITE_URL . $article['image'];
        }

        $pubDate = !empty($article['published_at']) ? date('c', strtotime($article['published_at'])) : date('c');
        $modDate = !empty($article['updated_at']) ? date('c', strtotime($article['updated_at'])) : $pubDate;

        $graph[] = buildBreadcrumbNode($SITE_URL, [
            ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
            ['name' => 'Berita', 'url' => $SITE_URL . '/artikel'],
            ['name' => $article['title']]
        ]);
        $graph[] = [
            '@type' => 'BlogPosting',
            '@id' => $meta['canonical'] . '#article',
            'headline' => mb_substr($article['title'], 0, 110, 'UTF-8'),
            'description' => $meta['description'],
            'image' => [$meta['image']],
            'datePublished' => $pubDate,
            'dateModified' => $modDate,
            'author' => [
                '@type' => 'Organization',
                'name' => $article['author'] ?: $BRAND_NAME,
                'url' => $SITE_URL . '/'
            ],
            'publisher' => ['@id' => $SITE_URL . '/#organization'],
            'mainEntityOfPage' => $meta['canonical'],
            'inLanguage' => 'id'
        ];

        $parsedContent = preg_replace_callback(
            '/\[(img|video|vidio):([^\|\]]+)(?:\|([^\]]*))?\]/i',
            function ($m) {
                $tag = strtolower($m[1]);
                $url = htmlspecialchars(trim($m[2]), ENT_QUOTES, 'UTF-8');
                $caption = isset($m[3]) ? htmlspecialchars(trim($m[3]), ENT_QUOTES, 'UTF-8') : '';
                $cleanUrlLower = strtolower(parse_url(trim($m[2]), PHP_URL_PATH) ?? '');
                $isVideo = $tag === 'video' || $tag === 'vidio' || preg_match('/\.(mp4|webm|ogg|mov|m4v)$/i', $cleanUrlLower);
                $alt = $caption ?: ($isVideo ? 'Video Artikel' : 'Gambar Artikel');

                $out = '<figure style="margin:2rem 0;text-align:center;">';
                if ($isVideo) {
                    $out .= '<video src="' . $url . '" controls playsinline preload="metadata" style="max-width:100%;height:auto;border-radius:12px;background:#000;"></video>';
                } else {
                    $out .= '<img src="' . $url . '" alt="' . $alt . '" loading="lazy" style="max-width:100%;height:auto;border-radius:12px;" />';
                }
                if ($caption !== '') {
                    $out .= '<figcaption style="margin-top:0.5rem;font-size:0.875rem;color:#6b7280;font-style:italic;">' . $caption . '</figcaption>';
                }
                $out .= '</figure>';
                return $out;
            },
            $article['content'] ?? ''
        );

        $meta['ssr_body'] = '<main><article><h1>' . e($article['title']) . '</h1>'
            . (!empty($article['subtitle']) ? '<p><strong>' . e($article['subtitle']) . '</strong></p>' : '')
            . '<div>' . $parsedContent . '</div>'
            . '<p><a href="/artikel">Lihat Artikel Lainnya</a> | <a href="/price-list">Cek Daftar Harga Mitsubishi</a> | <a href="/booking">Booking Service Online</a></p>'
            . '</article></main>';
    } else {
        $meta['status'] = 404;
        $meta['robots'] = 'noindex, follow';
        $meta['title'] = 'Artikel Tidak Ditemukan (404) | Mitsubishi Dwindo Bintaro';
        $meta['description'] = 'Maaf, artikel yang Anda cari tidak ditemukan atau telah dipindahkan.';
        $meta['ssr_body'] = '<main><h1>404 — Artikel Tidak Ditemukan</h1><p>Artikel yang Anda cari tidak tersedia. Silakan kembali ke <a href="/artikel">Daftar Berita</a> atau <a href="/">Beranda</a>.</p></main>';
    }

} elseif ($path === '/faq') {
    $meta['title'] = 'FAQ Pembelian, Kredit & Servis Mitsubishi | Dwindo Bintaro';
    $meta['description'] = 'Jawaban langsung atas pertanyaan seputar harga OTR Mitsubishi, simulasi kredit, gratis servis berkala SMART Package, Extended SMART Package, dan asisten AI DINA.';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'FAQ']
    ]);
    $allFaqs = [
        [
            'q' => 'Di mana alamat lengkap dan nomor telepon resmi Mitsubishi Dwindo Bintaro?',
            'a' => 'Dealer resmi 3S Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya) beralamat di Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7 (Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren), Kota Tangerang Selatan, Banten 15220, nomor telepon (021) 745-8383. Cabang lainnya berada di Radin Inten Jakarta Timur (021-29483888) dan Cakung Jakarta Timur (021-22461888).'
        ],
        [
            'q' => 'Berapa harga mobil Mitsubishi Xpander, Xforce, Destinator, dan Pajero Sport terbaru?',
            'a' => 'Harga OTR Jabodetabek terbaru di Dwindo Bintaro: Mitsubishi Xpander mulai Rp 270.100.000, Xpander Cross mulai Rp 343.000.000, Xforce mulai Rp 388.000.000, Destinator mulai Rp 402.000.000, dan New Pajero Sport mulai Rp 582.700.000.'
        ],
        [
            'q' => 'Apa saja yang ditanggung dalam gratis servis berkala SMART Package Mitsubishi?',
            'a' => 'Setiap pembelian mobil penumpang Mitsubishi baru mendapatkan gratis biaya jasa dan suku cadang perawatan berkala sesuai buku servis dari 10.000 KM hingga 50.000 KM atau 4 tahun (mana yang tercapai lebih dulu).'
        ],
        [
            'q' => 'Bagaimana cara memastikan pembayaran pembelian mobil di Dwindo Bintaro resmi dan aman?',
            'a' => 'Seluruh transaksi pembayaran booking fee, uang muka (DP), maupun pelunasan unit hanya sah apabila ditransfer ke rekening perusahaan resmi atas nama PT Dwindo Berlian Samjaya. Kami tidak pernah menggunakan rekening pribadi.'
        ]
    ];
    $graph[] = buildFaqNode($allFaqs);
    $meta['ssr_body'] = '<main><h1>Pertanyaan yang Sering Diajukan (FAQ) — Mitsubishi Motors Dwindo Bintaro</h1>';
    foreach ($allFaqs as $f) {
        $meta['ssr_body'] .= '<section><h2>' . e($f['q']) . '</h2><p>' . e($f['a']) . '</p></section>';
    }
    $meta['ssr_body'] .= '</main>';

} elseif ($path === '/kanal-resmi' || $path === '/tentang-kami') {
    $meta['title'] = 'Tentang Kami & Kanal Resmi PT Dwindo Berlian Samjaya';
    $meta['description'] = 'Informasi resmi profil perusahaan PT Dwindo Berlian Samjaya (Authorized Dealer Mitsubishi Motors & Fuso), daftar kanal resmi, dan panduan keamanan transaksi.';
    $meta['canonical'] = $SITE_URL . '/kanal-resmi';

    $graph[] = buildBreadcrumbNode($SITE_URL, [
        ['name' => 'Beranda', 'url' => $SITE_URL . '/'],
        ['name' => 'Kanal Resmi & Tentang Kami']
    ]);
    $graph[] = [
        '@type' => 'AboutPage',
        '@id' => $SITE_URL . '/kanal-resmi#aboutpage',
        'url' => $SITE_URL . '/kanal-resmi',
        'name' => $meta['title'],
        'description' => $meta['description'],
        'mainEntity' => ['@id' => $SITE_URL . '/#organization']
    ];
    $meta['ssr_body'] = '<main><h1>Tentang Kami &amp; Kanal Resmi PT Dwindo Berlian Samjaya</h1><p>PT Dwindo Berlian Samjaya adalah dealer resmi 3S Mitsubishi Motors (MMKSI) dan Mitsubishi Fuso (KTB) dengan pengalaman lebih dari 20 tahun melayani pelanggan di Jabodetabek melalui cabang Bintaro, Radin Inten, dan Cakung. Satu-satunya situs layanan cerdas resmi kami adalah https://csdwindo.com dan seluruh pembayaran resmi hanya melalui rekening atas nama PT Dwindo Berlian Samjaya.</p></main>';

} elseif (
    $path === '/chat-history' ||
    $path === '/cetak' ||
    $path === '/sa' ||
    $path === '/wa-blast' ||
    strpos($path, '/survey/') === 0 ||
    $path === '/panel' ||
    strpos($path, '/panel/') === 0
) {
    // Rute aplikasi internal / privat: status 200 tetapi wajib noindex
    $meta['robots'] = 'noindex, nofollow';
    $meta['title'] = 'Layanan Internal | Mitsubishi Dwindo Bintaro';
} else {
    // Rute tidak dikenal → Status 404 Sungguhan (Mencegah Soft 404)
    $meta['status'] = 404;
    $meta['robots'] = 'noindex, follow';
    $meta['title'] = 'Halaman Tidak Ditemukan (404) | Mitsubishi Dwindo Bintaro';
    $meta['description'] = 'Halaman yang Anda tuju tidak ditemukan. Kunjungi beranda Mitsubishi Motors Dwindo Bintaro untuk informasi harga, booking service, dan lokasi dealer.';
    $meta['ssr_body'] = '<main><h1>404 — Halaman Tidak Ditemukan</h1><p>Maaf, URL yang Anda minta tidak tersedia di situs resmi Mitsubishi Motors Dwindo Bintaro.</p><ul><li><a href="/">Beranda</a></li><li><a href="/price-list">Daftar Harga Mobil Mitsubishi</a></li><li><a href="/booking">Booking Service Online</a></li><li><a href="/lokasi-dealer">Lokasi Dealer</a></li><li><a href="/faq">FAQ</a></li></ul></main>';
}

http_response_code($meta['status']);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: ' . $meta['robots']);

// Cari template index.html (prioritaskan dist/index.html bila ada di environment lokal, lalu index.html di direktori aktif untuk produksi)
$templateCandidates = [
    $rootDir . '/dist/index.html',
    __DIR__ . '/index.html',
    $rootDir . '/index.html',
];
$html = null;
foreach ($templateCandidates as $tpl) {
    if (file_exists($tpl)) {
        $html = file_get_contents($tpl);
        break;
    }
}

$jsonLdString = json_encode([
    '@context' => 'https://schema.org',
    '@graph' => $graph
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if ($html) {
    // 1. Ganti <title>
    $html = preg_replace('#<title>.*?</title>#is', '<title>' . e($meta['title']) . '</title>', $html, 1);

    // 2. Ganti meta description, robots, og:*, twitter:*
    $html = preg_replace('#<meta\s+name=["\']description["\'][^>]*>#is', '<meta name="description" content="' . e($meta['description']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+name=["\']robots["\'][^>]*>#is', '<meta name="robots" content="' . e($meta['robots']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+property=["\']og:type["\'][^>]*>#is', '<meta property="og:type" content="' . e($meta['og_type']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+property=["\']og:url["\'][^>]*>#is', '<meta property="og:url" content="' . e($meta['canonical']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+property=["\']og:title["\'][^>]*>#is', '<meta property="og:title" content="' . e($meta['title']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+property=["\']og:description["\'][^>]*>#is', '<meta property="og:description" content="' . e($meta['description']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+property=["\']og:image["\'][^>]*>#is', '<meta property="og:image" content="' . e($meta['image']) . '" />', $html, 1);

    $html = preg_replace('#<meta\s+(?:property|name)=["\']twitter:url["\'][^>]*>#is', '<meta name="twitter:url" content="' . e($meta['canonical']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+(?:property|name)=["\']twitter:title["\'][^>]*>#is', '<meta name="twitter:title" content="' . e($meta['title']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+(?:property|name)=["\']twitter:description["\'][^>]*>#is', '<meta name="twitter:description" content="' . e($meta['description']) . '" />', $html, 1);
    $html = preg_replace('#<meta\s+(?:property|name)=["\']twitter:image["\'][^>]*>#is', '<meta name="twitter:image" content="' . e($meta['image']) . '" />', $html, 1);

    // 3. Ganti atau tambahkan canonical
    if (preg_match('#<link\s+rel=["\']canonical["\'][^>]*>#is', $html)) {
        $html = preg_replace('#<link\s+rel=["\']canonical["\'][^>]*>#is', '<link rel="canonical" href="' . e($meta['canonical']) . '" />', $html, 1);
    } else {
        $html = str_replace('</head>', '  <link rel="canonical" href="' . e($meta['canonical']) . '" />' . "\n</head>", $html);
    }

    // 4. Suntikkan JSON-LD Schema.org
    $ldScript = '  <script id="ssr-schema-ld" type="application/ld+json">' . $jsonLdString . '</script>' . "\n</head>";
    $html = str_replace('</head>', $ldScript, $html);

    // 5. Suntikkan konten utama semantik ke dalam <div id="root"></div> (visually hidden sr-only agar tidak berkedip teks di layar, namun 100% terbaca crawler/LLM dan di-replace bersih oleh React createRoot)
    if (!empty($meta['ssr_body'])) {
        $html = preg_replace(
            '#<div\s+id=["\']root["\']\s*>\s*</div>#is',
            '<div id="root"><div class="ssr-initial-content" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">' . $meta['ssr_body'] . '</div></div>',
            $html,
            1
        );
    }

    echo $html;
    exit;
}

// Fallback mandiri bila file index.html tidak ditemukan
echo '<!doctype html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' . e($meta['title']) . '</title><meta name="description" content="' . e($meta['description']) . '"><meta name="robots" content="' . e($meta['robots']) . '"><link rel="canonical" href="' . e($meta['canonical']) . '"><script type="application/ld+json">' . $jsonLdString . '</script></head><body><div id="root">' . $meta['ssr_body'] . '</div></body></html>';
exit;

