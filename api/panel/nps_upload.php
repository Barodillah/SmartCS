<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = getPostBody();
    
    $bulan = $body['bulan'] ?? '';
    $cabang = $body['cabang'] ?? '';
    $divisi = $body['divisi'] ?? '';
    $rows = $body['rows'] ?? [];

    if (empty($bulan) || empty($cabang) || empty($divisi)) {
        jsonResponse(false, 'Bulan, Cabang, dan Divisi wajib diisi.', null, 400);
    }

    if (empty($rows) || !is_array($rows)) {
        jsonResponse(false, 'Data Excel tidak boleh kosong.', null, 400);
    }

    $pdo = getDB();
    
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO nps_data (bulan, cabang, divisi, nama, rangka, kendaraan, score, note) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $inserted = 0;
        foreach ($rows as $row) {
            $nama = $row['Nama'] ?? null;
            $rangka = $row['Rangka'] ?? null;
            $kendaraan = $row['Kendaraan'] ?? null;
            $score = isset($row['Score']) && $row['Score'] !== '' ? (int)$row['Score'] : null;
            $note = $row['Note'] ?? null;
            
            // Skip totally empty rows
            if (empty($nama) && empty($rangka) && empty($score)) continue;

            $stmt->execute([$bulan, $cabang, $divisi, $nama, $rangka, $kendaraan, $score, $note]);
            $inserted++;
        }

        $pdo->commit();
        jsonResponse(true, "$inserted data berhasil diupload.");
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // If table doesn't exist, provide a helpful message
        if (strpos($e->getMessage(), "Table") !== false && strpos($e->getMessage(), "doesn't exist") !== false) {
             jsonResponse(false, 'Tabel nps_data belum dibuat. Silakan eksekusi query SQL yang diberikan.', null, 500);
        }
        jsonResponse(false, 'Gagal menyimpan data: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, 'Method not allowed', null, 405);
}
