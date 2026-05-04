<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bulan = $_GET['bulan'] ?? '';
    $divisi = $_GET['divisi'] ?? '';
    $cabang = $_GET['cabang'] ?? ''; // empty = all

    if (empty($bulan) || empty($divisi)) {
        jsonResponse(false, 'Parameter bulan dan divisi wajib diisi.', null, 400);
    }

    $pdo = getDB();

    try {
        $bulanArr = explode(',', $bulan);
        $placeholders = str_repeat('?,', count($bulanArr) - 1) . '?';

        // Build query based on cabang filter
        if (empty($cabang) || $cabang === 'All') {
            // Return aggregated data per cabang
            $stmt = $pdo->prepare("
                SELECT cabang,
                    SUM(CASE WHEN score >= 9 THEN 1 ELSE 0 END) AS promoters,
                    SUM(CASE WHEN score >= 7 AND score <= 8 THEN 1 ELSE 0 END) AS passives,
                    SUM(CASE WHEN score <= 6 THEN 1 ELSE 0 END) AS detractors,
                    COUNT(*) AS total
                FROM nps_data
                WHERE bulan IN ($placeholders) AND divisi = ?
                GROUP BY cabang
                ORDER BY cabang
            ");
            $stmt->execute([...$bulanArr, $divisi]);
        } else {
            // Return data for specific cabang
            $stmt = $pdo->prepare("
                SELECT cabang,
                    SUM(CASE WHEN score >= 9 THEN 1 ELSE 0 END) AS promoters,
                    SUM(CASE WHEN score >= 7 AND score <= 8 THEN 1 ELSE 0 END) AS passives,
                    SUM(CASE WHEN score <= 6 THEN 1 ELSE 0 END) AS detractors,
                    COUNT(*) AS total
                FROM nps_data
                WHERE bulan IN ($placeholders) AND divisi = ? AND cabang = ?
                GROUP BY cabang
            ");
            $stmt->execute([...$bulanArr, $divisi, $cabang]);
        }

        $rows = $stmt->fetchAll();

        // Calculate Dwindo (all) totals if cabang = All
        if (empty($cabang) || $cabang === 'All') {
            $dwindo = ['cabang' => 'Dwindo', 'promoters' => 0, 'passives' => 0, 'detractors' => 0, 'total' => 0];
            foreach ($rows as $row) {
                $dwindo['promoters'] += (int)$row['promoters'];
                $dwindo['passives'] += (int)$row['passives'];
                $dwindo['detractors'] += (int)$row['detractors'];
                $dwindo['total'] += (int)$row['total'];
            }
            $rows[] = $dwindo;
        }

        // Cast to int
        foreach ($rows as &$row) {
            $row['promoters'] = (int)$row['promoters'];
            $row['passives'] = (int)$row['passives'];
            $row['detractors'] = (int)$row['detractors'];
            $row['total'] = (int)$row['total'];
        }

        jsonResponse(true, 'Data berhasil diambil.', $rows);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), "doesn't exist") !== false) {
            jsonResponse(false, 'Tabel nps_data belum dibuat.', null, 500);
        }
        jsonResponse(false, 'Gagal mengambil data: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(false, 'Method not allowed', null, 405);
}
