<?php
// === Promo Knowledge Base API ===
// Mengelola seluruh berkas data di folder knowledge/promo secara dinamis
// Mendukung berkas bawaan (promo_dsf, progam_service, progam_referral) serta berkas promo baru kustom
require_once '../config.php';

$db = getDB();
if ($db) {
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS app_data (
            key_name VARCHAR(50) PRIMARY KEY,
            data LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
    } catch (PDOException $e) {
        // Abaikan
    }
}

$builtinKeys = ['promo_dsf', 'progam_service', 'progam_referral'];

function sanitizePromoKey($name) {
    $clean = strtolower(trim((string)$name));
    $clean = str_replace('.json', '', $clean);
    $clean = preg_replace('/[^a-z0-9_-]/', '_', $clean);
    return trim($clean, '_');
}

$promoDir = __DIR__ . '/../../knowledge/promo';
if (!is_dir($promoDir)) {
    @mkdir($promoDir, 0755, true);
}

$method = $_SERVER['REQUEST_METHOD'];
$requestedFile = sanitizePromoKey($_GET['file'] ?? $_POST['file'] ?? '');

// Handle DELETE (baik lewat HTTP DELETE atau POST dengan action=delete)
$action = $_GET['action'] ?? $_POST['action'] ?? '';
if ($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) {
    if (empty($requestedFile)) {
        jsonResponse(false, 'Parameter file tidak boleh kosong', null, 400);
    }

    if (in_array($requestedFile, $builtinKeys)) {
        jsonResponse(false, 'Berkas promo bawaan sistem tidak dapat dihapus', null, 403);
    }

    $deletedFromDb = false;
    if ($db) {
        try {
            $stmt = $db->prepare("DELETE FROM app_data WHERE key_name = :key");
            $stmt->execute([':key' => $requestedFile]);
            $deletedFromDb = true;
        } catch (PDOException $e) {
            // Lanjut
        }
    }

    $filePath = $promoDir . '/' . $requestedFile . '.json';
    $deletedFile = false;
    if (file_exists($filePath)) {
        @unlink($filePath);
        $deletedFile = true;
    }

    if ($deletedFromDb || $deletedFile) {
        jsonResponse(true, "Berkas promo '{$requestedFile}.json' berhasil dihapus");
    } else {
        jsonResponse(false, "Berkas promo '{$requestedFile}' tidak ditemukan", null, 404);
    }
}

if ($method === 'GET') {
    // 1. Jika meminta file spesifik
    if (!empty($requestedFile)) {
        $data = null;
        if ($db) {
            try {
                $stmt = $db->prepare("SELECT data FROM app_data WHERE key_name = :key");
                $stmt->execute([':key' => $requestedFile]);
                $row = $stmt->fetch();
                if ($row && !empty($row['data'])) {
                    $decoded = json_decode($row['data'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $data = $decoded;
                    }
                }
            } catch (PDOException $e) {}
        }

        $filePath = $promoDir . '/' . $requestedFile . '.json';
        if ($data === null && file_exists($filePath)) {
            $rawJson = @file_get_contents($filePath);
            $decoded = json_decode($rawJson, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data = $decoded;
            }
        }

        if ($data !== null) {
            jsonResponse(true, 'Success', $data);
        } else {
            jsonResponse(false, "Data promo '{$requestedFile}' tidak ditemukan", null, 404);
        }
    }

    // 2. Jika tanpa parameter file, kumpulkan semua file promo (bawaan + tambahan)
    $foundKeys = [];

    // A. Kumpulkan dari file fisik di knowledge/promo/
    $localFiles = @glob($promoDir . '/*.json');
    if ($localFiles) {
        foreach ($localFiles as $file) {
            $base = basename($file, '.json');
            $k = sanitizePromoKey($base);
            if (!empty($k)) {
                $foundKeys[$k] = true;
            }
        }
    }

    // B. Kumpulkan dari tabel app_data
    if ($db) {
        try {
            $stmt = $db->query("SELECT key_name FROM app_data WHERE key_name LIKE 'promo_%' OR key_name LIKE 'progam_%'");
            while ($row = $stmt->fetch()) {
                $k = sanitizePromoKey($row['key_name']);
                if (!empty($k)) {
                    $foundKeys[$k] = true;
                }
            }
        } catch (PDOException $e) {}
    }

    // Pastikan 3 builtin keys selalu ada di daftar
    foreach ($builtinKeys as $bk) {
        $foundKeys[$bk] = true;
    }

    $allData = [];
    $fileList = [];

    foreach (array_keys($foundKeys) as $k) {
        $itemData = null;

        if ($db) {
            try {
                $stmt = $db->prepare("SELECT data FROM app_data WHERE key_name = :key");
                $stmt->execute([':key' => $k]);
                $row = $stmt->fetch();
                if ($row && !empty($row['data'])) {
                    $decoded = json_decode($row['data'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $itemData = $decoded;
                    }
                }
            } catch (PDOException $e) {}
        }

        $filePath = $promoDir . '/' . $k . '.json';
        if ($itemData === null && file_exists($filePath)) {
            $rawJson = @file_get_contents($filePath);
            $decoded = json_decode($rawJson, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $itemData = $decoded;
            }
        }

        if ($itemData !== null) {
            $allData[$k] = $itemData;
        }

        // Tentukan judul tampilan
        $title = $itemData['document_title'] 
            ?? $itemData['program_name'] 
            ?? $itemData['meta']['title'] 
            ?? ($k === 'promo_dsf' ? 'Promo Penjualan (DSF)' : ($k === 'progam_service' ? 'Promo & Program Servis' : ($k === 'progam_referral' ? 'Program Referral' : ucwords(str_replace(['promo_', 'progam_', '_'], ['', '', ' '], $k)))));

        $fileList[] = [
            'id' => $k,
            'title' => $title,
            'filename' => $k . '.json',
            'is_builtin' => in_array($k, $builtinKeys),
            'has_data' => ($itemData !== null)
        ];
    }

    jsonResponse(true, 'Success', [
        'promos' => $allData,
        'files' => $fileList
    ]);

} elseif ($method === 'POST') {
    $body = getPostBody();

    $targetFile = $requestedFile;
    $targetData = $body;

    if (isset($body['file']) && isset($body['data'])) {
        $targetFile = sanitizePromoKey($body['file']);
        $targetData = $body['data'];
    }

    if (empty($targetFile)) {
        jsonResponse(false, 'Parameter nama file atau ID promo tidak boleh kosong', null, 400);
    }

    if (empty($targetData) || !is_array($targetData)) {
        jsonResponse(false, 'Payload data JSON tidak boleh kosong', null, 400);
    }

    $filePath = $promoDir . '/' . $targetFile . '.json';
    $jsonData = json_encode($targetData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

    if ($jsonData === false) {
        jsonResponse(false, 'Format JSON tidak valid', null, 400);
    }

    // 1. Simpan ke database app_data
    $dbSaved = false;
    if ($db) {
        try {
            $stmt = $db->prepare("
                INSERT INTO app_data (key_name, data) 
                VALUES (:key_name, :data) 
                ON DUPLICATE KEY UPDATE data = :data_update
            ");
            $stmt->execute([
                ':key_name' => $targetFile,
                ':data' => $jsonData,
                ':data_update' => $jsonData
            ]);
            $dbSaved = true;
        } catch (PDOException $e) {
            error_log('Database error in promo API: ' . $e->getMessage());
        }
    }

    // 2. Simpan juga ke file fisik lokal
    $fileSaved = false;
    if (is_writable($promoDir) || (file_exists($filePath) && is_writable($filePath))) {
        if (@file_put_contents($filePath, $jsonData) !== false) {
            $fileSaved = true;
        }
    }

    if ($dbSaved || $fileSaved) {
        jsonResponse(true, "Data promo '{$targetFile}.json' berhasil disimpan" . ($dbSaved ? ' ke app_data' : '') . ($fileSaved ? ' dan file lokal' : ''), [
            'id' => $targetFile,
            'filename' => $targetFile . '.json',
            'data' => $targetData
        ]);
    } else {
        jsonResponse(false, 'Gagal menyimpan ke database maupun file lokal', null, 500);
    }

} else {
    jsonResponse(false, 'Method Not Allowed', null, 405);
}
