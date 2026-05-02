<?php
// === Sales Survey API ===
// Endpoint for Sales Survey management (follow up konsumen)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'upload_pdi_mmksi') {
        $json_data = $_POST['data'] ?? '[]';
        $rows = json_decode($json_data, true);
        
        if (!is_array($rows) || empty($rows)) {
            echo json_encode(['status' => false, 'message' => 'Data tidak valid']);
            exit;
        }
        
        $inserted = 0;
        $skipped = 0;
        
        foreach ($rows as $row) {
            $exnama = mysqli_real_escape_string($conn, $row['nama'] ?? '');
            $extelp = mysqli_real_escape_string($conn, $row['telp'] ?? '');
            
            // Handle date format if needed (legacy uses raw date from excel)
            $exdate = $row['date'] ?? '';
            if (is_numeric($exdate)) {
                // Excel serial date to YYYY-MM-DD
                $unix_date = ($exdate - 25569) * 86400;
                $exdate = gmdate("Y-m-d", $unix_date);
            }
            $exwadate = mysqli_real_escape_string($conn, $exdate);
            $expdidate = mysqli_real_escape_string($conn, $exdate);
            
            $exrangka = mysqli_real_escape_string($conn, $row['rangka'] ?? '');
            $exkendaraan = mysqli_real_escape_string($conn, $row['kendaraan'] ?? '');
            $exsales = mysqli_real_escape_string($conn, $row['sales'] ?? '');
            $exspv = mysqli_real_escape_string($conn, $row['spv'] ?? '');
            
            // Check if rangka already exists
            $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE rangka = '$exrangka'"));
        
            if ($cekrangka === 0 && !empty($exrangka)) {
                $queryexcel = "INSERT INTO surveyupdate VALUES (NULL, NULL, 'PDI', '$exnama', '$extelp', '$exrangka', '$exkendaraan', '$exspv', '$exsales', '$expdidate', '$exwadate', '', '', '', '', '', '')";
                mysqli_query($conn, $queryexcel);
                $inserted++;
            } else {
                $skipped++;
            }
        }
        
        echo json_encode([
            'status' => true,
            'message' => "Berhasil mengupload. Masuk: $inserted, Dilewati: $skipped (Duplikat)"
        ]);
        exit;
    }
}

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        // === LIST / SEARCH DATA ===
        $search  = $_GET['search'] ?? '';
        $month   = $_GET['month'] ?? '';
        $filter  = $_GET['filter'] ?? ''; // 'belum' = belum follow up
        $days    = (int)($_GET['days'] ?? 0); // limit by last N days

        $where = "WHERE status != 'PDI'";

        if (!empty($search)) {
            $search = mysqli_real_escape_string($conn, $search);
            $where = "WHERE (nama LIKE '%$search%' OR rangka LIKE '%$search%' OR spv LIKE '%$search%' OR kendaraan LIKE '%$search%' OR sales LIKE '%$search%')";
        } elseif ($filter === 'belum') {
            $where = "WHERE status IN ('PERLU FOLLOW UP', 'TIDAK DIANGKAT', 'DITOLAK/REJECT', 'PERJANJIAN')";
            if ($days > 0) {
                $dateFrom = date('Y-m-d', strtotime("-{$days} days"));
                $where .= " AND wa_date >= '$dateFrom'";
            } elseif (!empty($month)) {
                $dari1 = mysqli_real_escape_string($conn, $month . '-01');
                $dari2 = mysqli_real_escape_string($conn, $month . '-31');
                $where .= " AND wa_date BETWEEN '$dari1' AND '$dari2'";
            }
        } elseif ($filter === 'pdi') {
            $where = "WHERE status = 'PDI'";
            if ($days > 0) {
                $dateFrom = date('Y-m-d', strtotime("-{$days} days"));
                $where .= " AND pdi_date >= '$dateFrom'";
            }
        } elseif (!empty($month)) {
            // month format: YYYY-MM
            $dari1 = mysqli_real_escape_string($conn, $month . '-01');
            $dari2 = mysqli_real_escape_string($conn, $month . '-31');
            $where = "WHERE status != 'PDI' AND wa_date BETWEEN '$dari1' AND '$dari2'";
        } else {
            // Default: tampilkan semua data terbaru (tanpa filter bulan)
            $where = "WHERE status != 'PDI'";
        }

        $query  = "SELECT * FROM surveyupdate $where ORDER BY id DESC";
        $result = mysqli_query($conn, $query);

        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }

        // Count belum follow up
        $countRes = mysqli_query($conn, "SELECT COUNT(*) as total FROM surveyupdate WHERE status = 'PERLU FOLLOW UP'");
        $countRow = mysqli_fetch_assoc($countRes);
        $belumFollowUp = (int)($countRow['total'] ?? 0);

        echo json_encode([
            'status' => true,
            'data' => $data,
            'belum_follow_up' => $belumFollowUp
        ]);

    } elseif ($action === 'logs') {
        // === GET FOLLOW UP LOGS FOR A UNIT ===
        $unit_id = (int)($_GET['unit_id'] ?? 0);

        if ($unit_id <= 0) {
            echo json_encode(['status' => false, 'message' => 'unit_id wajib diisi']);
            exit;
        }

        $query = "SELECT * FROM surveyupdate_record WHERE unit_id = $unit_id ORDER BY time ASC";
        $result = mysqli_query($conn, $query);

        $logs = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $logs[] = [
                    'id'     => $row['id'],
                    'date'   => $row['time'],
                    'status' => $row['status'],
                    'pkt'    => $row['pkt'] ?? ''
                ];
            }
        }

        echo json_encode(['status' => true, 'data' => $logs]);

    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid. Gunakan: list, logs']);
    }

} elseif ($method === 'PUT') {
    // === UPDATE STATUS SURVEY ===
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id      = (int)($body['id'] ?? 0);
    $status  = mysqli_real_escape_string($conn, $body['status'] ?? '');
    $est     = mysqli_real_escape_string($conn, $body['est'] ?? '');
    $note    = mysqli_real_escape_string($conn, $body['note'] ?? '');
    $pkt     = mysqli_real_escape_string($conn, $body['pkt'] ?? 'No');
    $wa_date = mysqli_real_escape_string($conn, $body['wa_date'] ?? '');

    if ($id <= 0 || empty($status)) {
        echo json_encode(['status' => false, 'message' => 'ID dan status wajib diisi']);
        exit;
    }

    // Update surveyupdate table
    $waDateSql = !empty($wa_date) ? ", wa_date = '$wa_date'" : "";
    $updateQuery = "UPDATE surveyupdate SET 
                    status = '$status',
                    est = '$est',
                    note = '$note'
                    $waDateSql
                    WHERE id = $id";

    if (mysqli_query($conn, $updateQuery)) {
        // Insert record log
        $recordQuery = "INSERT INTO surveyupdate_record VALUES (NULL, NULL, $id, '$status', '$pkt')";
        mysqli_query($conn, $recordQuery);

        echo json_encode(['status' => true, 'message' => 'Status survey berhasil diperbarui']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal memperbarui status survey']);
    }
}

mysqli_close($conn);
?>
