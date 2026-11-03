<?php
/**
 * SmartCS — LLM Metadata Handler (GEO / Generative Engine Optimization)
 * Mengikuti standar Bab 9.3 & Bab 19.6 PANDUAN_SEO_AEO_GEO_UNIVERSAL.md
 */

require_once __DIR__ . '/api/config.php';

header('Content-Type: text/markdown; charset=utf-8');
header('Cache-Control: public, max-age=86400, s-maxage=86400');
header('Vary: Accept-Encoding');
header('X-Robots-Tag: noindex');

$type = isset($_GET['type']) ? preg_replace('/[^a-z0-9\-]/i', '', $_GET['type']) : 'index';
$slug = isset($_GET['slug']) ? preg_replace('/[^a-z0-9\-_]/i', '', $_GET['slug']) : '';

$cacheKey = 'smartcs_llms_v2_' . $type . ($slug ? '_' . md5($slug) : '') . '.md';
$cacheFile = sys_get_temp_dir() . '/' . $cacheKey;
$cacheTtl = 86400; // 24 jam

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl) && !isset($_GET['nocache'])) {
    readfile($cacheFile);
    exit;
}

$db = null;
try {
    $db = getDB();
} catch (Throwable $e) {
    $db = null;
}

function getBaseUrl()
{
    return 'https://csdwindo.com';
}

function cleanHtml($html)
{
    $text = preg_replace('/<[^>]*>/', ' ', (string)$html);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

function getSiteSummary()
{
    return "Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya) adalah dealer resmi 3S (Sales, Service, Sparepart) Mitsubishi Motors (MMKSI) dan Mitsubishi Fuso (KTB) yang melayani area Bintaro (Tangerang Selatan), Radin Inten, dan Cakung (Jakarta Timur). Menyediakan penjualan mobil penumpang (Xpander, Xpander Cross, Xforce, Destinator, Pajero Sport, Triton, L300) dan niaga (Fuso Canter, Fighter X), booking service bengkel resmi online, suku cadang & aksesoris asli, serta asisten virtual AI 24/7 bernama DINA (Dwindo Intelligent Assistant).";
}

function getProductsData($db)
{
    if ($db) {
        try {
            $stmt = $db->prepare("SELECT data FROM app_data WHERE key_name = 'price_list'");
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row && !empty($row['data'])) {
                $data = json_decode($row['data'], true);
                if (json_last_error() === JSON_ERROR_NONE) return $data;
            }
        } catch (Throwable $e) {}
    }

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

function getDealerData()
{
    $paths = [__DIR__ . '/knowledge/lokasi_dealer.json', __DIR__ . '/lokasi_dealer.json'];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            $json = file_get_contents($path);
            $data = json_decode($json, true);
            if (json_last_error() === JSON_ERROR_NONE) return $data;
        }
    }
    return [
        "dealer" => "PT Dwindo Berlian Samjaya",
        "brand" => "Mitsubishi Motors Dwindo Bintaro",
        "branches" => []
    ];
}

function getAccessoriesData()
{
    $path = __DIR__ . '/knowledge/aksesoris.json';
    if (file_exists($path)) {
        $data = json_decode(file_get_contents($path), true);
        if (json_last_error() === JSON_ERROR_NONE && isset($data['mitsubishi_accessories'])) {
            return $data['mitsubishi_accessories'];
        }
    }
    return [];
}

function getArticles($db, $limit = null)
{
    if (!$db) return [];
    try {
        $sql = "SELECT id, slug, title, subtitle, category, author, image, tags, content, published_at, updated_at FROM articles WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC";
        if ($limit) $sql .= " LIMIT " . (int)$limit;
        $stmt = $db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return [];
    }
}

function formatKeyFactsSection($dealer)
{
    $baseUrl = getBaseUrl();
    $out = "## Fakta Kunci\n";
    $out .= "- **Nama Brand**: Mitsubishi Motors Dwindo Bintaro\n";
    $out .= "- **Nama Badan Hukum**: PT Dwindo Berlian Samjaya\n";
    $out .= "- **Status Resmi**: Authorized Dealer 3S (Sales, Service, Sparepart) Mitsubishi Motors (MMKSI) & Mitsubishi Fuso (KTB)\n";
    $out .= "- **Domain Resmi**: {$baseUrl}\n";
    $out .= "- **Subdomain Resmi**: https://booking.csdwindo.com (Booking Service)\n";
    $out .= "- **Cabang Utama (Bintaro)**: Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7 (Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren), Kota Tangerang Selatan, Banten 15220 | Telp: 021-7458383\n";
    $out .= "- **Cabang Radin Inten**: Jl. Radin Inten II, RT.8/RW.7, Duren Sawit, Kota Jakarta Timur, DKI Jakarta 13440 | Telp: 021-29483888\n";
    $out .= "- **Cabang Cakung**: Jl. Raya Bekasi No.KM.26, RT.6/RW.1, Ujung Menteng, Kec. Cakung, Kota Jakarta Timur, DKI Jakarta 13960 | Telp: 021-22461888\n";
    $out .= "- **Jam Operasional Bengkel**: Senin–Jumat 08:00–16:30 WIB, Sabtu 08:00–15:00 WIB, Minggu 08:00–12:00 WIB (Khusus Booking Service)\n";
    $out .= "- **Layanan Unggulan**: Penjualan Cash/Kredit, Test Drive, Booking Service Online, Suku Cadang & Aksesoris Resmi, Extended SMART Package, Asisten AI DINA 24/7\n\n";
    $out .= "## Peringatan Kanal Resmi\n";
    $out .= "Satu-satunya domain web resmi layanan pelanggan kami adalah {$baseUrl}. Seluruh pembayaran pembelian unit kendaraan maupun servis resmi hanya ditujukan ke rekening perusahaan atas nama **PT Dwindo Berlian Samjaya**, bukan rekening pribadi.\n\n";
    return $out;
}

function formatProductSummaryTable($products)
{
    $baseUrl = getBaseUrl();
    $out = "## Ringkasan Lini Kendaraan & Harga OTR Jabodetabek\n\n";
    if (!$products) {
        return $out . "Data katalog sedang diperbarui. Kunjungi {$baseUrl}/price-list\n\n";
    }
    $periode = $products['meta']['periode'] ?? 'Terbaru';
    $out .= "Periode Harga: **{$periode}** (OTR Jabodetabek)\n\n";
    $out .= "| Model | Kategori | Jumlah Varian | Harga Mulai (IDR) | Harga Tertinggi (IDR) | Halaman Resmi |\n";
    $out .= "| :--- | :--- | :---: | :--- | :--- | :--- |\n";

    foreach (['passenger_car' => 'Passenger Car (MMKSI)', 'commercial_car' => 'Commercial Car (Fuso/KTB)'] as $secKey => $secLabel) {
        if (empty($products[$secKey])) continue;
        foreach ($products[$secKey] as $modelKey => $details) {
            $modelName = strtoupper(str_replace('_', ' ', $modelKey));
            $prices = [];
            if (!empty($details['items'])) {
                foreach ($details['items'] as $it) {
                    if (!empty($it['price'])) $prices[] = (int)$it['price'];
                }
            } elseif (!empty($details['categories'])) {
                foreach ($details['categories'] as $catItems) {
                    foreach ($catItems as $it) {
                        if (!empty($it['price'])) $prices[] = (int)$it['price'];
                    }
                }
            }
            if (empty($prices)) continue;
            $minP = 'Rp ' . number_format(min($prices), 0, ',', '.');
            $maxP = 'Rp ' . number_format(max($prices), 0, ',', '.');
            $count = count($prices);
            $out .= "| {$modelName} | {$secLabel} | {$count} | {$minP} | {$maxP} | {$baseUrl}/price-list |\n";
        }
    }
    $out .= "\n";
    return $out;
}

function formatProductDataFull($products, $accessories)
{
    $baseUrl = getBaseUrl();
    $periode = $products['meta']['periode'] ?? '2026';
    $output = "# Katalog Lengkap Produk, Harga & Aksesoris Mitsubishi — PT Dwindo Berlian Samjaya\n\n";
    $output .= "> Daftar harga OTR Jabodetabek periode **{$periode}** di dealer resmi Mitsubishi Motors Dwindo Bintaro ({$baseUrl}/price-list).\n\n";

    if ($products) {
        // 1. Passenger Car
        if (!empty($products['passenger_car'])) {
            $output .= "## 1. Kendaraan Penumpang (Passenger Car - MMKSI)\n\n";
            foreach ($products['passenger_car'] as $model => $details) {
                $modelName = strtoupper(str_replace('_', ' ', $model));
                $output .= "### {$modelName}\n\n";
                $output .= "| Tipe / Varian | Harga OTR Jabodetabek (IDR) |\n";
                $output .= "| :--- | :--- |\n";
                if (!empty($details['items'])) {
                    foreach ($details['items'] as $item) {
                        $output .= "| " . $item['type'] . " | Rp " . number_format($item['price'], 0, ',', '.') . " |\n";
                    }
                }
                $output .= "\n";
                if (!empty($details['additional_cost'])) {
                    $output .= "**Catatan Tambahan Biaya {$modelName}:**\n";
                    foreach ($details['additional_cost'] as $k => $v) {
                        $label = ucwords(str_replace('_', ' ', $k));
                        $output .= "- {$label}: +Rp " . number_format($v, 0, ',', '.') . "\n";
                    }
                    $output .= "\n";
                }
            }
        }

        // 2. Commercial Car
        if (!empty($products['commercial_car'])) {
            $output .= "## 2. Kendaraan Niaga (Commercial Car - Mitsubishi Fuso / KTB)\n\n";
            foreach ($products['commercial_car'] as $model => $details) {
                $modelName = strtoupper(str_replace('_', ' ', $model));
                $output .= "### {$modelName}\n\n";
                $output .= "| Sub-Kategori | Tipe / Varian | Spesifikasi Kunci | Harga OTR Jabodetabek (IDR) |\n";
                $output .= "| :--- | :--- | :--- | :--- |\n";
                if (!empty($details['categories'])) {
                    foreach ($details['categories'] as $cat => $items) {
                        $catLabel = strtoupper(str_replace('_', ' ', $cat));
                        foreach ($items as $item) {
                            $spec = $item['spec'] ?? '-';
                            $output .= "| {$catLabel} | {$item['type']} | {$spec} | Rp " . number_format($item['price'], 0, ',', '.') . " |\n";
                        }
                    }
                }
                $output .= "\n";
            }
        }
    }

    // 3. Aksesoris Resmi
    if (!empty($accessories)) {
        $output .= "## 3. Katalog Aksesoris Resmi Mitsubishi ({$baseUrl}/aksesoris)\n\n";
        $output .= "| Model Kendaraan | Kategori | Nama Aksesoris / Paket | Estimasi Harga (IDR) |\n";
        $output .= "| :--- | :--- | :--- | :--- |\n";
        foreach ($accessories as $modelKey => $cats) {
            $modelLabel = str_replace('_', ' ', $modelKey);
            foreach (['paket_aksesoris' => 'Paket Aksesoris', 'exterior' => 'Eksterior', 'interior' => 'Interior'] as $cKey => $cLabel) {
                if (!empty($cats[$cKey])) {
                    foreach ($cats[$cKey] as $acc) {
                        $output .= "| {$modelLabel} | {$cLabel} | {$acc['item']} | Rp " . number_format($acc['price'], 0, ',', '.') . " |\n";
                    }
                }
            }
        }
        $output .= "\n";
    }

    // 4. Paket Perawatan & Booking Service
    $output .= "## 4. Layanan Bengkel & Paket Perawatan ({$baseUrl}/booking)\n\n";
    $output .= "| Layanan / Paket | Berlaku Untuk | Harga / Ketentuan |\n";
    $output .= "| :--- | :--- | :--- |\n";
    $output .= "| Gratis Servis Berkala SMART Package | Pembelian unit baru Mitsubishi (10.000 - 50.000 KM / 4 Tahun) | Gratis Biaya Jasa & Suku Cadang sesuai buku servis |\n";
    $output .= "| AC Clean (Evaporator & Blower) | Semua model Mitsubishi | Rp 338.000 |\n";
    $output .= "| Cooling Grid Cleaner | Semua model Mitsubishi | Rp 273.000 |\n";
    $output .= "| AC Care (Sterilisasi Kabin) | Semua model Mitsubishi | Rp 195.000 |\n";
    $output .= "| Extended SMART Package Xpander (1XPM - 6XPM) | Xpander / Xpander Cross / Xforce (>50.000 KM) | Rp 1.387.500 s/d Rp 6.660.000 (Hemat s/d 25%) |\n";
    $output .= "| Extended SMART Package Pajero Sport (1XPM - 6XPM) | Pajero Sport (>50.000 KM) | Rp 2.497.500 s/d Rp 13.320.000 (Hemat s/d 25%) |\n\n";

    return $output;
}

function formatDealerDataMarkdown($dealer)
{
    $baseUrl = getBaseUrl();
    $out = "# Lokasi Cabang & Kontak Resmi — " . ($dealer['dealer'] ?? 'PT Dwindo Berlian Samjaya') . "\n\n";
    $out .= "> Halaman peta & petunjuk arah resmi: {$baseUrl}/lokasi-dealer\n\n";
    $out .= "| Cabang | Alamat Lengkap | Telepon Resmi | Jam Operasional | Google Maps |\n";
    $out .= "| :--- | :--- | :--- | :--- | :--- |\n";
    if (!empty($dealer['branches'])) {
        foreach ($dealer['branches'] as $b) {
            $hours = $b['opening_hours'] ?? 'Senin–Sabtu 08:00–16:30 WIB';
            $out .= "| **{$b['name']}** | {$b['address']} | {$b['phone']} | {$hours} | [Petunjuk Arah]({$b['maps_direction']}) |\n";
        }
    }
    $out .= "\n";
    return $out;
}

function formatFaqMarkdown()
{
    $baseUrl = getBaseUrl();
    $out = "# Pertanyaan yang Sering Diajukan (FAQ) — Mitsubishi Motors Dwindo Bintaro\n\n";
    $out .= "> Sumber resmi: {$baseUrl}/faq\n\n";

    $faqs = [
        [
            "q" => "Di mana lokasi dealer resmi Mitsubishi Dwindo Bintaro dan apa nomor teleponnya?",
            "a" => "Cabang utama Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya) berlokasi di Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7 (Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren), Kota Tangerang Selatan, Banten 15220. Nomor telepon resmi adalah (021) 745-8383. Selain Bintaro, PT Dwindo Berlian Samjaya juga memiliki cabang resmi di Radin Inten (021-29483888) dan Cakung Jakarta Timur (021-22461888)."
        ],
        [
            "q" => "Berapa harga mobil Mitsubishi Xpander, Xforce, Destinator, dan Pajero Sport terbaru di Dwindo Bintaro?",
            "a" => "Berdasarkan daftar harga OTR Jabodetabek terbaru di Dwindo Bintaro: Mitsubishi Xpander dipasarkan mulai Rp 270.100.000 hingga Rp 342.800.000, Xpander Cross mulai Rp 343.000.000 hingga Rp 369.200.000, Xforce mulai Rp 388.000.000 hingga Rp 429.350.000, Destinator mulai Rp 402.000.000 hingga Rp 508.000.000, dan New Pajero Sport mulai Rp 582.700.000 hingga Rp 784.650.000. Daftar lengkap tersedia di {$baseUrl}/price-list."
        ],
        [
            "q" => "Bagaimana cara melakukan booking service di bengkel resmi Mitsubishi Dwindo Bintaro?",
            "a" => "Pelanggan dapat melakukan booking service secara online tanpa antre melalui halaman {$baseUrl}/booking atau https://booking.csdwindo.com, maupun melalui asisten AI DINA 24/7. Cukup masukkan nomor polisi kendaraan, pilih jarak tempuh (KM) serta paket perawatan tambahan bila diperlukan, lalu pilih tanggal dan slot jam servis yang tersedia (08:00–13:00 WIB)."
        ],
        [
            "q" => "Apa saja keuntungan paket gratis servis berkala (SMART Package) dan Extended SMART Package Mitsubishi?",
            "a" => "Setiap pembelian mobil penumpang Mitsubishi baru mendapatkan gratis biaya jasa dan suku cadang perawatan berkala sesuai buku manual dari 10.000 KM hingga 50.000 KM atau 4 tahun (mana yang tercapai lebih dulu). Setelah melewati 50.000 KM, pemilik Xpander, Xpander Cross, Xforce, dan Pajero Sport dapat membeli Extended SMART Package (pilihan 1XPM hingga 6XPM / 6–36 bulan) yang menghemat biaya perawatan hingga 25–27%, termasuk gratis perpanjangan garansi item terbatas 1 tahun/30.000 KM dan layanan darurat 24 jam."
        ],
        [
            "q" => "Apa itu DINA (Dwindo Intelligent Assistant)?",
            "a" => "DINA adalah asisten virtual berbasis AI milik Mitsubishi Motors Dwindo Bintaro yang aktif 24/7 di situs {$baseUrl}. DINA membantu pelanggan mengecek harga OTR dan promo terbaru, melakukan simulasi kredit, mengecek harga suku cadang dan aksesoris asli, menjadwalkan test drive, hingga melakukan booking service bengkel secara instan."
        ],
        [
            "q" => "Bagaimana cara memastikan transaksi pembelian mobil di Dwindo Bintaro aman dan resmi?",
            "a" => "Pastikan Anda hanya bertransaksi melalui kanal resmi {$baseUrl} atau berkunjung langsung ke showroom resmi PT Dwindo Berlian Samjaya. Seluruh pembayaran tanda jadi (booking fee), uang muka (DP), maupun pelunasan unit wajib ditransfer ke rekening perusahaan resmi atas nama PT Dwindo Berlian Samjaya, bukan ke rekening pribadi oknum sales."
        ]
    ];

    foreach ($faqs as $item) {
        $out .= "## {$item['q']}\n";
        $out .= "{$item['a']}\n\n";
    }
    return $out;
}

function formatOfficialChannelsMarkdown($dealer)
{
    $baseUrl = getBaseUrl();
    $out = "# Kanal Resmi PT Dwindo Berlian Samjaya (Mitsubishi Motors Dwindo Bintaro)\n\n";
    $out .= "> Untuk keamanan Anda, satu-satunya domain website layanan cerdas resmi kami adalah **{$baseUrl}**.\n\n";
    $out .= "## Daftar Kanal & Kontak Resmi\n\n";
    $out .= "| Kanal / Platform | Identitas / URL Resmi | Keterangan |\n";
    $out .= "| :--- | :--- | :--- |\n";
    $out .= "| Website Utama | {$baseUrl} | Situs resmi informasi harga, aksesoris, artikel & asisten AI DINA |\n";
    $out .= "| Portal Booking Service | {$baseUrl}/booking (atau https://booking.csdwindo.com) | Sistem reservasi servis bengkel resmi online |\n";
    $out .= "| Instagram Resmi | https://www.instagram.com/dwindoberliansamjaya/ | Akun Instagram resmi PT Dwindo Berlian Samjaya |\n";
    $out .= "| YouTube Resmi | https://www.youtube.com/@dwindoberliansamjaya635 | Kanal dokumentasi & video resmi |\n";
    $out .= "| Telepon Dwindo Bintaro | (021) 745-8383 | Showroom & Bengkel Resmi Bintaro Sektor 7 |\n";
    $out .= "| Telepon Dwindo Radin Inten | (021) 2948-3888 | Showroom & Bengkel Resmi Duren Sawit, Jakarta Timur |\n";
    $out .= "| Telepon Dwindo Cakung | (021) 2246-1888 | Showroom & Bengkel Resmi Ujung Menteng, Cakung |\n\n";
    $out .= "## Peringatan Keamanan & Anti-Penipuan\n";
    $out .= "- Kami **tidak pernah** meminta pembayaran uang muka (DP), pelunasan kendaraan, atau deposit ke rekening pribadi.\n";
    $out .= "- Rekening resmi transaksi hanya atas nama badan hukum **PT Dwindo Berlian Samjaya**.\n";
    $out .= "- Situs lain dengan ejaan mirip yang meminta transfer ke rekening perorangan bukan bagian dari PT Dwindo Berlian Samjaya.\n\n";
    return $out;
}

function formatArticleSummary($article)
{
    $baseUrl = getBaseUrl();
    $tags = is_string($article['tags']) ? json_decode($article['tags'], true) : $article['tags'];
    $tagsStr = is_array($tags) ? implode(', ', $tags) : '';
    $imgUrl = !empty($article['image'])
        ? (strpos($article['image'], 'http') === 0 ? $article['image'] : $baseUrl . $article['image'])
        : $baseUrl . '/dina.png';

    $output = "### [" . $article['title'] . "](" . $baseUrl . "/artikel/" . $article['slug'] . ")\n";
    $output .= "- **Kategori:** " . ($article['category'] ?? 'berita') . " | **Terbit:** " . ($article['published_at'] ?? '-') . "\n";
    $output .= "- **Ringkasan:** " . ($article['subtitle'] ?: mb_substr(cleanHtml($article['content']), 0, 160)) . "\n";
    if ($tagsStr) {
        $output .= "- **Topik:** " . $tagsStr . "\n";
    }
    $output .= "- **Versi Markdown LLM:** " . $baseUrl . "/llms-artikel-" . $article['slug'] . ".txt\n\n";
    return $output;
}

ob_start();
$validResponse = true;

switch ($type) {
    case 'index':
        $dealer = getDealerData();
        $products = getProductsData($db);
        echo "# Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya)\n\n";
        echo "> " . getSiteSummary() . "\n\n";
        echo formatKeyFactsSection($dealer);
        echo formatProductSummaryTable($products);
        echo "## Sumber Daya Lebih Lanjut (Ekosistem llms.txt)\n";
        echo "- [Katalog Lengkap Harga, Aksesoris & Paket Servis](" . getBaseUrl() . "/llms-products.txt)\n";
        echo "- [Lokasi Cabang, Alamat & Jam Operasional Dealer](" . getBaseUrl() . "/llms-lokasi-dealer.txt)\n";
        echo "- [Tanya-Jawab Teknis & Layanan (FAQ)](" . getBaseUrl() . "/llms-faq.txt)\n";
        echo "- [Verifikasi Kanal Resmi & Anti-Penipuan](" . getBaseUrl() . "/llms-official-channels.txt)\n";
        echo "- [Indeks Artikel & Berita Otomotif](" . getBaseUrl() . "/llms-artikel.txt)\n";
        echo "- [Seluruh Basis Pengetahuan dalam Satu Berkas (RAG Full)](" . getBaseUrl() . "/llms-full.txt)\n\n";

        echo "## Artikel & Informasi Terbaru\n\n";
        $articles = getArticles($db, 5);
        if (!empty($articles)) {
            foreach ($articles as $art) {
                echo formatArticleSummary($art);
            }
        } else {
            echo "- Kunjungi halaman berita resmi di " . getBaseUrl() . "/artikel\n";
        }
        break;

    case 'products':
        $products = getProductsData($db);
        $accessories = getAccessoriesData();
        echo formatProductDataFull($products, $accessories);
        break;

    case 'lokasi-dealer':
        $dealer = getDealerData();
        echo formatDealerDataMarkdown($dealer);
        break;

    case 'faq':
        echo formatFaqMarkdown();
        break;

    case 'official-channels':
        $dealer = getDealerData();
        echo formatOfficialChannelsMarkdown($dealer);
        break;

    case 'artikel-index':
        echo "# Indeks Artikel & Berita — Mitsubishi Motors Dwindo Bintaro\n\n";
        echo "> Halaman berita utama: " . getBaseUrl() . "/artikel\n\n";
        $articles = getArticles($db);
        if (!empty($articles)) {
            foreach ($articles as $art) {
                echo formatArticleSummary($art);
            }
        } else {
            echo "Belum ada artikel yang dipublikasikan atau basis data sedang dalam pemeliharaan.\n";
        }
        break;

    case 'artikel-detail':
        $article = null;
        if ($db && $slug !== '') {
            try {
                $stmt = $db->prepare("SELECT * FROM articles WHERE slug = ? AND status = 'published' LIMIT 1");
                $stmt->execute([$slug]);
                $article = $stmt->fetch(PDO::FETCH_ASSOC);
            } catch (Throwable $e) {
                $article = null;
            }
        }

        if ($article) {
            echo "# " . $article['title'] . "\n\n";
            echo "- **URL Kanonis:** " . getBaseUrl() . "/artikel/" . $article['slug'] . "\n";
            echo "- **Penulis:** " . ($article['author'] ?? 'Mitsubishi Dwindo') . "\n";
            echo "- **Kategori:** " . ($article['category'] ?? 'berita') . "\n";
            echo "- **Tanggal Terbit:** " . ($article['published_at'] ?? '-') . "\n\n";
            if (!empty($article['subtitle'])) {
                echo "## Ringkasan\n" . $article['subtitle'] . "\n\n";
            }
            echo "## Isi Konten\n";
            echo cleanHtml($article['content']) . "\n";
        } else {
            $validResponse = false;
            http_response_code(404);
            echo "Artikel tidak ditemukan.";
        }
        break;

    case 'full':
        $dealer = getDealerData();
        $products = getProductsData($db);
        $accessories = getAccessoriesData();
        echo "# FULL KNOWLEDGE BASE — Mitsubishi Motors Dwindo Bintaro (PT Dwindo Berlian Samjaya)\n\n";
        echo "> " . getSiteSummary() . "\n\n";
        echo formatKeyFactsSection($dealer);
        echo formatDealerDataMarkdown($dealer);
        echo formatProductDataFull($products, $accessories);
        echo formatFaqMarkdown();
        echo formatOfficialChannelsMarkdown($dealer);
        echo "# Artikel & Berita Terpublikasi\n\n";
        $articles = getArticles($db, 20);
        foreach ($articles as $art) {
            echo "## " . $art['title'] . "\n";
            echo "URL: " . getBaseUrl() . "/artikel/" . $art['slug'] . "\n\n";
            echo cleanHtml($art['content']) . "\n\n";
        }
        break;

    default:
        $validResponse = false;
        http_response_code(404);
        echo "Tipe dokumen LLM tidak valid.";
        break;
}

$output = ob_get_clean();
if ($validResponse && strlen($output) > 50) {
    @file_put_contents($cacheFile, $output);
}
echo $output;
