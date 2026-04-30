<?php
// === Legacy Database Configuration ===
// Koneksi ke database lama (u444914729_csdwindo)

define('LEGACY_DB_HOST', '153.92.15.23');
define('LEGACY_DB_USER', 'u444914729_barod');
define('LEGACY_DB_PASS', '');
define('LEGACY_DB_NAME', '');

function getLegacyDB()
{
    static $conn = null;
    if ($conn === null) {
        $conn = mysqli_connect(LEGACY_DB_HOST, LEGACY_DB_USER, LEGACY_DB_PASS, LEGACY_DB_NAME);
        if (!$conn) {
            http_response_code(500);
            echo json_encode(['status' => false, 'message' => 'Legacy DB connection failed']);
            exit;
        }
        mysqli_set_charset($conn, "utf8mb4");
    }
    return $conn;
}
