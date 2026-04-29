<?php
// === SmartCS — LLM Metadata Handler ===
require_once __DIR__ . '/api/chat/config.php';

header('Content-Type: text/plain; charset=utf-8');

$type = isset($_GET['type']) ? $_GET['type'] : 'index';
$slug = isset($_GET['slug']) ? $_GET['slug'] : '';

$db = null;
try {
    $db = getDB();
} catch (Exception $e) {
    // DB might be down, but we can still serve JSON data
}

function cleanHtml($html) {
    $text = preg_replace('/<[^>]*>/', ' ', $html);
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

function getSiteSummary() {
    return "Mitsubishi Motors Dwindo Bintaro adalah dealer resmi Mitsubishi yang menawarkan promo terbaik, booking service mudah, dan lini kendaraan terbaru seperti Xpander, Pajero Sport, dan Xforce. Kami menghadirkan solusi mobilitas masa depan dengan layanan asisten AI DINA.";
}

function getBaseUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    return $protocol . "://" . $_SERVER['HTTP_HOST'];
}

function getProductsData($db) {
    // 1. Try to fetch from database first
    try {
        $stmt = $db->prepare("SELECT data FROM app_data WHERE key_name = 'price_list'");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row && !empty($row['data'])) {
            $data = json_decode($row['data'], true);
            if (json_last_error() === JSON_ERROR_NONE) return $data;
        }
    } catch (Exception $e) {}

    // 2. Fallback to knowledge/price_list.json
    $paths = [__DIR__ . '/knowledge/price_list.json', __DIR__ . '/price_list.json'];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            $json = file_get_contents($path);
            $data = json_decode($json, true);
            if (json_last_error() === JSON_ERROR_NONE) return $data;
        }
    }
    return null;
}

function getDealerData() {
    return [
        "dealer" => "PT Dwindo Berlian Samjaya",
        "branches" => [
            [
                "name" => "Dwindo Bintaro",
                "address" => "Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren, Kota Tangerang Selatan, Banten 15220",
                "phone" => "021-7458383",
                "maps_direction" => "https://www.google.com/maps/dir/Current+Location/-6.2783819,106.7188049"
            ],
            [
                "name" => "Dwindo Radin Inten",
                "address" => "Jl. Radin Inten II, RT.8/RW.7, Duren Sawit, Kec. Duren Sawit, Kota Jakarta Timur, DKI Jakarta 13440",
                "phone" => "021-29483888",
                "maps_direction" => "https://www.google.com/maps/dir/Current+Location/-6.2207727,106.9236931"
            ],
            [
                "name" => "Dwindo Cakung",
                "address" => "Jl. Raya Bekasi No.KM.26, RT.6/RW.1, Ujung Menteng, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13960",
                "phone" => "021-22461888",
                "maps_direction" => "https://www.google.com/maps/dir/Current+Location/-6.1891645,106.9642866"
            ]
        ]
    ];
}

function getArticles($db, $limit = null) {
    try {
        $sql = "SELECT id, slug, title, subtitle, category, image, tags, content, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC";
        if ($limit) $sql .= " LIMIT $limit";
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return [];
    }
}

function formatArticleSummary($article) {
    $baseUrl = getBaseUrl();
    $tags = json_decode($article['tags'], true);
    $tagsStr = is_array($tags) ? implode(', ', $tags) : '';
    
    $output = "## " . $article['title'] . "\n";
    $output .= "- **Slug:** " . $article['slug'] . "\n";
    $output .= "- **Ringkasan:** " . $article['subtitle'] . "\n";
    $output .= "- **Gambar:** " . $baseUrl . $article['image'] . "\n";
    $output .= "- **Tags:** " . $tagsStr . "\n";
    $output .= "- **Data Lengkap:** [" . $article['title'] . "](" . $baseUrl . "/llms-artikel-" . $article['slug'] . ".txt)\n\n";
    return $output;
}

function formatProductData($products) {
    $output = "# Katalog Produk Mitsubishi\n\n";
    
    $sections = ['commercial_car', 'passenger_car'];
    foreach ($sections as $section) {
        $output .= "## " . ($section === 'commercial_car' ? 'Kendaraan Niaga' : 'Kendaraan Penumpang') . "\n\n";
        foreach ($products[$section] as $model => $details) {
            $output .= "### " . strtoupper($model) . "\n";
            if (isset($details['items'])) {
                foreach ($details['items'] as $item) {
                    $output .= "- " . $item['type'] . ": Rp " . number_format($item['price'], 0, ',', '.') . "\n";
                }
            } elseif (isset($details['categories'])) {
                foreach ($details['categories'] as $cat => $items) {
                    $output .= "#### Kategori: " . strtoupper($cat) . "\n";
                    foreach ($items as $item) {
                        $output .= "- " . $item['type'] . " (" . $item['spec'] . "): Rp " . number_format($item['price'], 0, ',', '.') . "\n";
                    }
                }
            }
            $output .= "\n";
        }
    }
    return $output;
}

switch ($type) {
    case 'index':
        echo "# Mitsubishi Motors Dwindo Bintaro - Metadata LLM\n\n";
        echo getSiteSummary() . "\n\n";
        echo "## Daftar Isi\n";
        echo "- [Katalog Produk Full](" . getBaseUrl() . "/llms-products.txt): Spesifikasi teknis mendalam seluruh lini kendaraan.\n";
        echo "- [Lokasi Dealer](" . getBaseUrl() . "/llms-lokasi-dealer.txt): Daftar cabang, alamat, dan kontak resmi.\n";
        echo "- [Daftar Artikel](" . getBaseUrl() . "/llms-artikel.txt): Kumpulan berita, tips, dan insight otomotif.\n";
        echo "- [Data Lengkap (Full)](" . getBaseUrl() . "/llms-full.txt): Seluruh metadata dalam satu file.\n\n";
        
        echo "# Artikel Terbaru\n\n";
        $articles = getArticles($db, 5);
        foreach ($articles as $art) {
            echo formatArticleSummary($art);
        }
        break;

    case 'products':
        $products = getProductsData($db);
        if ($products) {
            echo formatProductData($products);
        } else {
            echo "Data produk tidak tersedia.";
        }
        break;

    case 'lokasi-dealer':
        $dealer = getDealerData();
        if ($dealer) {
            echo "# Lokasi Dealer " . $dealer['dealer'] . "\n\n";
            foreach ($dealer['branches'] as $branch) {
                echo "## " . $branch['name'] . "\n";
                echo "- **Alamat:** " . $branch['address'] . "\n";
                echo "- **Telepon:** " . $branch['phone'] . "\n";
                echo "- **Peta:** " . $branch['maps_direction'] . "\n\n";
            }
        } else {
            echo "Data lokasi dealer tidak tersedia.";
        }
        break;

    case 'artikel-index':
        echo "# Daftar Artikel Mitsubishi Dwindo\n\n";
        $articles = getArticles($db);
        foreach ($articles as $art) {
            echo formatArticleSummary($art);
        }
        break;

    case 'artikel-detail':
        $stmt = $db->prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published'");
        $stmt->execute([$slug]);
        $article = $stmt->fetch();
        
        if ($article) {
            echo "# " . $article['title'] . "\n\n";
            echo "Published at: " . $article['published_at'] . "\n";
            echo "Author: " . $article['author'] . "\n\n";
            echo "## Ringkasan\n" . $article['subtitle'] . "\n\n";
            echo "## Isi Konten\n";
            echo cleanHtml($article['content']) . "\n";
        } else {
            http_response_code(404);
            echo "Artikel tidak ditemukan.";
        }
        break;

    case 'full':
        echo "# FULL METADATA - Mitsubishi Motors Dwindo Bintaro\n\n";
        echo "## 1. Summary\n" . getSiteSummary() . "\n\n";
        echo "## 2. Produk\n";
        $products = getProductsData($db);
        if ($products) {
            echo formatProductData($products);
        } else {
            echo "Data produk tidak tersedia.\n";
        }
        echo "\n## 3. Dealer\n";
        $dealer = getDealerData();
        if ($dealer) {
            foreach ($dealer['branches'] as $branch) {
                echo "### " . $branch['name'] . "\n- " . $branch['address'] . "\n- " . $branch['phone'] . "\n\n";
            }
        } else {
            echo "Data lokasi dealer tidak tersedia.\n";
        }
        echo "## 4. Artikel\n";
        $articles = getArticles($db);
        foreach ($articles as $art) {
            echo "### " . $art['title'] . "\n";
            echo cleanHtml($art['content']) . "\n\n";
        }
        break;

    default:
        echo "Tipe tidak valid.";
        break;
}
