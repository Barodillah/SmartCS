<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: login.php");
    exit;
}

require 'func.php';
include 'accesslogin.php';

if ($user['nama'] == 'BAROD') {
	header("Location: dissatisfation.php");
	exit;
}
if ($user['nama'] == 'TEAM CS') {
	header("Location: exportsaja.php");
	exit;
}

$firsttgl = date('Y-m-01');
$lasttgl = date('Y-m-t');
$thisbulan = date('Y-m');

if ( isset($_POST["search"]) ) {
    $cari = $_POST["cari"];
    $book = query("SELECT * FROM dissatisfation 
                WHERE
                nama LIKE '%$cari%' OR
                rangka LIKE '%$cari%' OR
                spv LIKE '%$cari%' OR
                kendaraan LIKE '%$cari%'
                ORDER BY id DESC");
} elseif ( isset($_POST["cek"]) ) {
    $dari = $_POST["dari"];
    $firsttgl = $dari.'-01';
    $lasttgl = $dari.'-31';
    $book = query("SELECT * FROM dissatisfation WHERE tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
} else {
    $book = query("SELECT * FROM dissatisfation WHERE tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
}



$ini = new DateTime('today');
$hariini = $ini->format('Y-m-d');
// $tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");



if ( isset($_POST["update"]) ) {
    $status = $_POST["status"];
    
    $call1 = $_POST["call1"];
    $hasil1 = $_POST["hasil1"];
    $call2 = $_POST["call2"];
    $hasil2 = $_POST["hasil2"];
    $call3 = $_POST["call3"];
    $hasil3 = $_POST["hasil3"];
    $atribut = $_POST["atribut"];
    $keluhan = $_POST["keluhan"];
    $penanganan = $_POST["penanganan"];
    
    // if ( $call3 != '') {
    //     $status = 'CLOSE';
    // } elseif ( $call2 != '') {
    //     $status = 'CALL2';
    // } else {
    //     $status = $_POST["status"];
    // }
    
    if ($status === 'CLOSE') {
        $selesai = $hariini;
    } else {
        $selesai = '';
    }
    
    $id = $_POST["id"];
    
    $queryy = "UPDATE dissatisfation SET 
                status = '$status',
                atribut = '$atribut',
                keluhan = '$keluhan',
                penanganan = '$penanganan',
                call1 = '$call1',
                hasil1 = '$hasil1',
                call2 = '$call2',
                hasil2 = '$hasil2',
                call3 = '$call3',
                hasil3 = '$hasil3',
                tgl_selesai = '$selesai'
                WHERE id = $id
                ";

    mysqli_query($conn, $queryy);
  
  
  header("Location: dissatisfation.php?alert=update");
    
    
}

if ( isset($_POST["catat"]) ) {
    $dnet = $_POST["dnet"];
    $criteria = $_POST["criteria"];
    $tgl_svc = $_POST["tgl_svc"];
    $tgl_srvy = $_POST["tgl_srvy"];
    $nama = $_POST["nama"];
    $telp = $_POST["telp"];
    $rangka = $_POST["rangka"];
    $nopol = $_POST["nopol"];
    $sa = $_POST["sa"];
    $atribut = $_POST["atribut"];
    $keluhan = $_POST["keluhan"];
    
    $querycatat = "INSERT INTO dissatisfation VALUES (NULL, NULL, '$dnet', '$tgl_svc', '$tgl_srvy', 'NEW', '$rangka', '$nama', '$telp', '$nopol', '$criteria', '$atribut', '$sa', '$keluhan', '', '', '', '', '', '', '', '');";

    mysqli_query($conn, $querycatat);
  
  
  header("Location: dissatisfation.php?alert=tambah");
    
    
}
$pdi = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PDI'"));

function formatTanggalIndonesia($tanggal) {
    // Konversi string tanggal ke objek DateTime
    $tanggalObj = new DateTime($tanggal);

    // Daftar hari dalam bahasa Indonesia
    $namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Daftar bulan dalam bahasa Indonesia
    $namaBulan = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    // Format tanggal sesuai dengan keinginan
    $hasilFormat = $namaHari[$tanggalObj->format('w')] . ', ' .
                   $tanggalObj->format('j') . ' ' .
                   $namaBulan[$tanggalObj->format('n') - 1] . ' ' .
                   $tanggalObj->format('Y');

    return $hasilFormat;
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Dissatisfation Respond</title>
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
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <link href="assets/css/vendor/britecharts.min.css" rel="stylesheet" type="text/css">

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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">Dissatisfation Respond</a></li>
                                        <li class="breadcrumb-item active">Semua Data</li>
                                    </ol>
                                </div>
                                <h4 class="page-title">Semua Data Dissatisfation Respond</h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">

                                    <h4 class="header-title">Semua Data Dissatisfation Respond</h4>

                                    <ul class="nav nav-tabs nav-bordered mb-3">
                                        <li class="nav-item">
                                            <a href="#survey" data-bs-toggle="tab" aria-expanded="false" class="nav-link active">
                                                Dissatisfation Respond
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a href="#laporan" data-bs-toggle="tab" aria-expanded="true" class="nav-link">
                                                Laporan
                                            </a>
                                        </li>
                                    </ul>
                            
                                    <div class="tab-content">
                                        <div class="tab-pane show active" id="survey">
                                            <p>Menampilkan data Dissatisfation Respond Bulan <?= $dari1 ?><?= $mulai ?> s/d <?= $dari2 ?><?= $sampai ?></p>
                                            <br><br>
                                                        <div class="row">
                                                            <div class="col-lg-4">
                                                                <!-- Single Date Picker -->
                                                                <div class="mb-3">
                                                                    <form action="" method="POST">
                                                                    <div class="input-group"> 
                                                                        <input type="text" name="cari" id="tanggal" class="form-control date" placeholder="Search..." required>
                                                                        <button type="submit" name="search" class="input-group-text bg-primary border-primary text-white">
                                                                            <i class="mdi mdi-magnify font-13"></i>
                                                                        </button>
                                                                    </div>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                            
                                                            <div class="col-lg-4">
                                                                <!-- Single Date Picker -->
                                                                <div class="mb-3">
                                                                    <form action="" method="POST">
                                                                    <div class="input-group"> 
                                                                        <input type="month" name="dari" id="tanggal" class="form-control date" value="<?= $dari ?>" required>
                                                                        <button type="submit" name="cek" class="input-group-text bg-primary border-primary text-white">
                                                                            <i class="mdi mdi-magnify font-13"></i>
                                                                        </button>
                                                                    </div>
                                                                    </form>
                                                                </div>
                                                            </div>
        
                                                            <div class="col-lg-4">
                                                                <!-- Standard modal -->
                                                                <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#standard-modal">Catat Dissatisfation Respond</button>
                                                                <div id="standard-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="standard-modalLabel" aria-hidden="true">
                                                                    <div class="modal-dialog">
                                                                        <div class="modal-content">
                                                                            <div class="modal-header">
                                                                                <h4 class="modal-title" id="standard-modalLabel">Dissatisfation Respond</h4>
                                                                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                            </div>
                                                                        <form action="" method="POST">
                                                                            <div class="modal-body row">
                                                                                <div class="mb-3 col-lg-4">
                                                                                    <label for="dnet" class="form-label">Dnet ID</label>
                                                                                    <input name="dnet" class="form-control" id="dnet" type="text" placeholder="Tulis Dnet ID...">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-4">
                                                                                    <label for="criteria" class="form-label">Criteria</label>
                                                                                    <select name="criteria" class="form-select" id="criteria" required>
                                                                                        <option value="">- Pilih Criteria -</option>
                                                                                        <option value="1">Bad Comment</option>
                                                                                        <option value="2">Low Score</option>
                                                                                        <option value="3">Bad Comment & Low Score</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div class="mb-3 col-lg-4">
                                                                                    <label for="sa" class="form-label">Service Advisor</label>
                                                                                    <select name="sa" class="form-select" id="sa" required>
                                                                                        <option value="">- Pilih SA -</option>
                                                                                        <option value="MUTI">MUTI</option>
                                                                                        <option value="RUDI">RUDI</option>
                                                                                        <option value="DIMAS">DIMAS</option>
                                                                                        <option value="IPRAL">IPRAL</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="tgl_svc" class="form-label">Tanggal Service</label>
                                                                                    <input name="tgl_svc" class="form-control" id="tgl_svc" type="date">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="tgl_srvy" class="form-label">Tanggal Survey</label>
                                                                                    <input name="tgl_srvy" class="form-control" id="tgl_srvy" type="date">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="nama" class="form-label">Nama Konsumen</label>
                                                                                    <input name="nama" class="form-control" id="nama" type="text" placeholder="Tulis Nama Konsumen...">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="telp" class="form-label">Nomor Telepon</label>
                                                                                    <input name="telp" class="form-control" id="telp" type="text" placeholder="Tulis Nomor Telepon...">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="rangka" class="form-label">Nomor Rangka</label>
                                                                                    <input name="rangka" class="form-control" id="rangka" type="text" placeholder="Tulis Nomor Rangka...">
                                                                                </div>
                                                                                <div class="mb-3 col-lg-6">
                                                                                    <label for="nopol" class="form-label">Nomor Polisi</label>
                                                                                    <input name="nopol" class="form-control" id="nopol" type="text" placeholder="Tulis Nomor Polisi...">
                                                                                </div>
                                                                                <div class="mb-3">
                                                                                <label for="atribut" class="form-label">Atribut</label>
                                                                                <select name="atribut" class="form-select" id="atribut">
                                                                                    <option value="">- Pilih Atribut -</option>
                                                                                    <?php
                                                                                    $atribut_data = array(
                                                                                        "Alasan Service Tidak Tuntas",
                                                                                        "Alasan tidak dilakukan WAI",
                                                                                        "Petugas Dealer Tidak Cepat Tanggap",
                                                                                        "Kebersihan Dealer dan Area Service",
                                                                                        "Kejelasan Informasi dan Transparansi Biaya",
                                                                                        "Kemudahan Mengatur Waktu Kunjungan Service",
                                                                                        "Kendala konsumen terhadap hasil service",
                                                                                        "Kenyamanan Parkir/Lokasi Dealer",
                                                                                        "Kepuasan Konsumen SA",
                                                                                        "Keramahan/kesopanan",
                                                                                        "Keseluruhan Waktu Antrian",
                                                                                        "Ketelitian Pengerjaan Servis",
                                                                                        "Kewajaran Biaya Servis",
                                                                                        "Kondisi/Kebersihan Kendaraan Saat Diserahkan",
                                                                                        "NPS",
                                                                                        "Penyerahan Kendaraan Tidak Sesuai Estimasi",
                                                                                        "Saran/Komentar",
                                                                                        "Total Waktu Pengerjaan Service",
                                                                                        "WAI"
                                                                                    );
                                                                                    
                                                                                    foreach ($atribut_data as $atribut) {
                                                                                        echo '<option ';
                                                                                        if ($row["atribut"] === $atribut) {
                                                                                            echo 'selected';
                                                                                        }
                                                                                        echo ' value="' . $atribut . '">' . $atribut . '</option>' . PHP_EOL;
                                                                                    }
                                                                                    ?>

                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="keluhan" class="form-label">Keluhan/Low Score</label>
                                                                                <input name="keluhan" value="<?=$row['keluhan']?>" class="form-control" id="keluhan" rows="2"  placeholder="Tulis Bad Comment/Low Score..."></textarea>
                                                                            </div>
                                                                            </div>
                                                                            <div class="modal-footer">
                                                                                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                                                                <button type="submit" name="catat" class="btn btn-primary">Catat</button>
                                                                            </div>
                                                                        </form>
                                                                        </div><!-- /.modal-content -->
                                                                    </div><!-- /.modal-dialog -->
                                                                </div><!-- /.modal -->
                                                            </div>
                                                            <!-- end col -->
                                                        </div>
                                            
                                            
                                            <!-- end nav-->
                                            <table id="basic-datatable" class="table dt-responsive nowrap w-100">
                                                <thead>
                                                    <tr>
                                                         <th>#</th>
                                                        <th>Dnet</th>
                                                        <th>Nama</th>
                                                        <th>Status</th>
                                                        <th>Telp</th>
                                                        <th>Rangka</th>
                                                        <th>Batas</th>
                                                        <th>Service Date</th>
                                                        <th>Survey Date</th>
                                                        <th>Follow Up</th>
                                                        <th>Catatan/Keluhan</th>
                                                        <th>Penanganan</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <?php
                                                        $estlink = date('Y-m-d', strtotime($row["tgl_srvy"] . ' +7 days'));
                                                        
                                                        $selisih_detik = strtotime($estlink) - strtotime($hariini);
                                                        
                                                        $days_left = floor($selisih_detik / (60 * 60 * 24));
                                                        
                                                        if ( $row["status"] === 'NEW' ) {
                                                            $statuscolor = 'danger';
                                                        } elseif ( $row["status"] === 'CLOSE' ) {
                                                            $statuscolor = 'success';
                                                        } else {
                                                            $statuscolor = 'warning';
                                                        }
                                                        
                                                        if ( $row["status"] === 'PDI' ) {
                                                            $statustext = 'BELUM PKT';
                                                        } else {
                                                            $statustext = $row["status"];
                                                        }
                                                    ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td>MMKSI_<?php echo $row["dnet"] ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td>
                                                            <a class="text-<?=$statuscolor?>" href="#" data-bs-toggle="modal" data-bs-target="#modal-status-<?php echo $row["id"] ?>"><strong><?php echo $statustext ?></strong></a>
                                                            <div id="modal-status-<?php echo $row["id"] ?>" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="<?=$statuscolor?>-header-modalLabel" aria-hidden="true">
                                                                <div class="modal-dialog modal-lg">
                                                                    <div class="modal-content">
                                                                        <div class="modal-header modal-colored-header bg-<?=$statuscolor?>">
                                                                            <h4 class="modal-title" id="<?=$statuscolor?>-header-modalLabel"><?php echo $row["nama"] ?> - <?php echo $row["status"] ?></h4>
                                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                        </div>
                                                                        <form action="" method="POST">
                                                                        <div class="modal-body row">
                                                                            <input name="id" type="hidden" value="<?=$row["id"]?>">
                                                                            <div class="mb-3">
                                                                                <label for="st" class="form-label">Status Follow Up</label>
                                                                                <select name="status" class="form-select" id="st" required>
                                                                                    <option <?php if($row["status"] === 'NEW') echo "selected"; ?> value="">NEW</option>
                                                                                    <option <?php if($row["status"] === 'CALL1') echo "selected"; ?> value="CALL1">CALL 1</option>
                                                                                    <option <?php if($row["status"] === 'CALL2') echo "selected"; ?> value="CALL2">CALL 2</option>
                                                                                    <option <?php if($row["status"] === 'CLOSE') echo "selected"; ?> value="CLOSE">CLOSE</option>
                                                                                </select>
                                                                            </div>
                                                                            <?php
                                                                                if ( $row["status"] === 'CLOSE' ) {
                                                                                    if ( $row["hasil2"] === '' ) {
                                                                                        $disablecall2 = 'd-none';
                                                                                        $disablecall3 = 'd-none';   
                                                                                    } elseif ( $row["hasil3"] === '' ) {
                                                                                        $disablecall2 = '';
                                                                                        $disablecall3 = 'd-none';   
                                                                                    }
                                                                                } elseif ( $row["status"] === 'CALL1' ) {
                                                                                    $disablecall2 = '';
                                                                                    $disablecall3 = 'd-none';
                                                                                } elseif ( $row["status"] === 'CALL2' ) {
                                                                                    $disablecall2 = '';
                                                                                    $disablecall3 = '';
                                                                                } else {
                                                                                    $disablecall2 = 'd-none';
                                                                                    $disablecall3 = 'd-none';
                                                                                }
                                                                                
                                                                                if ( $row["status"] === 'CLOSE' ) {
                                                                                    $readonly = 'readonly';
                                                                                } else {
                                                                                    $readonly = '';
                                                                                }
                                                                            ?>
                                                                            <div class="mb-3 col-lg-6">
                                                                                <label for="call1" class="form-label">Call 1</label>
                                                                                <input name="call1" value="<?=$row["call1"]?>" class="form-control" id="call1" type="date" <?=$readonly?>>
                                                                            </div>
                                                                            <div class="mb-3 col-lg-6">
                                                                                <label for="hasil1" class="form-label">Hasil 1</label>
                                                                                <select name="hasil1" class="form-select" id="hasil1" <?=$readonly?>>
                                                                                    <option value="">- Pilih Hasil -</option>
                                                                                    <option <?php if($row["hasil1"] === 'TIDAK DIANGKAT') echo "selected"; ?> value="TIDAK DIANGKAT">TIDAK DIANGKAT</option>
                                                                                    <option <?php if($row["hasil1"] === 'NOMOR TIDAK AKTIF') echo "selected"; ?> value="NOMOR TIDAK AKTIF">NOMOR TIDAK AKTIF</option>
                                                                                    <option <?php if($row["hasil1"] === 'SALAH SAMBUNG') echo "selected"; ?> value="SALAH SAMBUNG">SALAH SAMBUNG</option>
                                                                                    <option <?php if($row["hasil1"] === 'PERJANJIAN') echo "selected"; ?> value="PERJANJIAN">PERJANJIAN</option>
                                                                                    <option <?php if($row["hasil1"] === 'DIANGKAT') echo "selected"; ?> value="DIANGKAT">DIANGKAT</option>
                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3 col-lg-6 <?=$disablecall2?>">
                                                                                <label for="call2" class="form-label">Call 2</label>
                                                                                <input name="call2" value="<?=$row["call2"]?>" class="form-control" id="call2" type="date" <?=$readonly?>>
                                                                            </div>
                                                                            <div class="mb-3 col-lg-6 <?=$disablecall2?>">
                                                                                <label for="hasil2" class="form-label">Hasil 2</label>
                                                                                <select name="hasil2" class="form-select" id="hasil2" <?=$readonly?>>
                                                                                    <option value="">- Pilih Hasil -</option>
                                                                                    <option <?php if($row["hasil2"] === 'TIDAK DIANGKAT') echo "selected"; ?> value="TIDAK DIANGKAT">TIDAK DIANGKAT</option>
                                                                                    <option <?php if($row["hasil2"] === 'NOMOR TIDAK AKTIF') echo "selected"; ?> value="NOMOR TIDAK AKTIF">NOMOR TIDAK AKTIF</option>
                                                                                    <option <?php if($row["hasil2"] === 'SALAH SAMBUNG') echo "selected"; ?> value="SALAH SAMBUNG">SALAH SAMBUNG</option>
                                                                                    <option <?php if($row["hasil2"] === 'PERJANJIAN') echo "selected"; ?> value="PERJANJIAN">PERJANJIAN</option>
                                                                                    <option <?php if($row["hasil2"] === 'DIANGKAT') echo "selected"; ?> value="DIANGKAT">DIANGKAT</option>
                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3 col-lg-6 <?=$disablecall3?>">
                                                                                <label for="call3" class="form-label">Call 3</label>
                                                                                <input name="call3" value="<?=$row["call3"]?>" class="form-control" id="call1" type="date" <?=$readonly?>>
                                                                            </div>
                                                                            <div class="mb-3 col-lg-6 <?=$disablecall3?>">
                                                                                <label for="hasil3" class="form-label">Hasil 3</label>
                                                                                <select name="hasil3" class="form-select" id="hasil3" <?=$readonly?>>
                                                                                    <option value="">- Pilih Hasil -</option>
                                                                                    <option <?php if($row["hasil3"] === 'TIDAK DIANGKAT') echo "selected"; ?> value="TIDAK DIANGKAT">TIDAK DIANGKAT</option>
                                                                                    <option <?php if($row["hasil3"] === 'NOMOR TIDAK AKTIF') echo "selected"; ?> value="NOMOR TIDAK AKTIF">NOMOR TIDAK AKTIF</option>
                                                                                    <option <?php if($row["hasil3"] === 'SALAH SAMBUNG') echo "selected"; ?> value="SALAH SAMBUNG">SALAH SAMBUNG</option>
                                                                                    <option <?php if($row["hasil3"] === 'PERJANJIAN') echo "selected"; ?> value="PERJANJIAN">PERJANJIAN</option>
                                                                                    <option <?php if($row["hasil3"] === 'DIANGKAT') echo "selected"; ?> value="DIANGKAT">DIANGKAT</option>
                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="atribut" class="form-label">Atribut</label>
                                                                                <select name="atribut" class="form-select" id="atribut">
                                                                                    <option <?php if($row["status"] === 'NEW') echo "selected"; ?> value="">- Pilih Atribut -</option>
                                                                                    <?php
                                                                                    $atribut_data = array(
                                                                                        "Alasan Service Tidak Tuntas",
                                                                                        "Alasan tidak dilakukan WAI",
                                                                                        "Petugas Dealer Tidak Cepat Tanggap",
                                                                                        "Kebersihan Dealer dan Area Service",
                                                                                        "Kejelasan Informasi dan Transparansi Biaya",
                                                                                        "Kemudahan Mengatur Waktu Kunjungan Service",
                                                                                        "Kendala konsumen terhadap hasil service",
                                                                                        "Kenyamanan Parkir/Lokasi Dealer",
                                                                                        "Kepuasan Konsumen SA",
                                                                                        "Keramahan/kesopanan",
                                                                                        "Keseluruhan Waktu Antrian",
                                                                                        "Ketelitian Pengerjaan Servis",
                                                                                        "Kewajaran Biaya Servis",
                                                                                        "Kondisi/Kebersihan Kendaraan Saat Diserahkan",
                                                                                        "NPS",
                                                                                        "Penyerahan Kendaraan Tidak Sesuai Estimasi",
                                                                                        "Saran/Komentar",
                                                                                        "Total Waktu Pengerjaan Service",
                                                                                        "WAI"
                                                                                    );
                                                                                    
                                                                                    foreach ($atribut_data as $atribut) {
                                                                                        echo '<option ';
                                                                                        if ($row["atribut"] === $atribut) {
                                                                                            echo 'selected';
                                                                                        }
                                                                                        echo ' value="' . $atribut . '">' . $atribut . '</option>' . PHP_EOL;
                                                                                    }
                                                                                    ?>

                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="keluhan" class="form-label">Keluhan</label>
                                                                                <input name="keluhan" value="<?=$row['keluhan']?>" class="form-control" id="keluhan" rows="2"  placeholder="Tulis keluhan yang disampaikan konsumen..."></textarea>
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="penanganan" class="form-label">Penanganan</label>
                                                                                <input name="penanganan" value="<?=$row['penanganan']?>" class="form-control" id="penanganan" rows="2"  placeholder="Tulis penanganan yang dilakukan..."></textarea>
                                                                            </div>
                                                                        </div>
                                                                        <div class="modal-footer">
                                                                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                                                            <button type="submit"  name="update" class="btn btn-<?=$statuscolor?>">Save changes</button>
                                                                        </div>
                                                                        </form>
                                                                    </div><!-- /.modal-content -->
                                                                </div><!-- /.modal-dialog -->
                                                            </div><!-- /.modal -->
                                                        </td>
                                                        <td>
                                                            <a href="#" data-bs-toggle="modal" data-bs-target="#fu-modal-<?php echo $row["id"] ?>" class="text-<?=$statuscolor?>"><?php echo $row["telp"] ?></a>
                                                            
                                                        </td>
                                                        <?php
                                                    date_default_timezone_set('Asia/Jakarta'); // Sesuaikan zona waktu dengan lokasi Anda
                                                    
                                                    $jam = date('H');
                                                    
                                                    if ($jam >= 7 && $jam < 10) {
                                                        $ucapan = "Selamat pagi";
                                                    } elseif ($jam >= 10 && $jam < 15) {
                                                        $ucapan = "Selamat siang";
                                                    } elseif ($jam >= 15 && $jam < 18) {
                                                        $ucapan = "Selamat sore";
                                                    } else {
                                                        $ucapan = "Selamat malam";
                                                    }
                                                    
                                                    ?>
                                                    <?php
                                                        if ($row["criteria"] === '1') {
                                                            $kriteria = 'Bad Comment';
                                                            $kriteriafu = 'KOMENTAR/SARAN';
                                                        } elseif ($row["criteria"] === '2') {
                                                            $kriteria = 'Low Score';
                                                            $kriteriafu = 'NILAI RENDAH';
                                                        } else {
                                                            $kriteria = 'Bad Comment & Low Score';
                                                            $kriteriafu = 'KOMENTAR & NILAI RENDAH';
                                                        }
                                                        ?>
                                                        <div id="fu-modal-<?php echo $row["id"] ?>" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="standard-modalLabel" aria-hidden="true">
                                                            <div class="modal-dialog">
                                                                <div class="modal-content">
                                                                    <div class="modal-header">
                                                                        <h4 class="modal-title" id="standard-modalLabel"><?php echo $row["nama"] ?> - <?php echo $row["nopol"] ?></h4>
                                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                    </div>
                                                                    <div class="modal-body">
                                                                        <h5 class="mt-0"><?=$ucapan?>,</h5>
                                                                        <p>Perkenalkan saya <mark><?=$user['nama']?></mark> dari Mitsubishi Bintaro, benar saya bicara dengan Bapak/Ibu <mark><?=$row['nama']?></mark>?
                                                                        <br><br>
                                                                        Pada data kami Bapak/Ibu telah melakukan Service kendaraan dengan No. Polisi <mark><?=$row['nopol']?></mark> pada hari <mark><?=formatTanggalIndonesia($row["tgl_svc"])?></mark> dengan SA kami <mark><?=$row["sa"]?></mark>, apakah benar pak/bu?
                                                                        <br><br>
                                                                        Kami mendapatkan hasil survey kepuasan, bahwasanya Bapak/Ibu memberikan <mark><?=$kriteriafu?></mark> mengenai <mark><?=$row["atribut"]?></mark> bahwasanya Bapak/Ibu menyampaikan <mark><em>"<?=$row["keluhan"]?>"</em></mark>, bisa dijelaskan lebih detail lagi pak/bu kepada kami, untuk kami bisa melakukan perbaikan dalam pelayanan service kami!
                                                                        </p>
                                                                    </div>
                                                                    <div class="modal-footer">
                                                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                                                    </div>
                                                                </div><!-- /.modal-content -->
                                                            </div><!-- /.modal-dialog -->
                                                        </div><!-- /.modal -->
                                                        <td>
                                                            <a id="rangka<?php echo $row["id"] ?>" href="#" class="text-<?=$statuscolor?>" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?php echo $row["nopol"] ?>" title="No. Polisi"><?php echo $row["rangka"] ?></a>
                                                            <a href="#" onclick="CopyToClipboard('rangka<?php echo $row["id"] ?>');return false;" class="text-secondary"><i class='mdi mdi-content-copy'></i></a>
                                                        </td>
                                                        <?php
                                                            if ( $days_left > 3) {
                                                                $badgecolor = 'success';
                                                                $textlink = $days_left.' Hari lagi';
                                                            } elseif ( $days_left <= 3 AND $days_left > 0) {
                                                                $badgecolor = 'warning';
                                                                $textlink = $days_left.' Hari lagi';
                                                            } elseif ( $days_left < 0) {
                                                                $badgecolor = 'danger';
                                                                $textlink = 'Batas Autocomplete';
                                                            }
                                                            
                                                            if ($row['status'] === 'CLOSE') {
                                                                $pktdate = $row['tgl_selesai'];
                                                                $badgecolor = 'success';
                                                                $textlink = 'Close';
                                                            } else {
                                                                $pktdate = 'Autocomplete pada '.$estlink;
                                                            }
                                                        ?>
                                                        <td>
                                                            <a href="#" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?=$pktdate?>" title="<?=$textlink?>"><span class="badge bg-<?=$badgecolor?>"><?=$textlink?></span></a>
                                                            
                                                        </td>
                                                        <td>
                                                            <?=formatTanggalIndonesia($row["tgl_svc"])?> (<?=$row["sa"]?>)
                                                        </td>
                                                        
                                                        <td>
                                                            <?=formatTanggalIndonesia($row["tgl_srvy"])?>
                                                        </td>
                                                        <td>
                                                            CALL 1 : <?=formatTanggalIndonesia($row["call1"])?> - <?=$row["hasil1"]?><br>
                                                            CALL 2 : <?php if ($row["call2"] === '') { echo ''; } else { echo formatTanggalIndonesia($row["call2"]); } ?> - <?=$row["hasil2"]?><br>
                                                            CALL 3 : <?php if ($row["call3"] === '') { echo ''; } else { echo formatTanggalIndonesia($row["call3"]); } ?> - <?=$row["hasil2"]?>
                                                        </td>
                                                        <td><br>
                                                        
                                                            <span class="badge bg-info"><?=$kriteria?> - <?=$row["atribut"]?></span>
                                                            <p class="text-wrap"><em>"<?=$row["keluhan"]?>"</em></p>
                                                        </td>
                                                        <td>
                                                            <p class="text-wrap"><em>"<?=$row["penanganan"]?>"</em></p>
                                                        </td>
                                                    </tr>
                                                    <?php $i++ ?>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="tab-pane" id="laporan">
                                            <table id="datatable-buttons" class="table table-striped dt-responsive w-100">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nama</th>
                                                        <th>Rangka</th>
                                                        <th>Kendaraan</th>
                                                        <th>Telepon</th>
                                                        <th>Sales</th>
                                                        <th>SPV</th>
                                                        <th>Status</th>
                                                        <th>Nilai</th>
                                                        <th>Note</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td><?php echo $row["rangka"] ?></td>
                                                        <td><?php echo $row["kend"] ?></td>
                                                        <td><?php echo $row["telp"] ?></td>
                                                        <td><?php echo $row["sales"] ?></td>
                                                        <td><?php echo $row["spv"] ?></td>
                                                        <td><?php echo $row["status"] ?></td>
                                                        <td><?php echo $row["est"] ?></td>
                                                        <td><?php echo $row["note"] ?></td>
                                                    </tr>
                                                    <?php $i++ ?>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                </div> <!-- end card body-->
                            </div> <!-- end card -->
                        </div><!-- end col-->
                        
                        
                    </div>
                    <div class="row">
                        <div class="col-xl-6 col-lg-8">
                            <div class="card">
                                    <div class="card-body">
                                        <div class="dropdown float-end">
                                            <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i class="mdi mdi-dots-vertical"></i>
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-end">
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Today</a>
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Last Week</a>
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Last Month</a>
                                            </div>
                                        </div>

                                        <h4 class="header-title mb-1">Percentage Surveyed</h4>
                                        <div id="surveyed-chart" class="apex-charts" data-colors="#ffbc00,#727cf5,#0acf97"></div>
                                        <!--<div dir="ltr">-->
                                        <!--    <div class="donut-container text-center" style="width: 100%;" data-colors2="#727cf5,#0acf97,#6c757d,#fa5c7c,#ffbc00,#39afd1"></div>-->
                                        <!--    <div class="legend-chart-container text-center"></div>-->
                                        <!--</div>-->

                                        
                                    </div>
                                    <!-- end card body-->
                                </div>
                        </div>
                        
                        <div class="col-xl-6 col-lg-8">
                            <div class="card">
                                    <div class="card-body">
                                        <div class="dropdown float-end">
                                            <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i class="mdi mdi-dots-vertical"></i>
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-end">
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Today</a>
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Last Week</a>
                                                <!-- item-->
                                                <a href="javascript:void(0);" class="dropdown-item">Last Month</a>
                                            </div>
                                        </div>

                                        <h4 class="header-title mb-1">Respond Follow Up</h4>

                                        <div id="respond-chart" class="apex-charts" data-colors="#ffbc00,#727cf5,#0acf97"></div>

                                        
                                    </div>
                                    <!-- end card body-->
                                </div>
                        </div>
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

    <script>
    function CopyToClipboard(id)
    {
    var r = document.createRange();
    r.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    }
    var isiAlert = r.selectNode(document.getElementById(id));
    var myAlert = document.getElementById('myAlert');
    var isian = document.getElementById('isiCopy');
    isian.html(isiAlert);
    myAlert.style.display = 'block'
    </script>
    <!-- bundle -->
    <script src="assets/js/vendor.min.js"></script>
    <script src="assets/js/app.min.js"></script>

    <!-- third party js -->
    <script src="assets/js/vendor/apexcharts.min.js"></script>
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
    <script src="assets/js/vendor/d3.min.js"></script>
    <script src="assets/js/vendor/britecharts.min.js"></script>
    <!-- demo app -->
    <script src="assets/js/pages/demo.britechart.js"></script>
    <script src="assets/js/pages/demo.datatable-init.js"></script>
    <!-- end demo js-->
    <?php
        $close = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM dissatisfation WHERE status = 'CLOSE' AND tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl'"));
        
        $alldissatisfation = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM dissatisfation WHERE tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl'"));
        
        
        $inproges = $alldissatisfation-$close;
        
        $unikatribut = query("SELECT DISTINCT atribut FROM dissatisfation WHERE atribut != '' AND tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl'");
    ?>
    <script>
        var options = {
          series: [
              <?php foreach ($unikatribut as $atribut) : ?>
              <?php
              $atributnya = $atribut["atribut"];
              
              $jmlatribut = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM dissatisfation WHERE atribut = '$atributnya' AND tgl_srvy BETWEEN '$firsttgl' AND '$lasttgl'"));
              ?>
              <?=$jmlatribut?>,
            <?php endforeach; ?>
              ],
          chart: {
          width: 380,
          type: 'donut',
        },
        labels: [
            <?php foreach ($unikatribut as $atribut) : ?>
            '<?=$atribut["atribut"]?>',
            <?php endforeach; ?>
            ],
        legend: {
              show: false
            },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              show: false
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#respond-chart"), options);
        chart.render();
    </script>
    <script>
        var options = {
          series: [<?=$close?>, <?=$inproges?>],
          chart: {
          width: 380,
          type: 'donut',
        },
        labels: ['Close Case', 'In Progess'],
        legend: {
              show: false
            },
        colors: ['#0acf97', '#ffbc00'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              show: false
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#surveyed-chart"), options);
        chart.render();
    </script>

</body>

</html>