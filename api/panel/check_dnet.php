<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/config_legacy.php';
$conn = getLegacyDB();

$dnet = mysqli_real_escape_string($conn, $_GET['dnet'] ?? '');
if (empty($dnet)) {
    echo json_encode(['exists' => false]);
    exit;
}

$check = mysqli_query($conn, "SELECT id FROM dissatisfation WHERE dnet = '$dnet'");
echo json_encode(['exists' => mysqli_num_rows($check) > 0]);
mysqli_close($conn);
?>
