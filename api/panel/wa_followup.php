<?php
// === WA Follow-up API ===
// Dedicated endpoint for WhatsApp follow-up panel
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
    // Bulk update BPKB status to READY based on an array of Rangka
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (isset($body['action']) && $body['action'] === 'upload_bpkb') {
        $rangkas = $body['data'] ?? [];
        if (empty($rangkas)) {
            echo json_encode(['status' => false, 'message' => 'Data rangka kosong']);
            exit;
        }

        $successCount = 0;
        foreach ($rangkas as $r) {
            $exrangka = mysqli_real_escape_string($conn, $r);
            // Check if rangka exists and bpkb is not already set? 
            // Legacy check: SELECT * FROM surveyupdate WHERE rangka = '$exrangka' AND bpkb != ''
            $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM surveyupdate WHERE rangka = '$exrangka' AND bpkb != ''"));
            if ($cekrangka === 0) {
                $queryexcel = "UPDATE surveyupdate SET bpkb = 'READY' WHERE rangka = '$exrangka'";
                if (mysqli_query($conn, $queryexcel)) {
                    if (mysqli_affected_rows($conn) > 0) {
                        $successCount++;
                    }
                }
            }
        }
        
        echo json_encode(['status' => true, 'message' => "$successCount data BPKB berhasil diupdate ke status READY"]);
        exit;
    }
}

if ($method === 'GET') {
    $tab = $_GET['tab'] ?? '';

    if ($tab === 'konfirmasi') {
        // Status REQUEST atau UBAH, tanpa filter tanggal
        $query = "SELECT * FROM booking WHERE status IN ('REQUEST', 'UBAH') ORDER BY time DESC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data]);

    } elseif ($tab === 'h1') {
        // Status BOOKING, tanggal = besok
        $besok = date('Y-m-d', strtotime('+1 day'));
        $query = "SELECT * FROM booking WHERE status = 'BOOKING' AND tanggal = '$besok' ORDER BY jam ASC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data, 'tanggal' => $besok]);

    } elseif ($tab === 'h30') {
        // Status BOOKING, tanggal = hari ini
        $today = date('Y-m-d');
        $query = "SELECT * FROM booking WHERE status = 'BOOKING' AND tanggal = '$today' ORDER BY jam ASC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data, 'tanggal' => $today]);

    } elseif ($tab === 'pajak_stnk') {
        // STNK Pajak reminder: 30 days before (range: 20 to 30 days from today)
        $hariinifix = date('Y-m-d');
        $hplus20 = date('Y-m-d', strtotime($hariinifix . ' +20 days'));
        $hplus30 = date('Y-m-d', strtotime($hplus20 . ' +10 days'));

        $query = "SELECT * FROM konsumen WHERE one_year BETWEEN '$hplus20' AND '$hplus30' ORDER BY one_year ASC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data]);

    } elseif ($tab === 'bpkb_ready') {
        $query = "SELECT * FROM surveyupdate WHERE bpkb = 'READY' OR bpkb = 'CALL' ORDER BY id DESC";
        $result = mysqli_query($conn, $query);
        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }
        echo json_encode(['status' => true, 'data' => $data]);

    } else {
        echo json_encode(['status' => false, 'message' => 'Invalid tab parameter. Use: konfirmasi, h1, h30, pajak_stnk, bpkb_ready']);
    }

} elseif ($method === 'PUT') {
    // Update status booking (for konfirmasi -> BOOKING)
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id     = (int)($body['id'] ?? 0);
    $status = mysqli_real_escape_string($conn, $body['status'] ?? '');
    $user   = mysqli_real_escape_string($conn, $body['user'] ?? 'ADMIN');
    $action = mysqli_real_escape_string($conn, $body['action'] ?? 'Whatsapp Konfirmasi');

    if ($id <= 0) {
        echo json_encode(['status' => false, 'message' => 'ID wajib diisi']);
        exit;
    }

    if ($action === 'WA STNK') {
        // Update konsumen table
        $oldQuery = mysqli_query($conn, "SELECT one_year, telp, kendaraan, nopol FROM konsumen WHERE id = $id");
        $oldData = mysqli_fetch_assoc($oldQuery);
        if (!$oldData) {
            echo json_encode(['status' => false, 'message' => 'Data tidak ditemukan']);
            exit;
        }

        $one_year = $oldData['one_year'] ?? '';
        $telp = $oldData['telp'] ?? '';
        $nopol = $oldData['nopol'] ?? '';
        
        $nextyear = date('Y-m-d', strtotime($one_year . ' +1 year'));
        $updateQuery = "UPDATE konsumen SET one_year = '$nextyear' WHERE id = $id";
        
        if (mysqli_query($conn, $updateQuery)) {
            mysqli_query($conn, "INSERT INTO booking_record VALUES (NULL, $id, NULL, '$user', 'WA STNK', '$telp', '$nopol')");
            echo json_encode(['status' => true, 'message' => "Masa berlaku STNK berhasil diperbarui ke $nextyear"]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Gagal memperbarui masa berlaku STNK']);
        }
        exit;
    }

    if ($action === 'WA BPKB') {
        $hari_ini = date('Y-m-d');
        $updateQuery = "UPDATE surveyupdate SET bpkb = 'WA $hari_ini' WHERE id = $id";
        
        if (mysqli_query($conn, $updateQuery)) {
            // Also insert into booking_record for history
            $oldQuery = mysqli_query($conn, "SELECT telp, nopol FROM surveyupdate WHERE id = $id");
            $oldData = mysqli_fetch_assoc($oldQuery);
            $telp = $oldData['telp'] ?? '';
            $nopol = $oldData['nopol'] ?? '';
            mysqli_query($conn, "INSERT INTO booking_record VALUES (NULL, $id, NULL, '$user', 'WA BPKB', '$telp', '$nopol')");
            
            echo json_encode(['status' => true, 'message' => "Status BPKB diperbarui ke WA $hari_ini"]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Gagal memperbarui status BPKB']);
        }
        exit;
    }

    if (empty($status)) {
        echo json_encode(['status' => false, 'message' => 'Status wajib diisi']);
        exit;
    }

    // Get telp for record
    $oldQuery = mysqli_query($conn, "SELECT telp FROM booking WHERE id = $id");
    $oldData = mysqli_fetch_assoc($oldQuery);
    $telp = $oldData['telp'] ?? '';

    // Update status
    $updateQuery = "UPDATE booking SET status = '$status' WHERE id = $id";
    if (mysqli_query($conn, $updateQuery)) {
        // Insert record
        mysqli_query($conn, "INSERT INTO booking_record VALUES (NULL, $id, NULL, '$user', '$status', '$action', '$telp')");
        echo json_encode(['status' => true, 'message' => "Status berhasil diubah ke $status"]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal mengubah status']);
    }
}

mysqli_close($conn);
?>
