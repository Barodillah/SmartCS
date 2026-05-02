<?php


require 'func.php';

date_default_timezone_set('Asia/Jakarta');


$userfu = $user['nama'];

$idnya = $_GET["id"];
$book = query("SELECT * FROM konsumen WHERE id = $idnya")[0];

    $idwa = $book["id"];
    $nowa = $book["telp"];
    $wanama = $book["nama"];
    $wakend = $book["kendaraan"];
    $wanopol = $book["nopol"];
    $one_year = $book["one_year"];
    $five_year = $book["five_year"];
    
    
    $tanggal = new DateTime($one_year);

    // Array untuk bulan dalam bahasa Indonesia
    $bulan_indonesia = array(
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    );
    
    // Ambil hari, bulan, dan tahun dari objek DateTime
    $hari = $tanggal->format('d');
    $bulan = $bulan_indonesia[(int)$tanggal->format('m')];
    $tahun = $tanggal->format('Y');
    
    // Format hasil menjadi tanggal Indonesia
    $format_tanggal = $hari . " " . $bulan . " " . $tahun;
    
    
    $nextyear = date('Y-m-d', strtotime($one_year . ' +1 year'));
    
    $one_year_before = floor((time() - strtotime($one_year)) / (60 * 60 * 24));
    
    $five_year_before = floor((time() - strtotime($five_year)) / (60 * 60 * 24));
    
    $query = "UPDATE konsumen SET 
                 one_year = '$nextyear'
                WHERE id = $idwa
                ";

    mysqli_query($conn, $query);
    
    $queryrecord = "INSERT INTO booking_record VALUES (NULL, 0$id, NULL, 'ADMIN', 'WA STNK', '$nowa', '$wanopol')";
    mysqli_query($conn, $queryrecord);
    
    
    $time = date("H");
    
    if ($time < "11") {
      $salam = "Selamat Pagi";
    } else
    
    if ($time >= "11" && $time < "15") {
        $salam =  "Selamat Siang";
    } else
    
    if ($time >= "15" && $time < "18") {
        $salam =  "Selamat Sore";
    } else
    
    if ($time >= "18") {
        $salam =  "Selamat Malam";
    }
    
    if ( $keluhan == '' ) {
        $biayaservice = 'FREE SERVICE';
    } else {
        $biayaservice = $keluhan;
    }
    
    $namanya = ucwords(strtolower($wanama));
    $kendaraanya = ucwords(strtolower($wakend));
  
  header("Location: https://wa.me/62$nowa$addwa?text=$salam Bapak/Ibu $namanya,%0A%0AKami dari Mitsubishi Bintaro ingin mengingatkan Bapak/Ibu untuk membayar pajak STNK tahunan mobil *$kendaraanya* No. Polisi *$wanopol*, yang jatuh tempo pada *$format_tanggal*.%0A%0APesan ini kami kirim sebagai pengingat rutin. Kami sangat menghargai perhatian Bapak/Ibu agar tidak melewatkan pembayaran ini untuk menjaga legalitas kendaraan dan menghindari denda. %0A%0A_*Jika Bapak/Ibu sudah membayar, silakan abaikan pesan ini.*_%0A%0ASilakan hubungi kami jika ada pertanyaan atau butuh bantuan. Terima kasih atas kerjasamanya.%0A%0AHormat kami,%0ADwindo Berlian Samjaya.");
  
  
  
  