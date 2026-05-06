<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bulan = $_GET['bulan'] ?? '';
    $divisi = $_GET['divisi'] ?? '';
    $cabang = $_GET['cabang'] ?? ''; // empty = all
    $search = trim($_GET['search'] ?? '');

    if (empty($bulan) || empty($divisi)) {
        jsonResponse(false, 'Parameter bulan dan divisi wajib diisi.', null, 400);
    }

    $pdo = getDB();

    try {
        $bulanArr = explode(',', $bulan);
        $placeholders = str_repeat('?,', count($bulanArr) - 1) . '?';
        
        $params = [...$bulanArr, $divisi];
        $whereClause = "bulan IN ($placeholders) AND divisi = ?";

        if (!empty($cabang) && $cabang !== 'All') {
            $whereClause .= " AND cabang = ?";
            $params[] = $cabang;
        }

        if (!empty($search)) {
            $whereClause .= " AND (nama LIKE ? OR rangka LIKE ? OR kendaraan LIKE ? OR note LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // 1. Fetch Summary
        $stmtSummary = $pdo->prepare("
            SELECT 
                SUM(CASE WHEN score >= 9 THEN 1 ELSE 0 END) AS promoters,
                SUM(CASE WHEN score >= 7 AND score <= 8 THEN 1 ELSE 0 END) AS passives,
                SUM(CASE WHEN score <= 6 THEN 1 ELSE 0 END) AS detractors,
                COUNT(*) AS total
            FROM nps_data
            WHERE $whereClause
        ");
        $stmtSummary->execute($params);
        $summaryData = $stmtSummary->fetch();
        
        $summary = [
            'promoters' => (int)$summaryData['promoters'],
            'passives' => (int)$summaryData['passives'],
            'detractors' => (int)$summaryData['detractors'],
            'total' => (int)$summaryData['total'],
            'nps' => 0
        ];
        if ($summary['total'] > 0) {
            $summary['nps'] = round((($summary['promoters'] - $summary['detractors']) / $summary['total']) * 100);
        }

        // 2. Fetch Detailed List
        $stmtList = $pdo->prepare("
            SELECT id, bulan, cabang, divisi, nama, rangka, kendaraan, score, note, created_at
            FROM nps_data
            WHERE $whereClause
            ORDER BY created_at DESC, id DESC
        ");
        $stmtList->execute($params);
        $list = $stmtList->fetchAll();

        // Add NPS Status Label for convenience
        foreach ($list as &$row) {
            $score = (int)$row['score'];
            $row['score'] = $score;
            if ($score >= 9) {
                $row['status_nps'] = 'Promotor';
            } elseif ($score >= 7) {
                $row['status_nps'] = 'Passive';
            } else {
                $row['status_nps'] = 'Detractor';
            }
        }

        jsonResponse(true, 'Data berhasil diambil.', [
            'summary' => $summary,
            'list' => $list
        ]);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), "doesn't exist") !== false) {
            jsonResponse(false, 'Tabel nps_data belum dibuat.', null, 500);
        }
        jsonResponse(false, 'Gagal mengambil data: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $action = $body['action'] ?? '';

    if ($action === 'delete') {
        $id = $body['id'] ?? null;

        if (empty($id)) {
            jsonResponse(false, 'Parameter id wajib diisi.', null, 400);
        }

        $pdo = getDB();

        try {
            $stmt = $pdo->prepare("DELETE FROM nps_data WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                jsonResponse(true, 'Data berhasil dihapus.');
            } else {
                jsonResponse(false, 'Data tidak ditemukan.', null, 404);
            }
        } catch (Exception $e) {
            jsonResponse(false, 'Gagal menghapus data: ' . $e->getMessage(), null, 500);
        }
    } else {
        jsonResponse(false, 'Action tidak dikenali.', null, 400);
    }
} else {
    jsonResponse(false, 'Method not allowed', null, 405);
}
