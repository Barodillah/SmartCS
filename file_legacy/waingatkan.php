<?php


require 'func.php';
date_default_timezone_set('Asia/Jakarta');

$id = $_GET["id"];
                    
$book = query("SELECT * FROM booking WHERE id = $id")[0];
    $nowa = $book["telp"];
    $idwa = $book["id"];
    
    $queryrecord = "INSERT INTO booking_record VALUES (NULL, $id, NULL, 'ADMIN', 'WA 30 MIN BEFORE', 'Whatsapp Sebelum Kedatangan', '$nowa')";
    mysqli_query($conn, $queryrecord);
    
    $query = "UPDATE booking SET 
                 status = 'BOOKING'
                WHERE id = $idwa
                ";

    mysqli_query($conn, $query);

    
    $wanama = $book["nama"];
    $watgl = $book["tanggal"];
     $fixtgl = date("d-m-Y", strtotime($watgl));
    $wajam = $book["jam"];
    $wakend = $book["kendaraan"];
    $wanopol = $book["nopol"];
    $jenis = $book["jenis"];
    $keluhan = $book["keluhan"];
    
    $addwa = $_GET["telp"];
    $addnama = $_GET["nama"];
    $addtgl = $_GET["tgl"];
        
    $addjam = $_GET["jam"];
    $addkend = $_GET["kend"];
    $addnopol = $_GET["nopol"];
    $addjenis = $_GET["jenis"];
    $addkelh = $_GET["kelh"];
    
    function hari_ini(){
        global $watgl;
        $timestamp = strtotime($watgl);
    	$hari = date('D', $timestamp);
     
    	switch($hari){
    		case 'Sun':
    			$hari_ini = "MINGGU";
    		break;
     
    		case 'Mon':			
    			$hari_ini = "SENIN";
    		break;
     
    		case 'Tue':
    			$hari_ini = "SELASA";
    		break;
     
    		case 'Wed':
    			$hari_ini = "RABU";
    		break;
     
    		case 'Thu':
    			$hari_ini = "KAMIS";
    		break;
     
    		case 'Fri':
    			$hari_ini = "JUM'AT";
    		break;
     
    		case 'Sat':
    			$hari_ini = "SABTU";
    		break;
    		
    		default:
    			$hari_ini = "Tidak di ketahui";		
    		break;
    	}
     
    	return $hari_ini;
     
    }
    
    $wahari = hari_ini();
    
    
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
  
  header("Location: https://wa.me/62$nowa$addwa?text=$salam, mengingatkan kembali bahwa hari ini *$wahari $fixtgl*, Pukul *$wajam$addjam*, ada jadwal booking service untuk kendaraan Bapak/Ibu%0AKendaraan%20:%20*$wakend$addkend,%20$wanopol$addnopol*%0A%0A_Demi kenyamanan Bapak/Ibu $wanama$addnama, Kami ingatkan datang *tepat waktu*, tidak lebih awal maupun terlambat, dikarenakan Stall dan Mekaniknya sudah kami siapkan sesuai Jam Booking._%0A%0A_*Note* : Mohon konfirmasi kedatangan, Reschedule, atau Pembatalan dengan membalas pesan ini_");
  
  
  
  