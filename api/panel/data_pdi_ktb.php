<?php
// === Data PDI KTB API ===
// Endpoint for PDI data management (only PDI status)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        $search = $_GET['search'] ?? '';

        $where = "WHERE status IN ('PDI', 'Belum', 'Pre PDI', 'PKT')";

        if (!empty($search)) {
            $search = mysqli_real_escape_string($conn, $search);
            $where = "WHERE status IN ('PDI', 'Belum', 'Pre PDI', 'PKT') AND (nama LIKE '%$search%' OR rangka LIKE '%$search%' OR spv LIKE '%$search%' OR kendaraan LIKE '%$search%' OR sales LIKE '%$search%' OR telp LIKE '%$search%')";
        }

        $query = "SELECT * FROM pkt_cv $where ORDER BY id DESC";
        $result = mysqli_query($conn, $query);

        $data = [];
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
        }

        echo json_encode([
            'status' => true,
            'data' => $data
        ]);
    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid.']);
    }

} elseif ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $action = $body['action'] ?? ($_GET['action'] ?? '');

    if ($action === 'update') {
        $id = isset($body['id']) ? intval($body['id']) : 0;
        if ($id <= 0) {
            echo json_encode(['status' => false, 'message' => 'ID tidak valid.']);
            exit;
        }

        $status = isset($body['status']) ? mysqli_real_escape_string($conn, $body['status']) : '';
        $nama = isset($body['nama']) ? mysqli_real_escape_string($conn, $body['nama']) : '';
        $telp = isset($body['telp']) ? mysqli_real_escape_string($conn, $body['telp']) : '';
        $rangka = isset($body['rangka']) ? mysqli_real_escape_string($conn, $body['rangka']) : '';
        $kendaraan = isset($body['kendaraan']) ? mysqli_real_escape_string($conn, $body['kendaraan']) : '';
        $spv = isset($body['spv']) ? mysqli_real_escape_string($conn, $body['spv']) : '';
        $sales = isset($body['sales']) ? mysqli_real_escape_string($conn, $body['sales']) : '';

        $pdi_date = empty($body['pdi_date']) ? 'NULL' : "'" . mysqli_real_escape_string($conn, $body['pdi_date']) . "'";
        $pkt_date = empty($body['pkt_date']) ? 'NULL' : "'" . mysqli_real_escape_string($conn, $body['pkt_date']) . "'";
        $rs = empty($body['rs']) ? 'NULL' : "'" . mysqli_real_escape_string($conn, $body['rs']) . "'";

        $note = isset($body['note']) ? mysqli_real_escape_string($conn, $body['note']) : '';

        $query = "UPDATE pkt_cv SET 
            status = '$status',
            nama = '$nama',
            telp = '$telp',
            rangka = '$rangka',
            kendaraan = '$kendaraan',
            spv = '$spv',
            sales = '$sales',
            pdi_date = $pdi_date,
            pkt_date = $pkt_date,
            rs = $rs,
            note = '$note'
            WHERE id = $id";

        if (mysqli_query($conn, $query)) {
            echo json_encode(['status' => true, 'message' => 'Data berhasil diupdate.']);
        } else {
            echo json_encode(['status' => false, 'message' => 'Gagal update data: ' . mysqli_error($conn)]);
        }
    } else {
        echo json_encode(['status' => false, 'message' => 'Action tidak valid.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
}

mysqli_close($conn);
?>