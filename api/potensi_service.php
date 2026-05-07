<?php
// === Potensi Service API ===
// Manages potential service follow-up data for SA
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// SA roster for round-robin distribution (Ilham gets 2x)
$SA_ROSTER = ['Dimas', 'Ipral', 'Muti', 'Rudi', 'Yuda', 'Ilham', 'Ilham'];

/**
 * Format phone number to 08xxx
 */
function formatTelp($telp) {
    // Remove all non-digit characters
    $clean = preg_replace('/\D/', '', $telp);
    // Convert 62xxx to 0xxx
    if (strpos($clean, '62') === 0 && strlen($clean) > 2) {
        $clean = '0' . substr($clean, 2);
    }
    // Ensure starts with 0
    if (strpos($clean, '0') !== 0 && !empty($clean)) {
        $clean = '0' . $clean;
    }
    return $clean;
}

/**
 * Get next SA based on round-robin
 */
function getNextSA($db, $roster) {
    $stmt = $db->query("SELECT COUNT(*) as total FROM potensi_service");
    $row = $stmt->fetch();
    $total = (int)($row['total'] ?? 0);
    $index = $total % count($roster);
    return $roster[$index];
}

// ===================== GET =====================
if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        $where = "WHERE 1=1";
        $params = [];

        if (!empty($_GET['sa'])) {
            $where .= " AND sa = ?";
            $params[] = $_GET['sa'];
        }
        if (!empty($_GET['status'])) {
            $where .= " AND status = ?";
            $params[] = $_GET['status'];
        }
        if (!empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $where .= " AND (nopol LIKE ? OR nama LIKE ? OR kendaraan LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $stmt = $db->prepare("SELECT * FROM potensi_service $where ORDER BY id DESC");
        $stmt->execute($params);
        $data = $stmt->fetchAll();

        jsonResponse(true, '', $data);
    } else {
        jsonResponse(false, 'Action tidak valid', null, 400);
    }
}

// ===================== POST =====================
elseif ($method === 'POST') {
    $body = getPostBody();

    $nopol = strtoupper(preg_replace('/\s+/', '', $body['nopol'] ?? ''));
    $nama = strtoupper($body['nama'] ?? '');
    $telp = formatTelp($body['telp'] ?? '');
    $kendaraan = $body['kendaraan'] ?? '';
    $rangka = strtoupper(preg_replace('/[^A-Z0-9]/', '', $body['rangka'] ?? ''));
    $potensi_service = $body['potensi_service'] ?? '';
    $expected_date = !empty($body['expected_date']) ? $body['expected_date'] : null;
    $service_terakhir = $body['service_terakhir'] ?? '';
    $source = strtoupper($body['source'] ?? '');

    if (empty($nopol) || empty($nama)) {
        jsonResponse(false, 'Nopol dan Nama wajib diisi', null, 400);
    }

    // Auto-assign SA via round-robin
    $sa = getNextSA($db, $SA_ROSTER);

    $stmt = $db->prepare("INSERT INTO potensi_service 
        (nopol, nama, telp, kendaraan, rangka, potensi_service, expected_date, service_terakhir, source, status, sa) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)");

    $stmt->execute([
        $nopol, $nama, $telp, $kendaraan, $rangka,
        $potensi_service, $expected_date, $service_terakhir, $source, $sa
    ]);

    $id = $db->lastInsertId();

    jsonResponse(true, "Data berhasil disimpan. Ditugaskan ke SA: $sa", [
        'id' => $id,
        'sa' => $sa
    ]);
}

// ===================== PUT =====================
elseif ($method === 'PUT') {
    $body = getPostBody();
    $id = (int)($body['id'] ?? 0);
    $nopol = $body['nopol'] ?? null;

    if ($id <= 0 && empty($nopol)) {
        jsonResponse(false, 'ID atau Nopol tidak valid', null, 400);
    }

    $fields = [];
    $params = [];

    $allowedFields = ['status', 'sa', 'note', 'potensi_service', 'expected_date'];
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $fields[] = "$field = ?";
            $params[] = $body[$field];
        }
    }

    if (empty($fields)) {
        jsonResponse(false, 'Tidak ada field yang diupdate', null, 400);
    }

    if ($id > 0) {
        $params[] = $id;
        $sql = "UPDATE potensi_service SET " . implode(', ', $fields) . " WHERE id = ?";
    } else {
        $params[] = $nopol;
        $sql = "UPDATE potensi_service SET " . implode(', ', $fields) . " WHERE REPLACE(UPPER(nopol), ' ', '') = REPLACE(UPPER(?), ' ', '')";
        if (isset($body['status']) && $body['status'] === 'BOOKING') {
            $sql .= " AND status != 'BOOKING'";
        }
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    jsonResponse(true, 'Data berhasil diupdate');
}

// ===================== DELETE =====================
elseif ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);

    if ($id <= 0) {
        jsonResponse(false, 'ID tidak valid', null, 400);
    }

    $stmt = $db->prepare("DELETE FROM potensi_service WHERE id = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        jsonResponse(true, 'Data berhasil dihapus');
    } else {
        jsonResponse(false, 'Data tidak ditemukan', null, 404);
    }
}
