<?php
require_once '../config.php';

$data = getPostBody();

if (empty($data['email']) || empty($data['otp']) || empty($data['password'])) {
    jsonResponse(false, 'Email, OTP, dan Password baru wajib diisi', null, 400);
}

try {
    $db = getDB();
    
    // Cari user
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(false, 'Email atau OTP tidak valid', null, 400);
    }
    
    // Cek OTP
    $stmt_otp = $db->prepare("
        SELECT id FROM otps 
        WHERE user_id = ? AND otp = ? AND is_used = 0 AND expires_at > NOW() 
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmt_otp->execute([$user['id'], $data['otp']]);
    $otp_record = $stmt_otp->fetch();
    
    if (!$otp_record) {
        jsonResponse(false, 'OTP tidak valid atau sudah kedaluwarsa', null, 400);
    }
    
    // Hash password baru
    $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);
    
    // Update password
    $db->beginTransaction();
    
    $stmt_update = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt_update->execute([$hashed_password, $user['id']]);
    
    // Mark OTP as used
    $stmt_mark = $db->prepare("UPDATE otps SET is_used = 1 WHERE id = ?");
    $stmt_mark->execute([$otp_record['id']]);
    
    $db->commit();
    
    jsonResponse(true, 'Password berhasil direset. Silakan login dengan password baru.');

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Reset Password Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan sistem', null, 500);
}
