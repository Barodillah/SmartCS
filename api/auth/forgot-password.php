<?php
require_once '../config.php';
require_once 'SMTPMailer.php';

$data = getPostBody();

if (empty($data['email'])) {
    jsonResponse(false, 'Email wajib diisi', null, 400);
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user) {
        // Generate 6 digit OTP
        $otp = sprintf("%06d", mt_rand(1, 999999));
        $expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        // Save OTP
        $stmt_otp = $db->prepare("INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)");
        $stmt_otp->execute([$user['id'], $otp, $expires_at]);
        
        // Send Email
        try {
            $mailer = new SMTPMailer('smtp.hostinger.com', 465, 'noreply@csdwindo.com', 'Bintaro.100066');
            $subject = "Kode OTP Reset Password";
            $message = "
            <html>
            <head>
              <title>Reset Password</title>
            </head>
            <body>
              <p>Halo {$user['name']},</p>
              <p>Anda telah meminta untuk mereset password akun SmartCS Anda. Berikut adalah kode OTP Anda:</p>
              <h2><strong>$otp</strong></h2>
              <p>Kode ini hanya berlaku selama 15 menit.</p>
              <p>Jika Anda tidak merasa meminta reset password, silakan abaikan email ini.</p>
            </body>
            </html>
            ";
            
            $mailer->send($email, $subject, $message, 'noreply@csdwindo.com', 'SmartCS Admin');
        } catch (Exception $e) {
            error_log("SMTP Error: " . $e->getMessage());
            // Tetap berikan success response untuk security (tidak membocorkan email ada/tidak atau error email)
        }
    }
    
    // Selalu kirimkan pesan sukses terlepas email ada/tidak untuk menghindari email enumeration attack
    jsonResponse(true, 'Jika email terdaftar, kode OTP telah dikirimkan ke email Anda.');

} catch (PDOException $e) {
    error_log("Forgot Password Error: " . $e->getMessage());
    jsonResponse(false, 'Terjadi kesalahan sistem', null, 500);
}
