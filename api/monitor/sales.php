<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$url = 'https://dwindo.co.id/2slmonitor/api/get_sales_data.php';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'SmartCS-Monitor/1.0');
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response !== false && $httpCode === 200) {
    echo $response;
} else {
    // Fallback using file_get_contents
    $ctx = stream_context_create([
        'http' => ['timeout' => 15, 'user_agent' => 'SmartCS-Monitor/1.0'],
        'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
    ]);
    $alt = @file_get_contents($url, false, $ctx);
    if ($alt) {
        echo $alt;
    } else {
        http_response_code(502);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch sales data from upstream']);
    }
}

