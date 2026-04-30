<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: login.php");
    exit;
}

$id = $_GET["id"];

require 'func.php';
include 'accesslogin.php';

if ($user['nama'] == 'BAROD') {
	header("Location: ubahadmin.php?id=$id");
	exit;
}
if ($user['nama'] == 'TEAM CS') {
	header("Location: exportsaja.php");
	exit;
}

$besok = new DateTime('tomorrow');
$ada = $besok->format('Y-m-d');
$book = query("SELECT * FROM booking WHERE id = $id")[0];
$tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");
if (isset($_POST["submit"])) {
    $userr = $_POST['user'];
    $id = $_POST["id"];
    $tanggal = $_POST["tanggal"];
    $kendaraan = $_POST["kendaraan"];
    $nopol = $_POST["nopol"];
    $nama = $_POST["nama"];
    $telp = $_POST["telp"];
    $jam = $_POST["jam"];
    $jenis = $_POST["jenis"];
    $keluhan = $_POST["keluhan"];
    
    $before_userr = $book['user'];
    $before_tanggal = $book["tanggal"];
    $before_kendaraan = $book["kendaraan"];
    $before_nopol = $book["nopol"];
    $before_nama = $book["nama"];
    $before_telp = $book["telp"];
    $before_jam = $book["jam"];
    $before_jenis = $book["jenis"];
    $before_keluhan = $book["keluhan"];
    
    $time = date('H:i:s');
    $today = date('Y-m-d');
    
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
    } else if ( $kendaraan == "FUSO COLT DIESEL" OR $kendaraan == "FUSO CANTER" OR $kendaraan == "FUSO FE" OR $kendaraan == "FUSO FIGHTER") {
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
    
    $result = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$tanggal'");
    
    $cekjam = mysqli_query($conn, "SELECT tanggal FROM booking WHERE jam = '$jam'  AND tanggal = '$tanggal'");
    $antrian = 1;
    $cekantrian = mysqli_query($conn, "SELECT antrian FROM booking WHERE tanggal = '$tanggal'  AND antrian = '$antrian'");
    $jmlantrian = mysqli_num_rows($cekantrian);
    
    if ( $jmlantrian > 0 ) {
        $statusnya = 'EDIT';
    } else {
        $statusnya = 'EDIT';
    }
    
    if ( $tanggal != $ada || $time < date('15:00:00') ) {
        
        if ( $tanggal != $today ) {
            
                $hari = $tanggal;
                $timestamp = strtotime($hari);
                $day = date('D', $timestamp);
            
                if ( $day != 'Sun' ) {
                    
                    if ($tanggal != '2024-01-01' &&
$tanggal != '2024-02-08' &&
$tanggal != '2024-02-10' &&
$tanggal != '2024-02-14' &&
$tanggal != '2024-03-11' &&
$tanggal != '2024-03-29' &&
$tanggal != '2024-03-31' &&
$tanggal != '2024-04-10' &&
$tanggal != '2024-04-11' &&
$tanggal != '2024-05-01' &&
$tanggal != '2024-05-09' &&
$tanggal != '2024-05-23' &&
$tanggal != '2024-06-01' &&
$tanggal != '2024-06-17' &&
$tanggal != '2024-07-07' &&
$tanggal != '2024-08-17' &&
$tanggal != '2024-09-16' &&
$tanggal != '2024-12-25') {
                    
                        
                            if ( mysqli_num_rows($result) < 35 ) {
                                
                                    $query = "UPDATE booking SET  
                                                user = '$userr',
                                                tanggal = '$tanggal',
                                                kendaraan = '$kendaraan',
                                                nopol = '$nopol',
                                                nama = '$nama',
                                                telp = '$telp',
                                                jam = '$jam',
                                                jenis = '$jenis',
                                                keluhan = '$keluhan',
                                                status = '$statusnya',
                                                antrian = '$antrian'
                                                WHERE id = $id
                                                ";
                                
                                    mysqli_query($conn, $query);
                                    
                                    $querystall = "UPDATE stall SET
                                                stall = '$stall',
                                                tanggal = '$tanggal',
                                                start = '$jam',
                                                end = '$end',
                                                nopol = '$nopol',
                                                estimasi = '$estimasi'
                                                WHERE id_booking = $id
                                                ";
                                
                                    mysqli_query($conn, $querystall);
                                    
                                    $queryrecord = "INSERT INTO booking_record VALUES (NULL, $id, NULL, '$userr', '$statusnya', '$before_userr - $before_tanggal - $before_jam - $before_kendaraan - $before_nopol - $before_nama - $before_telp - $before_jenis - $before_keluhan', '$tanggal - $jam - $kendaraan - $nopol - $nama - $telp - $jenis - $keluhan')";
                                    mysqli_query($conn, $queryrecord);
                                    
                                    
                                    if ( mysqli_affected_rows($conn) > 0 ) {
                                            $berhasil = true;
                                        }
                            } else {
                                $penuh = true;
                            }    
                        
                    
                    } else {
                        $tglmerah = true;
                    }  
                	
                } else {
                	$hariminggu = true;
                }
        } else {
            $bookingpagi = true;
        }
        
        
        
        
    
    } else {
        $jamtiga = true;
        
    }
}



?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Edit Jadwal <?php echo $book["nama"]; ?></title>
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
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <div class="page-title-right">
                                    <ol class="breadcrumb m-0">
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">Home</a></li>
                                        <li class="breadcrumb-item active">Tambah Jadwal</li>
                                    </ol>
                                </div>
                                <h4 class="page-title">Tambah Jadwal Service</h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->





                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <p class="text-muted font-14">Form Khusus CS Bintaro Untuk Menambahkan Jadwal Service</p>

                                    <!-- end nav-->
                                    <div class="tab-content">
                                        <form action="" method="POST">
                                            <input type="hidden" name="id" value="<?php echo $book["id"]; ?>">
                                            <input type="hidden" name="user" value="<?php echo $user['nama'] ?>">
                                            <div class="tab-pane show active" id="select2-preview">
                                                <div class="row">
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="tanggal" class="form-label">Tanggal Booking</label>
                                                            <input type="date" name="tanggal" id="tanggal" class="form-control date" value="<?php echo $book["tanggal"]; ?>" required>
                                                        </div>
                                                    </div>

                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="jam" class="form-label">Jam Booking</label>
                                                            <select name="jam" id="jam" class="form-control select2" data-toggle="select2">
                                                                <option <?php if($book["jam"] == '08:00') echo"selected"; ?> value="08:00">08:00</option>
                                                                <option <?php if($book["jam"] == '09:00') echo"selected"; ?> value="09:00">09:00</option>
                                                                <option <?php if($book["jam"] == '10:00') echo"selected"; ?> value="10:00">10:00</option>
                                                                <option <?php if($book["jam"] == '11:00') echo"selected"; ?> value="11:00">11:00</option>
                                                                <option value="" disabled>ISTIRAHAT</option>
                                                                <option <?php if($book["jam"] == '13:00') echo"selected"; ?> value="13:00">13:00</option>
                                                                <option <?php if($book["jam"] == '14:00') echo"selected"; ?> value="14:00">14:00</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="kendaraan" class="form-label">Kendaraan</label>
                                                            <select name="kendaraan" id="kendaraan" class="form-control select2" data-toggle="select2">
                                                                <optgroup label="Kendaraan Penumpang">
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI PAJERO') echo"selected"; ?> value="MITSUBISHI PAJERO">PAJERO</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI XPANDER') echo"selected"; ?> value="MITSUBISHI XPANDER">XPANDER</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI DESTINATOR') echo"selected"; ?> value="MITSUBISHI DESTINATOR">DESTINATOR</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI XFORCE') echo"selected"; ?> value="MITSUBISHI XFORCE">XFORCE</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI ECLIPSE CROSS') echo"selected"; ?> value="MITSUBISHI ECLIPSE CROSS">ECLIPSE CROSS</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI TRITON') echo"selected"; ?> value="MITSUBISHI TRITON">TRITON</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI STRADA') echo"selected"; ?> value="MITSUBISHI STRADA">STRADA</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI OUTLANDER') echo"selected"; ?> value="MITSUBISHI OUTLANDER">OUTLANDER</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI OUTLANDER PHEV') echo"selected"; ?> value="MITSUBISHI OUTLANDER PHEV">OUTLANDER PHEV</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI MIRAGE') echo"selected"; ?> value="MITSUBISHI MIRAGE">MIRAGE</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI LANCER') echo"selected"; ?> value="MITSUBISHI LANCER">LANCER</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI DELICA') echo"selected"; ?> value="MITSUBISHI DELICA">DELICA</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI GRANDIS') echo"selected"; ?> value="MITSUBISHI GRANDIS">GRANDIS</option>
                                                                </optgroup>
                                                                <optgroup label="Kendaraan Niaga">
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI L300') echo"selected"; ?> value="MITSUBISHI L300">L300</option>
                                                                    <option <?php if($book["kendaraan"] == 'MITSUBISHI COLT T120SS') echo"selected"; ?> value="MITSUBISHI COLT T120SS">COLT T120SS</option>
                                                                    <option <?php if($book["kendaraan"] == 'FUSO COLT DIESEL') echo"selected"; ?> value="FUSO COLT DIESEL">COLT DIESEL</option>
                                                                    <option <?php if($book["kendaraan"] == 'FUSO FE') echo"selected"; ?> value="FUSO FE">FUSO FE</option>
                                                                    <option <?php if($book["kendaraan"] == 'FUSO FIGHTER') echo"selected"; ?> value="FUSO FIGHTER">FUSO FIGHTER</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="nopol" class="form-label">Nomor Polisi</label>
                                                            <input type="text" name="nopol" id="nopol" class="form-control date" placeholder="Masukan Nomor Polisi" onblur="mycapitalized()" value="<?php echo $book["nopol"]; ?>" required>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="nama" class="form-label">Nama Booking</label>
                                                            <input type="text" name="nama" id="nama" class="form-control date" placeholder="Masukan Nama Booking" onblur="mycapitalized()" value="<?php echo $book["nama"]; ?>" required>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="telp" class="form-label">Nomor Telepon</label>
                                                            <input type="text" name="telp" id="telp" class="form-control date" placeholder="Masukan Nomor Telepon" value="<?php echo $book["telp"]; ?>" required>
                                                        </div>
                                                    </div> <!-- end col -->
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="jenis" class="form-label">Jenis Service</label>
                                                            <select name="jenis" class="form-control select2" data-toggle="select2">
                                                                <optgroup label="Service Rutin">
                                                                    <option <?php if($book["jenis"] == '1.000 KM') echo"selected"; ?> value="1.000 KM">1.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '10.000 KM') echo"selected"; ?> value="10.000 KM">10.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '20.000 KM') echo"selected"; ?> value="20.000 KM">20.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '30.000 KM') echo"selected"; ?> value="30.000 KM">30.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '40.000 KM') echo"selected"; ?> value="40.000 KM">40.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '50.000 KM') echo"selected"; ?> value="50.000 KM">50.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '60.000 KM') echo"selected"; ?> value="60.000 KM">60.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '70.000 KM') echo"selected"; ?> value="70.000 KM">70.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '80.000 KM') echo"selected"; ?> value="80.000 KM">80.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '90.000 KM') echo"selected"; ?> value="90.000 KM">90.000 KM</option>
                                                                    <option <?php if($book["jenis"] == '100.000 KM') echo"selected"; ?> value="100.000 KM">100.000 KM</option>
                                                                </optgroup>
                                                                  <optgroup label="Jenis Service">
                                                                    <option <?php if($book["jenis"] == 'RSB1JAM') echo"selected"; ?> value="RSB1JAM">RSB 1 JAM</option>
                                                                    <option <?php if($book["jenis"] == 'RSB2JAM') echo"selected"; ?> value="RSB2JAM">RSB 2 JAM</option>
                                                                    <option <?php if($book["jenis"] == 'RSB3JAM') echo"selected"; ?> value="RSB3JAM">RSB 3 JAM</option>
                                                                    <option <?php if($book["jenis"] == 'RSB4JAM') echo"selected"; ?> value="RSB4JAM">RSB 4 JAM</option>
                                                                    <option <?php if($book["jenis"] == 'RUTIN') echo"selected"; ?> value="RUTIN">RUTIN</option>
                                                                    <option <?php if($book["jenis"] == 'GENERAL CHECK UP') echo"selected"; ?> value="GENERAL CHECK UP">CHECK UP</option>
                                                                    <option <?php if($book["jenis"] == 'FUELPUMP') echo"selected"; ?> value="FUELPUMP">FUELPUMP</option>
                                                                    <option <?php if($book["jenis"] == 'SPAREPART') echo"selected"; ?> value="SPAREPART">PEMASANGAN SPAREPART</option>
                                                                    <option <?php if($book["jenis"] == 'KELUHAN') echo"selected"; ?> value="KELUHAN">KELUHAN</option>
                                                                    <option <?php if($book["jenis"] == 'SPOORING BALANCING') echo"selected"; ?> value="SPOORING BALANCING">SPOORING BALANCING</option>
                                                                  </optgroup>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="col-lg-6">
                                                        <!-- Single Date Picker -->
                                                        <div class="mb-3">
                                                            <label for="keluhan" class="form-label">Keluhan</label>
                                                            <input type="text" name="keluhan" id="keluhan" onblur="capital()" class="form-control date" placeholder="Masukan keluhan Service" value="<?php echo $book["keluhan"]; ?>">
                                                        </div>
                                                    </div>
                                                    <div class="d-grid mb-0 text-center">
                                                        <button class="btn btn-primary" name="submit" type="submit"><i class="uil-check-circle"></i> Ubah </button>
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
                    </div> <!-- end col-->
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
    <!-- end demo js-->
    <?php if (isset($berhasill)) : ?>
        <script>
            Swal.fire({
              title: 'Berhasil Diubah!',
              text: '',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            
                            window.location.href = 'detail.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    
    <?php if (isset($berhasil)) : ?>
        <script>
            Swal.fire({
              title: 'Data berhasil diubah!',
              text: 'Booking a/n  <?php echo $_POST["nama"]; ?>, <?php echo $_POST["tanggal"]; ?>, <?php echo $_POST["jam"]; ?>, <?php echo $_POST["kendaraan"]; ?>, <?php echo $_POST["nopol"]; ?>, <?php echo $_POST["jenis"]; ?>',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'detail.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    <?php if (isset($tglmerah)) : ?>
        <script>
            Swal.fire({
              title: 'Booking Gagal!!',
              text: 'Tanggal Merah dan Libur Nasional Tidak Terima Booking!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'ubah.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    
    <?php if (isset($hariminggu)) : ?>
        <script>
            Swal.fire({
              title: 'Booking Gagal!',
              text: 'Hari Minggu Tidak Terima Booking!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'ubah.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    
    <?php if (isset($bookingpagi)) : ?>
        <script>
            Swal.fire({
              title: 'Jadwal Service Hari Ini Penuh!',
              text: 'Perubahan Booking service minimal 1x24 jam sebelum kedatangan, harap booking dihari lain!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'ubah.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    
    <?php if (isset($jamtiga)) : ?>
        <script>
            Swal.fire({
              title: 'Jadwal Service Hari Ini Penuh!',
              text: 'Perubahan untuk H-1 supaya sebelum jam 15:00, harap booking dihari lain!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'ubah.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    
    <?php if (isset($penuh)) : ?>
        <script>
            Swal.fire({
              title: 'Jadwal Service <?php echo $_POST["tanggal"]; ?> Penuh!',
              text: 'Silahkan coba lagi!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'ubah.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    <?php if (isset($jampenuh)) : ?>
        <script>
            Swal.fire({
              title: 'Jam Penuh!',
              text: 'Jadwal Untuk Jam <?= $jam.$jamj; ?> pada tanggal <?= $tanggal.$tanggalj; ?> Sudah Penuh, Harap Memilih Jam Lain!',
              icon: 'warning',
              input: 'select',
              inputOptions: {
                '08:00': '08:00',
                '09:00': '09:00',
                '10:00': '10:00',
                '11:00': '11:00'
              },
              
              showCancelButton: true,
              inputValidator: (value) => {
                return new Promise((resolve) => {
                  if (value != '<?= $jam.$jamj; ?>') {
                    window.location.href = 'ubah.php?idj=<?= $id.$idj; ?>&user=<?= $userr.$userj; ?>&tanggal=<?= $tanggal.$tanggalj; ?>&kendaraan=<?= $kendaraan.$kendaraanj; ?>&nopol=<?= $nopol.$nopolj; ?>&nama=<?= $nama.$namaj; ?>&jenis=<?= $jenis.$jenisj; ?>&keluhan=<?= $keluhan.$keluhanj; ?>&telp=<?= $telp.$telpj; ?>&ada=confirmjam&jam='+value;
                  } else {
                    resolve('Harus Pilih Jam Lain!')
                  }
                })
              }
            })
        </script>
    <?php endif; ?>
    <?php if (isset($berhasiljam)) : ?>
        <script>
            Swal.fire({
              title: 'Booking Berhasil!',
              text: 'A/n  <?php echo $namaj ?>, <?php echo $tanggalj ?>, <?php echo $jamj ?>, <?php echo $kendaraanj ?>, <?php echo $nopolj ?>, <?php echo $jenisj ?>',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Oke'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    
                            window.location.href = 'detail.php?id=<?= $book["id"]; ?>';
                          
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
</body>

</html>