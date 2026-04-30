<?php
require_once '../config.php';

$data = getPostBody();

if (empty($data['email']) || empty($data['password'])) {
    jsonResponse(false, 'Email dan Password wajib diisi', null, 400);
}

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if ($user && password_verify($data['password'], $user['password'])) {
        if (!$user['is_active']) {
            jsonResponse(false, 'Akun Anda telah dinonaktifkan', null, 403);
        }

        // Jangan kembalikan password
        unset($user['password']);

        // Generate simple token (in real app, use JWT)
        // For now, since the frontend uses sessionStorage, we just return the user data
        $token = bin2hex(random_bytes(32));

        jsonResponse(true, 'Login berhasil', [
            'token' => $token,
            'user' => $user
        ]);
    } else {
        jsonResponse(false, 'Email atau Password salah', null, 401);
    }
} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    jsonResponse(false, 'DB Error: ' . $e->getMessage(), null, 500);
}
