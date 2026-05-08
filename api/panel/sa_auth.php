<?php
require_once __DIR__ . '/../config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
$db->exec("CREATE TABLE IF NOT EXISTS sa_auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sa_name VARCHAR(50) UNIQUE NOT NULL,
    pin VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    $name = $_GET['name'] ?? '';

    if ($action === 'check') {
        if (empty($name)) jsonResponse(false, 'Name is required');
        
        $stmt = $db->prepare("SELECT id FROM sa_auth WHERE sa_name = ?");
        $stmt->execute([$name]);
        $exists = $stmt->fetch() ? true : false;
        
        jsonResponse(true, '', ['exists' => $exists]);
    }
} 
elseif ($method === 'POST') {
    $body = getPostBody();
    $action = $body['action'] ?? '';
    $name = $body['name'] ?? '';
    $pin = $body['pin'] ?? '';

    if (empty($name) || empty($pin)) {
        jsonResponse(false, 'Name and PIN are required');
    }

    if ($action === 'setup') {
        // Check if already exists
        $stmt = $db->prepare("SELECT id FROM sa_auth WHERE sa_name = ?");
        $stmt->execute([$name]);
        if ($stmt->fetch()) {
            jsonResponse(false, 'PIN already setup for this SA');
        }

        $hashedPin = password_hash($pin, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO sa_auth (sa_name, pin) VALUES (?, ?)");
        $stmt->execute([$name, $hashedPin]);

        jsonResponse(true, 'PIN setup successful');
    } 
    elseif ($action === 'verify') {
        $stmt = $db->prepare("SELECT pin FROM sa_auth WHERE sa_name = ?");
        $stmt->execute([$name]);
        $row = $stmt->fetch();

        if (!$row) {
            jsonResponse(false, 'SA not found or PIN not setup');
        }

        if (password_verify($pin, $row['pin'])) {
            jsonResponse(true, 'PIN verified');
        } else {
            jsonResponse(false, 'PIN salah');
        }
    }
}

jsonResponse(false, 'Invalid request');
