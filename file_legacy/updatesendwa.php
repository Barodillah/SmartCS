<?php

require 'func.php';
date_default_timezone_set('Asia/Jakarta');

$id = $_GET["id"];

// ================== GET DATA ==================
$book = query("SELECT * FROM booking WHERE id = $id")[0];

$nowa     = $book["telp"];
$wanama   = $book["nama"];
$watgl    = $book["tanggal"];
$fixtgl   = date("d-m-Y", strtotime($watgl));
$wajam    = $book["jam"];
$wakend   = $book["kendaraan"];
$wanopol  = $book["nopol"];
$jenis    = $book["jenis"];
$keluhan  = $book["keluhan"];

// Optional tambahan dari GET (fallback kalau ada)
$addwa    = $_GET["telp"] ?? "";
$addnama  = $_GET["nama"] ?? "";
$addjam   = $_GET["jam"] ?? "";
$addkend  = $_GET["kend"] ?? "";
$addnopol = $_GET["nopol"] ?? "";
$addjenis = $_GET["jenis"] ?? "";
$addkelh  = $_GET["kelh"] ?? "";

// ================== STATUS UPDATE ==================
$cekdistall = mysqli_query($conn, "SELECT * FROM stall WHERE id_booking = $id");

$addtostall = (mysqli_num_rows($cekdistall) > 0) ? "BOOKING" : "STALL";

mysqli_query($conn, "INSERT INTO booking_record VALUES (NULL, $id, NULL, 'ADMIN', '$addtostall', 'Whatsapp Konfirmasi', '$nowa')");
mysqli_query($conn, "UPDATE booking SET status = '$addtostall' WHERE id = $id");

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

// ================== FORMAT DATA FINAL ==================
$nama      = "*{$wanama}{$addnama}*";
$waktu     = "*{$wahari} {$fixtgl}, {$wajam}{$addjam}*";
$kendaraan = "*{$wakend}{$addkend}, {$wanopol}{$addnopol}*";
$kelh      = "*{$jenis}{$addjenis}* {$keluhan}{$addkelh}";

// ================== PESAN ==================
$pesan  = "$salam, kami dari Mitsubishi Bintaro 🙏\n\n";
$pesan .= "Konfirmasi Booking Service a/n $nama\n\n";

$pesan .= "📅 Waktu : $waktu\n";
$pesan .= "🚗 Kendaraan : $kendaraan\n";
$pesan .= "🛠️ Jenis Service : $kelh\n\n";

$pesan .= "⏰ Mohon datang *tepat waktu* sesuai jadwal ya, karena stall & mekanik sudah kami siapkan.\n\n";

$pesan .= "🧼 *Disclaimer:* Cuci kendaraan hanya body luar & vacuum.\n\n";

$pesan .= "Perkenalkan layanan 24/7 kami *DINA* Assistant Virtual Dwindo:\n";
$pesan .= "• Booking Service\n";
$pesan .= "• Info Service\n";
$pesan .= "• Sparepart & Aksesoris\n";
$pesan .= "• Promo & Harga Kendaraan\n";
$pesan .= "• Simulasi Kredit\n";
$pesan .= "• Emergency Service 🚨\n";
$pesan .= "🔗 https://csdwindo.com\n\n";

$pesan .= "✉️ Jika ada kesalahan data, silakan balas pesan ini.";

// ================== REDIRECT ==================
$url = "https://wa.me/62{$nowa}{$addwa}?text=" . urlencode($pesan);

header("Location: $url");
exit;