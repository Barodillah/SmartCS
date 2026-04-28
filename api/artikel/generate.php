<?php
// === Article AI Generate API ===
// POST: Generate article content via OpenRouter AI
require_once __DIR__ . '/../chat/config.php';

$body = getPostBody();

if (empty($body['context'])) {
    jsonResponse(false, 'Konteks artikel wajib diisi.', null, 400);
}

$apiKey = $body['api_key'] ?? '';
if (empty($apiKey)) {
    jsonResponse(false, 'API key tidak ditemukan.', null, 400);
}

$context = $body['context'];

$systemPrompt = <<<PROMPT
Kamu adalah content writer profesional untuk dealer Mitsubishi Dwindo Bintaro. Tugasmu adalah membuat artikel berkualitas tinggi.

Berikan output dalam format JSON yang valid (tanpa markdown code block) dengan struktur berikut:
{
  "title": "Judul artikel yang menarik dan SEO-friendly",
  "subtitle": "Ringkasan singkat 1-2 kalimat",
  "content": "Isi artikel dalam format HTML menggunakan tag <p>, <h3>, <ul>, <li>, <blockquote>. Minimal 3 paragraf dengan heading. Gunakan class 'text-lg md:text-xl text-gray-700 leading-relaxed mb-6' untuk paragraf pertama, 'font-display font-bold text-2xl md:text-3xl text-[#111111] mt-10 mb-4' untuk h3, dan 'text-gray-600 leading-relaxed mb-6' untuk paragraf lainnya.",
  "category": "salah satu dari: berita, kegiatan, insight, promo, tips",
  "tags": ["array", "of", "relevant", "tags"],
  "read_time": "estimasi waktu baca, contoh: 5 min read",
  "cta_type": "salah satu dari: booking, test_drive, prospect, emergency, sparepart, aksesoris, complaint, none — pilih yang paling sesuai konteks"
}

Pastikan konten relevan dengan dunia otomotif Mitsubishi dan dealer Dwindo Bintaro.
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
        'HTTP-Referer: https://smartcs.mitsubishi-dwindo.com',
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
// Strip markdown code fences if present
$content = preg_replace('/^```json\s*/', '', trim($content));
$content = preg_replace('/```\s*$/', '', $content);

$parsed = json_decode($content, true);

if (!$parsed || !isset($parsed['title'])) {
    jsonResponse(false, 'AI menghasilkan format yang tidak valid. Coba lagi.', ['raw' => $content], 500);
}

jsonResponse(true, 'Artikel berhasil di-generate.', $parsed);
