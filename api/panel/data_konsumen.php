<?php
// === Data Konsumen Legacy API ===
// Handles pagination and search for konsumen table (u444914729_csdwindo)
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
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 20;
    
    $offset = ($page - 1) * $limit;
    
    $whereClause = "";
    $filters = [];
    if (!empty($search)) {
        $filters[] = "(nama LIKE '%$search%' OR nopol LIKE '%$search%' OR telp LIKE '%$search%')";
    }
    
    if (isset($_GET['filter']) && $_GET['filter'] === 'empty_pajak') {
        $filters[] = "(one_year = '' OR five_year = '' OR one_year IS NULL OR five_year IS NULL)";
    }

    if (count($filters) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $filters);
    }
    
    // Get total rows for pagination
    $countQuery = "SELECT COUNT(id) as total FROM konsumen $whereClause";
    $countResult = mysqli_query($conn, $countQuery);
    $totalRows = 0;
    if ($countResult) {
        $countData = mysqli_fetch_assoc($countResult);
        $totalRows = (int)$countData['total'];
    }
    
    // Get data
    $query = "SELECT * FROM konsumen $whereClause ORDER BY id DESC LIMIT $limit OFFSET $offset";
    $result = mysqli_query($conn, $query);
    
    $data = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
    }

    echo json_encode([
        'status' => true,
        'data' => $data,
        'pagination' => [
            'total' => $totalRows,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($totalRows / $limit)
        ]
    ]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);

    $id = isset($body['id']) ? (int)$body['id'] : 0;
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'ID Konsumen tidak valid']);
        exit;
    }

    $one_year = isset($body['one_year']) ? mysqli_real_escape_string($conn, $body['one_year']) : '';
    $five_year = isset($body['five_year']) ? mysqli_real_escape_string($conn, $body['five_year']) : '';
    $prioritas = isset($body['prioritas']) ? (int)$body['prioritas'] : 0;

    $query = "UPDATE konsumen SET one_year = '$one_year', five_year = '$five_year', prioritas = $prioritas WHERE id = $id";
    
    if (mysqli_query($conn, $query)) {
        echo json_encode(['status' => true, 'message' => 'Data berhasil diperbarui']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'message' => 'Gagal memperbarui data']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => false, 'message' => 'Method not allowed']);
}

mysqli_close($conn);
?>
