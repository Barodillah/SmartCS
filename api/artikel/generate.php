<?php
// === Article AI Generate API ===
// POST: Generate article content via OpenRouter AI with SEO/AEO/GEO Governance (Bab 14.2)
require_once __DIR__ . '/../config.php';

$body = getPostBody();

if (empty($body['context'])) {
    jsonResponse(false, 'Konteks artikel wajib diisi.', null, 400);
}

$apiKey = OPENROUTER_API_KEY;
$context = $body['context'];

// Load factual knowledge base to prevent AI price/NAP hallucination
$pricePath = __DIR__ . '/../../knowledge/price_list.json';
$dealerPath = __DIR__ . '/../../knowledge/lokasi_dealer.json';
$priceFacts = '';
$dealerFacts = '';

if (file_exists($pricePath)) {
    $pl = json_decode(file_get_contents($pricePath), true);
    $periode = $pl['meta']['periode'] ?? '2026';
    $lines = ["Periode Harga OTR Jabodetabek: {$periode}"];
    if (!empty($pl['passenger_car'])) {
        foreach ($pl['passenger_car'] as $modelKey => $modelData) {
            $name = ucwords(str_replace('_', ' ', $modelKey));
            $prices = array_column($modelData['items'] ?? [], 'price');
            if ($prices) {
                $min = number_format(min($prices), 0, ',', '.');
                $max = number_format(max($prices), 0, ',', '.');
                $lines[] = "- Mitsubishi {$name}: Rp {$min} s/d Rp {$max}";
            }
        }
    }
    $priceFacts = implode("\n", $lines);
}

if (file_exists($dealerPath)) {
    $dl = json_decode(file_get_contents($dealerPath), true);
    $dLines = [];
    foreach ($dl['branches'] ?? [] as $b) {
        $dLines[] = "- {$b['name']}: {$b['address']} | Telp: {$b['phone']}";
    }
    $dealerFacts = implode("\n", $dLines);
}

$systemPrompt = <<<PROMPT
Kamu adalah Content Writer & Pakar SEO/AEO/GEO Otomotif untuk dealer resmi 3S **Mitsubishi Motors Dwindo Bintaro** (**PT Dwindo Berlian Samjaya**).
Tugasmu adalah membuat artikel berkualitas tinggi yang siap dikutip oleh mesin pencari dan AI generatif (ChatGPT, Gemini, Perplexity, Google AI Overviews).

ATURAN TATA KELOLA KONTEN (WAJIB DIIKUTI):
1. **Konsistensi Entitas & Brand**: Gunakan penulisan baku **Mitsubishi Motors Dwindo Bintaro** dan badan hukum **PT Dwindo Berlian Samjaya**.
2. **Paragraf Pembuka AEO (Answer-First / TL;DR)**: Paragraf pertama WAJIB menjawab inti topik secara langsung, padat, dan faktual dalam 2–3 kalimat (40–60 kata) sebelum masuk ke penjelasan panjang.
3. **Hierarki Heading & Pertanyaan**:
   - JANGAN gunakan tag `<h1>` di dalam `content` (karena judul utama halaman sudah menjadi `<h1>`).
   - Gunakan `<h2>` dan `<h3>` untuk subjudul. Buat minimal 2 subjudul dalam bentuk kalimat tanya yang sering diajukan konsumen (contoh: `<h2>Berapa Harga OTR Mitsubishi Xforce di Jabodetabek?</h2>` atau `<h3>Kapan Jadwal Servis Berkala Mitsubishi Xpander?</h3>`).
4. **Data Terstruktur & Tabel**: Jika artikel membahas harga, perbandingan varian, jadwal servis, atau spesifikasi, sertakan minimal 1 tabel Markdown (`| Kolom 1 | Kolom 2 |`) atau daftar poin (`<ul><li>`) agar mudah diekstrak oleh AI.
5. **Anti-Halusinasi Fakta**: Gunakan data harga OTR dan alamat cabang resmi di bawah ini jika relevan. Jangan mengarang angka harga atau alamat di luar data resmi:
{$priceFacts}

Cabang Resmi PT Dwindo Berlian Samjaya:
{$dealerFacts}

6. **Sisipan Media Otomatis**:
   - Jika pengguna menyertakan atau menyebutkan link/URL media (gambar atau video) dalam instruksi konteksnya, kamu WAJIB meletakkan dan menyisipkan media tersebut secara otomatis ke dalam `content` artikel pada posisi paragraf yang paling relevan:
     * Jika link GAMBAR (.jpg, .jpeg, .png, .webp, .avif, .gif, atau URL gambar): format menjadi `[img:link|keterangan gambar]`
     * Jika link VIDEO (.mp4, .webm, .ogg, .mov, URL video, youtube, dll): format menjadi `[video:link|keterangan video]`
   - Berikan keterangan (caption) yang informatif dan mendukung pembahasan artikel.

Berikan output dalam format JSON yang valid (tanpa markdown code block) dengan struktur berikut:
{
  "title": "Judul artikel yang menarik, spesifik, dan SEO/AEO-friendly (50-65 karakter)",
  "subtitle": "Ringkasan padat 1-2 kalimat (120-155 karakter) yang berfungsi sebagai meta description",
  "content": "Isi artikel lengkap (minimal 4 paragraf, subjudul <h2>/<h3>, daftar <ul><li> atau tabel perbandingan)",
  "category": "salah satu dari: berita, kegiatan, insight, promo, tips",
  "tags": ["mitsubishi dwindo bintaro", "tag2", "tag3"],
  "read_time": "estimasi waktu baca, contoh: 4 min read",
  "cta_type": "salah satu dari: booking, test_drive, prospect, emergency, sparepart, aksesoris, complaint, none — pilih yang paling sesuai konteks"
}
PROMPT;

$payload = [
    'model' => 'openai/gpt-oss-20b',
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => "Buatkan artikel berdasarkan konteks berikut:\n\n" . $context]
    ],
    'temperature' => 0.7,
    'max_tokens' => 3000
];

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
        'HTTP-Referer: https://csdwindo.com',
        'X-Title: SmartCS Article Generator'
    ],
    CURLOPT_TIMEOUT => 60
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    jsonResponse(false, 'Gagal menghubungi AI: ' . $curlError, null, 500);
}

if ($httpCode !== 200) {
    $errData = json_decode($response, true);
    $errMsg = $errData['error']['message'] ?? 'HTTP ' . $httpCode;
    jsonResponse(false, 'AI Error: ' . $errMsg, null, 500);
}

$result = json_decode($response, true);
$content = $result['choices'][0]['message']['content'] ?? '';

// Try to parse AI response as JSON
$content = preg_replace('/^```json\s*/', '', trim($content));
$content = preg_replace('/```\s*$/', '', $content);

$parsed = json_decode($content, true);

if (!$parsed || !isset($parsed['title'])) {
    jsonResponse(false, 'AI menghasilkan format yang tidak valid. Coba lagi.', ['raw' => $content], 500);
}

jsonResponse(true, 'Artikel berhasil di-generate.', $parsed);
