<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';
    $month = isset($_GET['month']) ? mysqli_real_escape_string($conn, $_GET['month']) : '';
    $filterNew = isset($_GET['filter_new']) ? filter_var($_GET['filter_new'], FILTER_VALIDATE_BOOLEAN) : false;

    $whereClauses = [];

    if ($filterNew) {
        $whereClauses[] = "(status != 'CLOSE')";
    } else {
        if (!empty($month)) {
            $whereClauses[] = "tgl_srvy LIKE '$month-%'";
        }

        if (!empty($search)) {
            $whereClauses[] = "(nama LIKE '%$search%' OR rangka LIKE '%$search%' OR nopol LIKE '%$search%' OR keluhan LIKE '%$search%')";
        }
    }

    $whereSQL = "";
    if (count($whereClauses) > 0) {
        $whereSQL = "WHERE " . implode(" AND ", $whereClauses);
    }

    $query = "SELECT * FROM dissatisfation $whereSQL ORDER BY id DESC LIMIT 100";
    $result = mysqli_query($conn, $query);

    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }

    // Get total new count across all months
    $countQuery = "SELECT COUNT(*) as total FROM dissatisfation WHERE status != 'CLOSE'";
    $countResult = mysqli_query($conn, $countQuery);
    $newCount = 0;
    if ($countResult) {
        $countRow = mysqli_fetch_assoc($countResult);
        $newCount = (int) $countRow['total'];
    }

    echo json_encode(['status' => true, 'data' => $data, 'new_count' => $newCount]);
}
mysqli_close($conn);
?>