<?php
session_start();
if ( !isset($_SESSION["login"]) ) {
    header("Location: login.php");
    exit;
}


require 'func.php';

$cetak = $_GET["cetak"];
$pencetak = $_GET["cs"];



$book = query("SELECT * FROM booking WHERE tanggal = '$cetak' ORDER BY jam ASC");
$jumlah = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM booking WHERE tanggal = '$cetak' ORDER BY jam ASC"));


?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PRINT BOOKING SERVICE</title>
    <link rel="icon" type="image/x-icon" href="favicon.png">
    <script src="dist/sweetalert2.all.min.js"></script>
    <style>
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
            }
        table {
            text-align: center;
        }
        .logo {
            position: absolute;
            width: 25%;
            margin-left: 80%;
        }
    </style>
</head>
<body>
    <div>
        <div class="logo">
            <?php
            
            function hari_ini(){
                global $cetak;
                $timestamp = strtotime($cetak);
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
            
            $cetakhari = hari_ini();
            
            ?>
            <h1><?= $cetakhari ?>, <?= date("d-m-Y", strtotime($cetak)); ?></h1>
        </div>
        <div>
            <h4>SERVICE MASTER REGISTER</h4>
            <h5>Nama Pencetak: <?php echo $pencetak ?></h5>
            <h5>Penanggung jawab: Petugas Security utama untuk mengisi</h5>
            <h5>Objektif: Menyimpan data pelanggan yang masuk dan keluar service di dealer</h5>
            <h5>Frekuensi: Setiap hari</h5>
            <!--<h6 style="font-style: italic; color: #e50202;">Note : No. Polisi berfont merah sudah terdaftar di Reservation Transactions DMS</h6>-->
        </div>
        
    </div>    
    
    <table width="1654px" border="1" cellpadding="10" cellspacing="0">
        <tr>
            <th colspan="14">SERVICE MASTER REGISTER</th>
        </tr>
        <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">TANGGAL</th>
            <th rowspan="2">JAM</th>
            <th rowspan="2">NAMA KONSUMEN</th>
            <th rowspan="2">NOMOR POLISI</th>
            <th rowspan="2">MODEL<br>KENDARAAN</th>
            <th rowspan="2">WARNA<br>KENDARAAN</th>
            <th colspan="2">KENDARAAN MASUK</th>
            <th colspan="3">PENYERAHAN KEMBALI</th>
            <th rowspan="2">CATATAN</th>
        </tr>
        <tr>
            <th>WAKTU<br>MASUK</th>
            <th>TIPE<br>(BOOKING/<br>WALK IN)</th>
            <th>WAKTU<br>KELUAR</th>
            <th>TANGGAL<br>PENYERAHAN</th>
            <th>NO.<br>GATE<br>PASS</th>
        </tr>
        <?php $i = 1; ?>
        <?php foreach ($book as $row): ?>
        <?php
            $nopolnya = $row["nopol"];
            $cekdiss = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM dissatisfation WHERE nopol = '$nopolnya'"));
            
            if ( $cekdiss > 0 ) {
                $warnanopol = '#e50202';
            } else {
                $warnanopol = '#000000';
            }
            
            ?>
        <tr style="color: <?= $warnanopol ?>;">
            <td><?php echo $i ?></td>
            <td width="100px"><?php echo $row["tanggal"] ?></td>
            <td><?php echo $row["jam"] ?></td>
            <td><?php echo $row["nama"] ?></td>
            <td width="200px" style="font-size: 2rem; font-weight:bold; color: <?= $warnanopol ?>;"><?php echo $row["nopol"] ?></td>
            <td><?php echo $row["kendaraan"] ?></td>
            <td></td>
            <td></td>
            <td style="font-size: 1.5rem;">BOOKING</td>
            <td></td>
            <td></td>
            <td></td>
            <td><?php echo $row["jenis"] ?> - <?php echo $row["keluhan"] ?></td>
        </tr>
        <?php  $i++ ?>
        <?php endforeach; ?>
           
        <?php
        $tambahan = 45 - $jumlah;
        $nomor = $jumlah + 1; // Mulai nomor dari setelah $jumlah
        
        for ($tambah = 0; $tambah < $tambahan; $tambah++) {
            echo '<tr height="35px">
                <td>' . $nomor . '</td> <!-- Nomor urut -->
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td style="font-size: 1.5rem;">WALK IN</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>';
            $nomor++; // Tambahkan 1 ke nomor setelah setiap iterasi
        }
        ?>

        <script>
        // Mencetak halaman secara otomatis saat halaman dimuat
        window.onload = function() {
            window.print();
        }
        </script>
    <?php if (isset($berhasilcetak)) : ?>
        <script>
            Swal.fire(
                'Siap Dicetak!',
                '',
                'info'
            );
        </script>
    <?php endif; ?>
    <?php if (isset($doubleantrian)) : ?>
        <script>
            Swal.fire({
              title: 'Gagal!',
              text: 'Ada Antrian Double, Cek Kembali!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                            window.location.href = 'exportadmin.php';
              }
            });
        </script>
    <?php endif; ?>
</body>
</html>