<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }
    
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $status = isset($input['status']) ? mysqli_real_escape_string($conn, $input['status']) : '';
    $note = isset($input['note']) ? mysqli_real_escape_string($conn, $input['note']) : '';
    
    if ($id <= 0 || empty($status)) {
        echo json_encode(['status' => false, 'message' => 'Invalid data']);
        exit;
    }
    
    $query = "SELECT * FROM dissatisfation WHERE id = $id";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);
    
    if (!$row) {
        echo json_encode(['status' => false, 'message' => 'Data not found']);
        exit;
    }
    
    $currentPenanganan = isset($row['penanganan']) ? $row['penanganan'] : '';
    $newPenanganan = $currentPenanganan;
    if (!empty($note)) {
        if (!empty($currentPenanganan)) {
            $newPenanganan = $currentPenanganan . " - " . $note;
        } else {
            $newPenanganan = $note;
        }
    }
    
    $isTerminalStatus = in_array($status, ['SALAH SAMBUNG', 'SELESAI']);
    
    $updateFields = [];
    $today = date('Y-m-d');
    
    $call1 = empty($row['call1']) || $row['call1'] == '0000-00-00' ? '' : $row['call1'];
    $call2 = empty($row['call2']) || $row['call2'] == '0000-00-00' ? '' : $row['call2'];
    $call3 = empty($row['call3']) || $row['call3'] == '0000-00-00' ? '' : $row['call3'];
    
    $finalStatus = 'CALL1';
    $finalPenanganan = $newPenanganan;
    
    if (empty($call1)) {
        $updateFields[] = "call1 = '$today'";
        $updateFields[] = "hasil1 = '$status'";
        $finalStatus = 'CALL1';
    } elseif (empty($call2)) {
        $updateFields[] = "call2 = '$today'";
        $updateFields[] = "hasil2 = '$status'";
        $finalStatus = 'CALL2';
    } else {
        $updateFields[] = "call3 = '$today'";
        $updateFields[] = "hasil3 = '$status'";
        $finalStatus = 'CALL3';
        
        if (in_array($status, ['TIDAK DIANGKAT', 'NOMOR TIDAK AKTIF'])) {
            $finalStatus = 'CLOSE';
            $appendStr = "Auto Completed, 3x Percobaan Telpon";
            if (!empty($finalPenanganan)) {
                $finalPenanganan .= " - " . $appendStr;
            } else {
                $finalPenanganan = $appendStr;
            }
        }
    }
    
    if ($isTerminalStatus) {
        $finalStatus = 'CLOSE';
        if ($status === 'SELESAI') {
            $updateFields[] = "tgl_selesai = '$today'";
        }
    }
    
    $updateFields[] = "status = '$finalStatus'";
    $updateFields[] = "penanganan = '$finalPenanganan'";
    
    $updateStr = implode(", ", $updateFields);
    $updateQuery = "UPDATE dissatisfation SET $updateStr WHERE id = $id";
    
    if (mysqli_query($conn, $updateQuery)) {
        echo json_encode(['status' => true, 'message' => 'Success']);
    } else {
        echo json_encode(['status' => false, 'message' => mysqli_error($conn)]);
    }
}
mysqli_close($conn);
?>
