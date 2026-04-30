<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Parse input upfront for method override
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);
if (!is_array($data)) $data = [];

if ($method === 'POST' && isset($data['_method'])) {
    $method = strtoupper($data['_method']);
}

try {
    $db = getDB();

    switch ($method) {
        case 'GET':
            // List users
            $stmt = $db->query("SELECT * FROM users");
            $users = $stmt->fetchAll();
            jsonResponse(true, 'Data users', $users);
            break;

        case 'POST':
            // Create user
            if (empty($data['name']) || empty($data['username']) || empty($data['email']) || empty($data['password']) || empty($data['role'])) {
                jsonResponse(false, 'Data tidak lengkap', null, 400);
            }
            
            // Cek unique username & email
            $stmt_check = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt_check->execute([$data['username'], $data['email']]);
            if ($stmt_check->fetch()) {
                jsonResponse(false, 'Username atau Email sudah terdaftar', null, 400);
            }

            $id = generateUUID();
            $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);
            $divisi = !empty($data['divisi']) ? $data['divisi'] : null;
            $phone = !empty($data['phone']) ? $data['phone'] : '';
            $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

            $stmt = $db->prepare("INSERT INTO users (id, name, username, email, phone, password, role, divisi, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $data['name'], $data['username'], $data['email'], $phone, $hashed_password, $data['role'], $divisi, $is_active]);

            jsonResponse(true, 'User berhasil ditambahkan', ['id' => $id]);
            break;

        case 'PUT':
            // Update user
            if (empty($data['id'])) {
                jsonResponse(false, 'ID User wajib diisi', null, 400);
            }

            // Cek unique username & email exclude current
            $stmt_check = $db->prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?");
            $stmt_check->execute([$data['username'], $data['email'], $data['id']]);
            if ($stmt_check->fetch()) {
                jsonResponse(false, 'Username atau Email sudah dipakai oleh user lain', null, 400);
            }

            $divisi = !empty($data['divisi']) ? $data['divisi'] : null;
            $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;

            // Update tanpa mengubah password
            $stmt = $db->prepare("UPDATE users SET name = ?, username = ?, email = ?, phone = ?, role = ?, divisi = ?, is_active = ? WHERE id = ?");
            $stmt->execute([
                $data['name'], 
                $data['username'], 
                $data['email'], 
                $data['phone'], 
                $data['role'], 
                $divisi, 
                $is_active, 
                $data['id']
            ]);

            jsonResponse(true, 'User berhasil diupdate');
            break;

        case 'DELETE':
            // Delete user
            $id = $_GET['id'] ?? null;
            if (!$id) {
                $id = $data['id'] ?? null;
            }
            
            if (empty($id)) {
                jsonResponse(false, 'ID User wajib diisi', null, 400);
            }

            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);

            jsonResponse(true, 'User berhasil dihapus');
            break;

        default:
            jsonResponse(false, 'Method tidak diizinkan', null, 405);
            break;
    }

} catch (PDOException $e) {
    error_log("Users API Error: " . $e->getMessage());
    jsonResponse(false, 'DB Error: ' . $e->getMessage(), null, 500);
}
