<?php
// === Price List API ===
// Menggunakan config dari chat API untuk koneksi database
require_once '../config.php';

// Setup tabel jika belum ada
$db = getDB();
try {
    $db->exec("CREATE TABLE IF NOT EXISTS app_data (
        key_name VARCHAR(50) PRIMARY KEY,
        data LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {
    // Abaikan error pembuatan tabel jika terjadi masalah hak akses, dll
    // Error aslinya akan ditangani di query bawah jika memang tidak bisa jalan
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->prepare("SELECT data FROM app_data WHERE key_name = 'price_list'");
    $stmt->execute();
    $row = $stmt->fetch();
    
    if ($row && !empty($row['data'])) {
        $jsonData = json_decode($row['data'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            jsonResponse(true, 'Success', $jsonData);
        } else {
            jsonResponse(false, 'Invalid JSON format in database', null, 500);
        }
    } else {
        // Jika data belum ada di database, kita kembalikan status false dengan pesan Data not found
        // Frontend harus menggunakan data fallback (lokal json) jika API merespons ini
        jsonResponse(false, 'Data not found', null, 404);
    }

} elseif ($method === 'POST') {
    $body = getPostBody();
    
    if (empty($body)) {
        jsonResponse(false, 'Empty payload', null, 400);
    }
    
    $jsonData = json_encode($body, JSON_UNESCAPED_UNICODE);
    
    // Simpan atau update JSON di tabel app_data
    $stmt = $db->prepare("
        INSERT INTO app_data (key_name, data) 
        VALUES ('price_list', :data) 
        ON DUPLICATE KEY UPDATE data = :data_update
    ");
    
    try {
        $stmt->execute([
            ':data' => $jsonData,
            ':data_update' => $jsonData
        ]);
        jsonResponse(true, 'Price list updated successfully');
    } catch (PDOException $e) {
        jsonResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}
