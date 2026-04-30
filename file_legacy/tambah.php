<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: login.php");
    exit;
}

require 'func.php';
include 'accesslogin.php';

if ($user['nama'] == 'BAROD') {
	header("Location: tambahadmin.php");
	exit;
}
if ($user['nama'] == 'TEAM CS') {
	header("Location: exportsaja.php");
	exit;
}

$conn = mysqli_connect("153.92.15.23", "u444914729_barod", "", "u444914729_");



if (isset($_POST["submit"])) {

    $userr = $_POST["user"];
    $tanggal = $_POST["tanggal"];
    $kendaraan = $_POST["kendaraan"];
    $nopolisi = $_POST["nopol"];
    $nopol = str_replace(' ', '', $nopolisi);
    $nama = $_POST["nama"];
    $telp = $_POST["telp"];
    $jam = $_POST["jam"];
    $jenis = $_POST["jenis"];
    $keluhan = $_POST["keluhan"];

    $result = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$tanggal'");
    $cekjadwal = mysqli_query($conn, "SELECT tanggal FROM booking WHERE nopol = '$nopol' AND tanggal = '$tanggal'");
    $cekjam = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '$jam'  AND tanggal = '$tanggal'");
    
    if ( $jam == '08:00' ) {
        $antrian = mysqli_num_rows($cekjam) + 1;
    } else if ( $jam == '08:30' ) {
        $antrian = 3 + (mysqli_num_rows($cekjam) + 1);
    } else if ( $jam == '09:00' ) {
        $antrian = 7 + (mysqli_num_rows($cekjam) + 1);
    } else if ( $jam == '09:30' ) {
        $antrian = 10 + (mysqli_num_rows($cekjam) + 1);
    } else if ( $jam == '10:00' ) {
        $antrian = 14 + (mysqli_num_rows($cekjam) + 1);
    } else if ( $jam == '10:30' ) {
        $antrian = 17 + (mysqli_num_rows($cekjam) + 1);
    } else if ( $jam == '11:00' ) {
        $antrian = 21 + (mysqli_num_rows($cekjam) + 1);
    }
    
    $cekantrian = mysqli_query($conn, "SELECT antrian FROM booking WHERE tanggal = '$tanggal'  AND antrian = '$antrian'");
    $jmlantrian = mysqli_num_rows($cekantrian);
    
    if ( $jmlantrian > 0 ) {
        $statusnya = 'REQUEST';
    } else {
        $statusnya = 'REQUEST';
    }
    
    if (  mysqli_num_rows($cekjadwal) < 1 ) {
        if (mysqli_num_rows($result) < 110) {
            $cekkonsumen = mysqli_query($conn, "SELECT * FROM konsumen WHERE nopol = '$nopol'");
            if (mysqli_num_rows($cekkonsumen) == 0) {
                $querykon = "INSERT INTO konsumen VALUES (NULL, '$nopol', '$kendaraan', '$nama', '$telp', '', '', '1')";
                mysqli_query($conn, $querykon);
            } else {
                $querytumpuk = "UPDATE konsumen SET
                        kendaraan = '$kendaraan',
                        nama = '$nama',
                        telp = '$telp'
                        WHERE nopol = '$nopol'
                        ";
                mysqli_query($conn, $querytumpuk);
            }
            mysqli_begin_transaction($conn);
            $query = "INSERT INTO booking VALUES (NULL, NULL, '$userr', '$tanggal', '$kendaraan', '$nopol', '$nama', '$telp', '$jam', '$jenis', '$keluhan', '$statusnya', '$antrian')";
            mysqli_query($conn, $query);
            
            $id_booking = mysqli_insert_id($conn);
                                        
            if ( $jenis == "20.000 KM" OR $jenis == "40.000 KM" OR $jenis == "60.000 KM" OR $jenis == "80.000 KM" OR $jenis == "100.000 KM" OR $jenis == "RSB3JAM" OR $jenis == "BERAT") {
                $estimasi = 3;
            } else if ( $jenis == "1.000 KM" OR $jenis == "10.000 KM" OR $jenis == "30.000 KM" OR $jenis == "50.000 KM" OR $jenis == "70.000 KM" OR $jenis == "90.000 KM" OR $jenis == "RINGAN" OR $jenis == "RSB1JAM" ) {
                $estimasi = 1;
            } else if ( $jenis == "RSB4JAM" ) {
                $estimasi = 4;
            } else if ( $jenis == "RSB2JAM" ) {
                $estimasi = 2;
            } else {
                $estimasi = 3;
            }
            
            // jumlah jam yang ingin ditambahkan
            // Menambahkan waktu menggunakan strtotime()
            $timestall = strtotime("+".$estimasi." hours", strtotime($jam));
            // Mengubah format waktu kembali ke dalam string
            $end = date("H:i", $timestall);
            
            $cekstall = mysqli_query($conn, "SELECT * FROM stall WHERE tanggal = '$tanggal' AND start = '$jam'");
            $jmlcekstall = mysqli_num_rows($cekstall);
            if ( $jmlcekstall == 0 ) {
                $stall = "1";
            } else if ( $kendaraan == "FUSO COLT DIESEL" OR $kendaraan == "FUSO CANTER") {
                $stall = "9";
            } else if ( $jam == "08:00" ){
                $stall = $jmlcekstall+1;
            } else if ( $jam != "08:00" ) {
                $cstall = $jmlcekstall+1;
                for ($i = $cstall; $i <= 8; $i++) {
                $sql1 = "SELECT * FROM stall WHERE tanggal = '$tanggal' AND stall = '$i'";
                $result1 = mysqli_query($conn, $sql1);
            
                if (mysqli_num_rows($result1) == 0) {
                    $sql2 = "SELECT * FROM stall WHERE tanggal = '$tanggal' AND start = '08:00' AND estimasi = '3' AND stall = '$i'";
                    $result2 = mysqli_query($conn, $sql2);
            
                    if (mysqli_num_rows($result2) == 0) {
                        $stall = $i;
                        break; // keluar dari loop jika stall kosong ditemukan
                        }
                    }
                }
            }
            
            

            
            $querystall = "INSERT INTO stall VALUES (NULL, $id_booking, '$stall', '$tanggal', '$jam', '$end', '$nopol', '$estimasi')";
            mysqli_query($conn, $querystall);
            
            $queryrecord = "INSERT INTO booking_record VALUES (NULL, $id_booking, NULL, '$userr', '$statusnya', '', 'New Booking')";
            mysqli_query($conn, $queryrecord);
    
            if (mysqli_affected_rows($conn) > 0) {
                mysqli_commit($conn);
                $berhasil = true;
            }
        } else {
            echo '<script type="text/javascript">';
            echo 'setTimeout(function () { swal.fire("Gagal!","Harap Diperiksa Kembali!","error");';
            echo '}, 1000);</script>';
        }
    } else {
        $sudahada = true;
    }    
}

$besok = new DateTime('tomorrow');
$ada = $besok->format('Y-m-d');
$tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");


$tanggalestimate = $_GET["tgls"];

if ( $tanggalestimate == 'kosong' ) {
    $tidakbisa = 'readonly';
} elseif ( $tanggalestimate == '2024-01-01' OR
$tanggalestimate == '2024-02-08' OR
$tanggalestimate == '2024-02-10' OR
$tanggalestimate == '2024-02-14' OR
$tanggalestimate == '2024-03-11' OR
$tanggalestimate == '2024-03-31' OR
$tanggalestimate == '2024-04-10' OR
$tanggalestimate == '2024-04-11' OR
$tanggalestimate == '2024-05-01' OR
$tanggalestimate == '2024-05-09' OR
$tanggalestimate == '2024-05-23' OR
$tanggalestimate == '2024-06-01' OR
$tanggalestimate == '2024-06-17' OR
$tanggalestimate == '2024-07-07' OR
$tanggalestimate == '2024-08-17' OR
$tanggalestimate == '2024-09-16' OR
$tanggalestimate == '2024-12-25' ) {
$tglmerahpertama = true;
$tidakbisa = 'readonly';
} else {
    $tidakbisa = '';
}



$slottgls = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$tanggalestimate'");
$jamdelapan = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '08:00'  AND tanggal = '$tanggalestimate'");
$jamdelapant = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '08:30'  AND tanggal = '$tanggalestimate'");
$jamsembilan = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '09:00'  AND tanggal = '$tanggalestimate'");
$jamsembilant = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '09:30'  AND tanggal = '$tanggalestimate'");
$jamsepuluh = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '10:00'  AND tanggal = '$tanggalestimate'");
$jamsepuluht = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '10:30'  AND tanggal = '$tanggalestimate'");
$jamsebelas = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '11:00'  AND tanggal = '$tanggalestimate'");
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Tambah Booking Service</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="A fully featured admin theme which can be used to build CRM, CMS, etc." name="description">
    <meta content="Coderthemes" name="author">
    <!-- App favicon -->
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <!-- third party css -->
    <link href="assets/css/vendor/dataTables.bootstrap5.css" rel="stylesheet" type="text/css">
    <link href="assets/css/vendor/responsive.bootstrap5.css" rel="stylesheet" type="text/css">
    <link href="assets/css/vendor/buttons.bootstrap5.css" rel="stylesheet" type="text/css">
    <link href="assets/css/vendor/select.bootstrap5.css" rel="stylesheet" type="text/css">
    <!-- third party css end -->

    <!-- App css -->
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css">
    <link href="assets/css/app.min.css" rel="stylesheet" type="text/css" id="light-style">
    <link href="assets/css/app-dark.min.css" rel="stylesheet" type="text/css" id="dark-style">
    <script src="dist/sweetalert2.all.min.js"></script>

</head>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": true}'>
    <!-- Begin page -->
    <div class="wrapper">
        <!-- ========== Left Sidebar Start ========== -->
        <?php include 'sidemenu.php'; ?>
        <!-- Left Sidebar End -->

        <!-- ============================================================== -->
        <!-- Start Page Content here -->
        <!-- ============================================================== -->

        <div class="content-page">
            <div class="content">
                <!-- Topbar Start -->
                <?php include 'header.php'; ?>
                <!-- end Topbar -->

                <!-- Start Content-->
                <div class="container-fluid">

                    <!-- start page title -->
                    <!--<div class="row">-->
                    <!--    <div class="col-12">-->
                    <!--        <div class="page-title-box">-->
                    <!--            <div class="page-title-right">-->
                    <!--                <ol class="breadcrumb m-0">-->
                    <!--                    <li class="breadcrumb-item"><a href="javascript: void(0);">Home</a></li>-->
                    <!--                    <li class="breadcrumb-item active">Tambah Jadwal</li>-->
                    <!--                </ol>-->
                    <!--            </div>-->
                    <!--            <h4 class="page-title">Tambah Jadwal Service</h4>-->
                    <!--        </div>-->
                    <!--    </div>-->
                    <!--</div>-->
                    <!-- end page title -->
                    
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <form class="d-flex">
                                        <div class="input-group">
                                            <input type="date" name="tgls" onChange="this.form.submit()" value="<?= $tanggalestimate ?>" class="form-control form-control-light">
                                            <button type="submit" class="input-group-text bg-primary border-primary text-white">
                                                <i class="mdi mdi-magnify font-13"></i>
                                            </button>
                                        </div>
                                        
                                    </form>
                                </div>
                                <h4 class="page-title">Tambah Jadwal Service</h4>
                            </div>
                        </div>
                    </div>
                    <div id="alert" class="alert alert-dismissible text-bg-primary border-0 fade show alert-warning" role="alert">
                        <button type="button" class="btn-close btn-close-black" data-bs-dismiss="alert" aria-label="Close"></button>
                        <strong>Perhatikan -</strong> Pastikan mengisi data konsumen dengan benar!
                    </div>

                    <div class="row">
                        <div class="col-xl-3 col-lg-4">
                            <a href="#besok">
                            <div class="card tilebox-one">
                                <div class="card-body">
                                    <i class='uil uil-users-alt float-end'></i>
                                    <h6 class="text-uppercase mt-0" style="color: #6c757d;">Jadwal Untuk <?= $tanggalestimate ?></h6>
                                    <h2 class="my-2" style="color: #6c757d;"><?php echo mysqli_num_rows($slottgls) ?></h2>
                                    <p class="mb-0 text-muted">
                                        <span class="text-nowrap">Sisa <?php echo 25 - mysqli_num_rows($slottgls); ?> Slot</span>
                                    </p>
                                
                                </div> <!-- end card-body-->
                            </div>
                            </a>
                            <!--end card-->
                            <a href="hariiniadmin.php">
                            <div class="card tilebox-one">
                                <div class="card-body">
                                    <i class='uil uil-wrench float-end'></i>
                                    <h6 class="text-uppercase mt-0" style="color: #6c757d;">Jam Untuk <?= $tanggalestimate ?></h6>
                                    
                                    <p class="mb-0 text-muted">
                                        <span class="text-nowrap">Sisa <?php echo 7 - mysqli_num_rows($jamdelapan) ?> Untuk Jam 08:00</span>
                                    </p>
                                    
                                    <p class="mb-0 text-muted">
                                        <span class="text-nowrap">Sisa <?php echo 7 - mysqli_num_rows($jamsembilan) ?> Untuk Jam 09:00</span>
                                    </p>
                                    
                                    <p class="mb-0 text-muted">
                                        <span class="text-nowrap">Sisa <?php echo 7 - mysqli_num_rows($jamsepuluh) ?> Untuk Jam 10:00</span>
                                    </p>
                                    
                                    <p class="mb-0 text-muted">
                                        <span class="text-nowrap">Sisa <?php echo 7 - mysqli_num_rows($jamsebelas) ?> Untuk Jam 11:00</span>
                                    </p>
                                </div> <!-- end card-body-->
                            </div>
                            </a>
                            <!--end card-->

                           
                        </div>
                        
                        <div class="col-xl-9 col-lg-8">
                            <div class="card">
                                <div class="card-body">
                                    <p class="text-muted font-14">Form Khusus CS Bintaro Untuk Menambahkan Jadwal Service</p>
                                    <br>

                                    <!-- end nav-->
                                    <div class="tab-content">
                                        <form action="" method="POST">
                                            <input type="hidden" name="user" value="<?php echo $user["nama"] ?>">
                                            <div class="tab-pane show active" id="select2-preview">
                                                <div class="row">
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="tanggal" class="form-label">Tanggal Booking</label>
                                                            <input type="date" value="<?= $tanggalestimate ?>" name="tanggal" id="tanggal" class="form-control date" readonly>
                                                        </div>
                                                    </div>

                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="jam" class="form-label">Jam Datang</label>
                                                            <select name="jam" id="jam" class="form-control select2" data-toggle="select2" <?= $tidakbisa ?> required>
                                                                <?php 
                                                                  if ( mysqli_num_rows($jamdelapan) < 11 ) {
                                                                      $stat8 = '';
                                                                      $full8 = '';
                                                                  } else {
                                                                      $stat8 = 'disabled="disabled"';
                                                                      $full8 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamdelapant) < 11 ) {
                                                                      $stat83 = '';
                                                                      $full83 = '';
                                                                  } else {
                                                                      $stat83 = 'disabled="disabled"';
                                                                      $full83 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamsembilan) < 11 ) {
                                                                      $stat9 = '';
                                                                      $full9 = '';
                                                                  } else {
                                                                      $stat9 = 'disabled="disabled"';
                                                                      $full9 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamsembilant) < 11 ) {
                                                                      $stat93 = '';
                                                                      $full93 = '';
                                                                  } else {
                                                                      $stat93 = 'disabled="disabled"';
                                                                      $full93 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamsepuluh) < 11 ) {
                                                                      $stat10 = '';
                                                                      $full10 = '';
                                                                  } else {
                                                                      $stat10 = 'disabled="disabled"';
                                                                      $full10 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamsepuluht) < 11 ) {
                                                                      $stat103 = '';
                                                                      $full103 = '';
                                                                  } else {
                                                                      $stat103 = 'disabled="disabled"';
                                                                      $full103 = 'Full';
                                                                  }
                                                                  
                                                                  if ( mysqli_num_rows($jamsebelas) < 11 ) {
                                                                      $stat11 = '';
                                                                      $full11 = '';
                                                                  } else {
                                                                      $stat11 = 'disabled="disabled"';
                                                                      $full11 = 'Full';
                                                                  }
                                                                  
                                                                  ?>
                                                                    <option value="">-Pilih Jam-</option>
                                                                    <option value="08:00" <?= $stat8 ?>>08:00 <?= $full8 ?></span></option>
                                                                    <option value="08:30" <?= $stat8 ?>>08:30 <?= $full8 ?></span></option>
                                                                    <option value="09:00" <?= $stat9 ?>>09:00 <?= $full9 ?></option>
                                                                    <option value="10:00" <?= $stat10 ?>>10:00 <?= $full10 ?></option>
                                                                    <option value="11:00" <?= $stat11 ?>>11:00 <?= $full11 ?></option>
                                                                    <option value="" <?= $stat11 ?> disabled>ISTIRAHAT</option>
                                                                    <option value="13:00" <?= $stat11 ?>>13:00 <?= $full11 ?></option>
                                                                    <option value="14:00" <?= $stat11 ?>>14:00 <?= $full11 ?></option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="nopol" class="form-label">Nomor Polisi</label>
                                                            <input type="text" name="nopol" id="nopol" class="form-control date" placeholder="Masukan Nomor Polisi" onkeyup="autofill()" onblur="mycapitalized()" required <?= $tidakbisa ?>>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="kendaraan" class="form-label">Kendaraan</label>
                                                            <select name="kendaraan" id="kendaraan" class="form-control select2" data-toggle="select2" <?= $tidakbisa ?> required>
                                                                    <option value="">-Pilih Kendaraan-</option>
                                                                <optgroup label="Kendaraan Penumpang">
                                                                    <option value="MITSUBISHI PAJERO">PAJERO</option>
                                                                    <option value="MITSUBISHI XPANDER">XPANDER</option>
                                                                    <option value="MITSUBISHI DESTINATOR">DESTINATOR</option>
                                                                    <option value="MITSUBISHI XFORCE">XFORCE</option>
                                                                    <option value="MITSUBISHI ECLIPSE CROSS">ECLIPSE CROSS</option>
                                                                    <option value="MITSUBISHI TRITON">TRITON</option>
                                                                    <option value="MITSUBISHI OUTLANDER">OUTLANDER</option>
                                                                    <option value="MITSUBISHI OUTLANDER PHEV">OUTLANDER PHEV</option>
                                                                    <option value="MITSUBISHI MIRAGE">MIRAGE</option>
                                                                    <option value="MITSUBISHI LANCER">LANCER</option>
                                                                    <option value="MITSUBISHI DELICA">DELICA</option>
                                                                    <option value="MITSUBISHI GRANDIS">GRANDIS</option>
                                                                </optgroup>
                                                                <optgroup label="Kendaraan Niaga">
                                                                    <option value="MITSUBISHI L300">L300</option>
                                                                    <option value="FUSO COLT DIESEL">COLT DIESEL</option>
                                                                    <option value="FUSO CANTER">FUSO CANTER</option>
                                                                    <option value="MITSUBISHI COLT T200">COLT T200</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="nama" class="form-label">Nama Booking</label>
                                                            <input type="text" name="nama" id="nama" class="form-control date" placeholder="Masukan Nama Booking" onblur="mycapitalized()" required <?= $tidakbisa ?>>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="telp" class="form-label">Nomor Telepon</label>
                                                            <input type="text" name="telp" id="telp" class="form-control date" placeholder="Masukan Nomor Telepon" onblur="mycapitalized()" required <?= $tidakbisa ?>>
                                                        </div>
                                                    </div> <!-- end col -->
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="jenis" class="form-label">Jenis Service</label>
                                                            <select onchange="yesnoCheck(this);" name="jenis" id="kendaraan" class="form-control select2" data-toggle="select2" <?= $tidakbisa ?> required>
                                                                    <option value="">-Pilih Jenis Service-</option>
                                                                    <optgroup id="lastser" label="Riwayat Booking">
                                            					</optgroup>
                                                                
                                                                <optgroup label="Service Rutin">
                                                                    <option value="1.000 KM">1.000 KM</option>
                                                                    <option value="10.000 KM">10.000 KM</option>
                                                                    <option value="20.000 KM">20.000 KM</option>
                                                                    <option value="30.000 KM">30.000 KM</option>
                                                                    <option value="40.000 KM">40.000 KM</option>
                                                                    <option value="50.000 KM">50.000 KM</option>
                                                                    <option value="60.000 KM">60.000 KM</option>
                                                                    <option value="70.000 KM">70.000 KM</option>
                                                                    <option value="80.000 KM">80.000 KM</option>
                                                                    <option value="90.000 KM">90.000 KM</option>
                                                                    <option value="100.000 KM">100.000 KM</option>
                                                                </optgroup>
                                                                <optgroup label="Jenis Service">
                                                                        <!--<option value="RSB1JAM">RSB 1 JAM</option>-->
                                                                        <option value="RSB2JAM">RSB 2 JAM</option>
                                                                        <option value="RSB3JAM">RSB 3 JAM</option>
                                                                        <option value="RSB4JAM">RSB 4 JAM</option>
                                                                        <option value="RINGAN">SERVICE RINGAN</option>
                                                                        <option value="BERAT">SERVICE BERAT</option>
                                                                    <option value="FUELPUMP">FUELPUMP</option>
                                                                    <option value="KELUHAN">KELUHAN</option>
                                                                    <option value="SPAREPART">SPAREPART</option>
                                                                    <option value="PERBAIKAN">PERBAIKAN SERVICE</option>
                                                                    <option value="SPOORING BALANCING">SPOORING BALANCING</option>
                                                                    <option value="GENERAL CHECK UP">CHECK UP</option>
                                                                    <option value="RUTIN">RUTIN</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div id="ifYes" style="display: none;" class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="keluhan" class="form-label">Keluhan/Sparepart</label>
                                                            <textarea name="keluhan" data-toggle="maxlength" class="form-control" maxlength="225" rows="1" id="jenis" onblur="capital()" placeholder="Tulis Keluhan Kendaraan" <?= $tidakbisa ?>></textarea>
                                                        </div>
                                                    </div>
                                                    <div class="d-grid mb-0 text-center">
                                                        <button class="btn btn-primary" name="submit" type="submit"><i class="uil-plus-circle"></i> Tambah </button>
                                                    </div>
                                                    <!-- end col -->
                                                </div>
                                            </div>
                                        </form> <!-- end row -->
                                    </div> <!-- end preview-->

                                    <!-- end preview code-->
                                </div> <!-- end tab-content-->

                            </div> <!-- end card-body-->
                        </div> <!-- end card-->
                    </div>
                        
                        <!-- end col -->
                    </div>


                    
                <!-- end row-->



                <!-- end row-->

            </div> <!-- container -->

        </div> <!-- content -->

        <!-- Footer Start -->
        <footer class="footer">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-md-6">
                        <script>
                            document.write(new Date().getFullYear())
                        </script> © CS Bintaro - punyaBarod.com
                    </div>
                    <div class="col-md-6">
                        <div class="text-md-end footer-links d-none d-md-block">
                            <a href="javascript: void(0);">About</a>
                            <a href="javascript: void(0);">Support</a>
                            <a href="javascript: void(0);">Contact Us</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <!-- end Footer -->

    </div>

    <!-- ============================================================== -->
    <!-- End Page content -->
    <!-- ============================================================== -->


    </div>
    <!-- END wrapper -->


    <!-- Right Sidebar -->
    <div class="end-bar">

        <div class="rightbar-title">
            <a href="javascript:void(0);" class="end-bar-toggle float-end">
                <i class="dripicons-cross noti-icon"></i>
            </a>
            <h5 class="m-0">Settings</h5>
        </div>

        <div class="rightbar-content h-100" data-simplebar="">

            <div class="p-3">
                <div class="alert alert-warning" role="alert">
                    <strong>Customize </strong> the overall color scheme, sidebar menu, etc.
                </div>

                <!-- Settings -->
                <h5 class="mt-3">Color Scheme</h5>
                <hr class="mt-1">

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="color-scheme-mode" value="light" id="light-mode-check" checked="">
                    <label class="form-check-label" for="light-mode-check">Light Mode</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="color-scheme-mode" value="dark" id="dark-mode-check">
                    <label class="form-check-label" for="dark-mode-check">Dark Mode</label>
                </div>


                <!-- Width -->
                <h5 class="mt-4">Width</h5>
                <hr class="mt-1">
                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="width" value="fluid" id="fluid-check" checked="">
                    <label class="form-check-label" for="fluid-check">Fluid</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="width" value="boxed" id="boxed-check">
                    <label class="form-check-label" for="boxed-check">Boxed</label>
                </div>


                <!-- Left Sidebar-->
                <h5 class="mt-4">Left Sidebar</h5>
                <hr class="mt-1">
                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="theme" value="default" id="default-check">
                    <label class="form-check-label" for="default-check">Default</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="theme" value="light" id="light-check" checked="">
                    <label class="form-check-label" for="light-check">Light</label>
                </div>

                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" name="theme" value="dark" id="dark-check">
                    <label class="form-check-label" for="dark-check">Dark</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="fixed" id="fixed-check" checked="">
                    <label class="form-check-label" for="fixed-check">Fixed</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="condensed" id="condensed-check">
                    <label class="form-check-label" for="condensed-check">Condensed</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="scrollable" id="scrollable-check">
                    <label class="form-check-label" for="scrollable-check">Scrollable</label>
                </div>

                <div class="d-grid mt-4">
                    <button class="btn btn-primary" id="resetBtn">Reset to Default</button>

                    <a href="../../product/hyper-responsive-admin-dashboard-template/index.htm" class="btn btn-danger mt-3" target="_blank"><i class="mdi mdi-basket me-1"></i> Purchase Now</a>
                </div>
            </div> <!-- end padding-->

        </div>
    </div>

    <div class="rightbar-overlay"></div>
    <!-- /End-bar -->


    <!-- bundle -->
    <script src="assets/js/vendor.min.js"></script>
    <script src="assets/js/app.min.js"></script>
    <script src="cap.js"></script>

    <!-- third party js -->
    <script src="assets/js/vendor/jquery.dataTables.min.js"></script>
    <script src="assets/js/vendor/dataTables.bootstrap5.js"></script>
    <script src="assets/js/vendor/dataTables.responsive.min.js"></script>
    <script src="assets/js/vendor/responsive.bootstrap5.min.js"></script>
    <script src="assets/js/vendor/dataTables.buttons.min.js"></script>
    <script src="assets/js/vendor/buttons.bootstrap5.min.js"></script>
    <script src="assets/js/vendor/buttons.html5.min.js"></script>
    <script src="assets/js/vendor/buttons.flash.min.js"></script>
    <script src="assets/js/vendor/buttons.print.min.js"></script>
    <script src="assets/js/vendor/dataTables.keyTable.min.js"></script>
    <script src="assets/js/vendor/dataTables.select.min.js"></script>
    <!-- third party js ends -->

    <!-- demo app -->
    <script src="assets/js/pages/demo.datatable-init.js"></script>
    
    <script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
    <script type="text/javascript">
        
        
        function autofill() {
            $('#lastser').html('');
            var autonopol = $("#nopol").val();
            $.ajax({
                url : 'autofill-ajax.php',
                data : 'autonopol='+autonopol
            }).success(function (data) {
                var json = data,
                obj = JSON.parse(json);
                $("#nama").val(obj.nama);
                $("#telp").val(obj.telp);
                $("#kendaraan").val(obj.kendaraan);
                
                
                if(obj.prioritas === '1') {
                    $('#alert').removeClass().addClass('alert alert-dismissible text-bg-primary border-0 fade show alert-info');
                    $('#alert').html('<button type="button" class="btn-close btn-close-black" data-bs-dismiss="alert" aria-label="Close"></button><strong>Biasa -</strong> Konsumen Biasa!');
                } else if(obj.prioritas === '2') {
                    $('#alert').removeClass().addClass('alert alert-dismissible text-bg-primary border-0 fade show alert-success');
                    $('#alert').html('<button type="button" class="btn-close btn-close-black" data-bs-dismiss="alert" aria-label="Close"></button><strong>Loyal -</strong> Konsumen Baik!');
                } else if(obj.prioritas === '3') {
                    $('#alert').removeClass().addClass('alert alert-dismissible text-bg-primary border-0 fade show alert-danger');
                    $('#alert').html('<button type="button" class="btn-close btn-close-black" data-bs-dismiss="alert" aria-label="Close"></button><strong>Hati-hati -</strong> Konsumen Bawel!');
                } else if(autonopol === '') {
                    $('#alert').removeClass().addClass('alert alert-dismissible text-bg-primary border-0 fade show alert-warning');
                    $('#alert').html('<button type="button" class="btn-close btn-close-black" data-bs-dismiss="alert" aria-label="Close"></button><strong>Perhatikan -</strong> Pastikan mengisi data konsumen dengan benar!');
                }
                
                let riwayatService = obj.riwayat;
                
                $.each(riwayatService, function (i, riwayat){
                $('#lastser').append(`<option value="" disabled>` + riwayat.jenis + ` - ` + riwayat.tanggal + `</option>`)
                });
            });
        }
        
        
        $(function() {
         var txt = $("input#nopol");
         var func = function() {
                      txt.val(txt.val().replace(/\s/g, ''));
                   }
         txt.keyup(func).blur(func);
        });
        
        
    </script>
    
    <script>
function yesnoCheck(that) {
    if (that.value == "KELUHAN") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "RSB1JAM") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "RSB2JAM") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "RSB3JAM") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "RSB4JAM") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "RINGAN") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "BERAT") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "SPAREPART") {
        document.getElementById("ifYes").style.display = "block";
    } else if (that.value == "PERBAIKAN") {
        document.getElementById("ifYes").style.display = "block";
    } else {
        document.getElementById("ifYes").style.display = "none";
    }
}
</script>
<?php if (isset($berhasil)) : ?>
        <script>
            Swal.fire({
              title: 'Booking Berhasil!',
              text: 'A/n  <?php echo $_POST["nama"]; ?>, <?php echo $_POST["tanggal"]; ?>, <?php echo $_POST["jam"]; ?>, <?php echo $_POST["kendaraan"]; ?>, <?php echo $_POST["nopol"]; ?>, <?php echo $_POST["jenis"]; ?>',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            
                            window.location.href = 'analis.php';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    <?php if (isset($sudahada)) : ?>
        <script>
            Swal.fire(
                'Jadwal Sudah ada!',
                'No. Polisi <?= $nopol ?> Sudah Terjadwalkan di <?= $tanggal ?>!',
                'warning'
            );
        </script>
    <?php endif; ?>
    <?php if (isset($tglmerahpertama)) : ?>
        <script>
            Swal.fire({
              title: 'Pilih Hari Lain!',
              text: 'Tanggal Merah dan Libur Nasional Tidak Terima Booking!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                            window.location.href = 'tambah.php?tgls=kosong';
              }
            });
        </script>
    <?php endif; ?>
    <!-- end demo js-->

</body>

</html>
