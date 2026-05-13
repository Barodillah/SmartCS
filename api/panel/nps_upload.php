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
        
        // Prepared statement to check for existing rangka in the same period
        $checkStmt = $pdo->prepare("
            SELECT COUNT(*) FROM nps_data 
            WHERE rangka = ? AND bulan = ? AND cabang = ? AND divisi = ?
        ");

        $stmt = $pdo->prepare("
            INSERT INTO nps_data (bulan, cabang, divisi, nama, rangka, kendaraan, score, note) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $inserted = 0;
        $skipped = 0;
        foreach ($rows as $row) {
            $nama = $row['Nama'] ?? null;
            $rangka = $row['Rangka'] ?? null;
            $kendaraan = $row['Kendaraan'] ?? null;
            $score = isset($row['Score']) && $row['Score'] !== '' ? (int)$row['Score'] : null;
            $note = $row['Note'] ?? null;
            
            // Skip totally empty rows
            if (empty($nama) && empty($rangka) && empty($score)) continue;

            // Skip if rangka already exists in the same period (bulan+cabang+divisi)
            if (!empty($rangka)) {
                $checkStmt->execute([$rangka, $bulan, $cabang, $divisi]);
                if ($checkStmt->fetchColumn() > 0) {
                    $skipped++;
                    continue;
                }
            }

            $stmt->execute([$bulan, $cabang, $divisi, $nama, $rangka, $kendaraan, $score, $note]);
            $inserted++;
        }

        $pdo->commit();
        $msg = "$inserted data berhasil diupload.";
        if ($skipped > 0) {
            $msg .= " $skipped data dilewati (rangka sudah ada di periode ini).";
        }
        jsonResponse(true, $msg);
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
