<?php

require 'func.php';
date_default_timezone_set('Asia/Jakarta');

$id = $_GET["id"];

// ================== GET DATA ==================
$book = query("SELECT * FROM booking WHERE id = $id")[0];

$nowa     = $book["telp"];
$idwa     = $book["id"];
$wanama   = $book["nama"];
$watgl    = $book["tanggal"];
$fixtgl   = date("d-m-Y", strtotime($watgl));
$wajam    = $book["jam"];
$wakend   = $book["kendaraan"];
$wanopol  = $book["nopol"];
$jenis    = $book["jenis"];
$keluhan  = $book["keluhan"];

// Optional tambahan
$addwa    = $_GET["telp"] ?? "";
$addnama  = $_GET["nama"] ?? "";
$addjam   = $_GET["jam"] ?? "";
$addkend  = $_GET["kend"] ?? "";
$addnopol = $_GET["nopol"] ?? "";

// ================== UPDATE STATUS ==================
mysqli_query($conn, "UPDATE booking SET status = 'BOOKING' WHERE id = $idwa");

mysqli_query($conn, "INSERT INTO booking_record VALUES 
(NULL, $id, NULL, 'ADMIN', 'WA H-1', 'Whatsapp 1 Hari Sebelum Kedatangan', '$nowa')");

// ================== FUNCTION ==================
function hari_ini($tanggal){
    $hari = date('D', strtotime($tanggal));
    $map = [
        'Sun' => 'MINGGU',
        'Mon' => 'SENIN',
        'Tue' => 'SELASA',
        'Wed' => 'RABU',
        'Thu' => 'KAMIS',
        'Fri' => "JUM'AT",
        'Sat' => 'SABTU'
    ];
    return $map[$hari] ?? 'Tidak diketahui';
}

$wahari = hari_ini($watgl);

// ================== SALAM ==================
$jam = date("H");

if ($jam < 11) {
    $salam = "Selamat Pagi";
} elseif ($jam < 15) {
    $salam = "Selamat Siang";
} elseif ($jam < 18) {
    $salam = "Selamat Sore";
} else {
    $salam = "Selamat Malam";
}

// ================== FORMAT ==================
$nama      = "*{$wanama}{$addnama}*";
$waktu     = "*{$wahari} {$fixtgl}, {$wajam}{$addjam}*";
$kendaraan = "*{$wakend}{$addkend}, {$wanopol}{$addnopol}*";

// ================== PESAN ==================
$pesan  = "*REMINDER BOOKING SERVICE*\n\n";
$pesan .= "$salam Bapak/Ibu $nama 🙏\n\n";

$pesan .= "Kami mengingatkan bahwa *besok* Anda memiliki jadwal service:\n\n";
$pesan .= "📅 Waktu : $waktu\n";
$pesan .= "🚗 Kendaraan : $kendaraan\n\n";

$pesan .= "⏰ Mohon datang *tepat waktu* sesuai jadwal, karena stall & mekanik sudah kami siapkan.\n\n";

$pesan .= "🧼 *Disclaimer:* Pencucian hanya body luar & vacuum.\n\n";

$pesan .= "👩‍💼 Untuk kemudahan layanan, Anda juga dapat menggunakan *DINA Assistant 24/7*:\n";
$pesan .= "• Booking Service\n";
$pesan .= "• Info Service\n";
$pesan .= "• Sparepart & Aksesoris\n";
$pesan .= "• Promo & Harga Kendaraan\n";
$pesan .= "• Simulasi Kredit\n";
$pesan .= "• Emergency Service On Road\n";
$pesan .= "🔗 https://csdwindo.com\n\n";

$pesan .= "✉️ Mohon konfirmasi *kedatangan / reschedule / pembatalan* dengan membalas pesan ini ya.";

// ================== REDIRECT ==================
$url = "https://wa.me/62{$nowa}{$addwa}?text=" . urlencode($pesan);

header("Location: $url");
exit;