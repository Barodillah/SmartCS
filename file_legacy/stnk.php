<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: login.php");
    exit;
}

require 'func.php';
include 'accesslogin.php';

if ($user['nama'] == 'BAROD') {
} elseif ($user['nama'] == 'TEAM CS') {
	header("Location: exportsaja.php");
	exit;
} else {
	header("Location: surveyupdateCS.php");
	exit;
}

$firsttgl = date('Y-m-01');
$lasttgl = date('Y-m-t');
$thisbulan = date('Y-m');

if ( isset($_POST["search"]) ) {
    $cari = $_POST["cari"];
    $halaman = $cari;
    $book = query("SELECT * FROM konsumen 
                WHERE nama LIKE '%$cari%' OR
                nopol LIKE '%$cari%' OR
                telp LIKE '%$cari%' OR
                kendaraan LIKE '%$cari%'
                ORDER BY id DESC");
} elseif ( isset($_GET["cek"]) ) {
    $page = ($_GET["page"]-1)*200;
    $pagenya = $_GET["page"];
    $halaman = 'Page '.$_GET["page"];
    $book = query("SELECT * FROM konsumen ORDER BY id DESC LIMIT 200 OFFSET $page");
} else {
    $book = query("SELECT * FROM konsumen ORDER BY id DESC LIMIT 200");
    $halaman = '';
}



$ini = new DateTime('today');
$hariini = $ini->format('Y-m-d');
// $tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");



if ( isset($_POST["update"]) ) {
    $prioritas = $_POST["prioritas"];
    $oneyear = $_POST["oneyear"];
    $fiveyear = $_POST["fiveyear"];
    $id = $_POST["id"];
    
    $queryy = "UPDATE konsumen SET 
                prioritas = '$prioritas', 
                one_year = '$oneyear', 
                five_year = '$fiveyear'
                WHERE id = $id
                ";

    mysqli_query($conn, $queryy);
  
  
  header("Location: stnk.php?alert=update&page=$pagenya&cek=");
    
    
}
$totalkon = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM konsumen"));
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>STNK Konsumen <?= $dari ?></title>
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
        <?php include 'sidemenuadmin.php'; ?>
        <!-- Left Sidebar End -->

        <!-- ============================================================== -->
        <!-- Start Page Content here -->
        <!-- ============================================================== -->

        <div class="content-page">
            <div class="content">
                <!-- Topbar Start -->
                <?php include 'headeradmin.php'; ?>
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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">STNK Konsumen</a></li>
                                        <li class="breadcrumb-item active">Semua Data</li>
                                    </ol>
                                </div>
                                <h4 class="page-title">Semua Data BPKB</h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">

                                    <h4 class="header-title">Semua Data STNK Konsumen</h4>

                                    <ul class="nav nav-tabs nav-bordered mb-3">
                                        <li class="nav-item">
                                            <a href="#survey" data-bs-toggle="tab" aria-expanded="false" class="nav-link active">
                                                STNK Konsumen
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
                                            <p>Menampilkan data STNK Konsumen <mark><?=$halaman?></mark> (Total <?=$totalkon?>)</p>
                                            <div class="dropdown mt-1">
                                                <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    Cek Pajak Kendaraan
                                                </a>
                                                
                                                <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                                                    <a target="_blank" class="dropdown-item" href="https://infopkb.bantenprov.go.id/">Banten</a>
                                                    <a target="_blank" class="dropdown-item" href="https://samsat-pkb2.jakarta.go.id/">Jakarta</a>
                                                    <a target="_blank" class="dropdown-item" href="https://bapenda.jabarprov.go.id/infopkb/">Jawa Barat</a>
                                                    <div class="dropdown-divider"></div>
                                                    <a target="_blank" class="dropdown-item" href="https://samsat.info/cek-pajak-kendaraan-bermotor-online.html">Cek Lainnya</a>
                                                </div>
                                            </div>
                                            <br>
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
                                                                <div class="mb-3">
                                                                    <form action="" method="GET">
                                                                    <div class="input-group"> 
                                                                        <select name="page" class="form-select" id="example-select" required>
                                                                            <option value="">- Pilih Halaman -</option>
                                                                            <?php
                                                                            $totalpage = ($totalkon/200)+1;
                                                                            for ($i = 1; $i <= $totalpage; $i++) {
                                                                                echo "<option value='$i'>Page $i</option>";
                                                                            }
                                                                            ?>
                                                                            
                                                                        </select>
                                                                        <button type="submit" name="cek" class="input-group-text bg-primary border-primary text-white">
                                                                            <i class="mdi mdi-magnify font-13"></i>
                                                                        </button>
                                                                    </div>
                                                                    </form>
                                                                </div>
                                                            </div>
        
                                                            <div class="col-lg-4">
                                                                <!-- Single Date Picker -->
                                                                <div class="mb-3">
                                                                    <form action="" method="POST" enctype="multipart/form-data">
                                                                    <div class="input-group"> 
                                                                        <input type="file" name="excel" id="example-fileinput" class="form-control" required>
                                                                        <button type="submit" name="import" class="input-group-text bg-primary border-primary text-white">
                                                                            <i class="mdi mdi-cloud-upload font-13"></i>
                                                                        </button>
                                                                    </div>
                                                                    </form>
                                                                </div>
                                                            </div>
                                                            <!-- end col -->
                                                        </div>
                                            
                                            <?php
                                                if (isset($_POST["import"])) {
                                                // var_dump($_FILES);
                                                // var_dump($_POST);
                                                // die;
                                                        
                                                        $userupload = $_POST['user'];
                                                        $namaName = $_FILES['excel']['name'];
                                                        $tmpName = $_FILES['excel']['tmp_name'];
                                                        $fileerror = $_FILES['excel']['error'];
                                                        // $tmpFile = 'storage/'.$userupload.'/'.$namaName;
                                                        
                                                        if ($fileerror === 4) {
                                                            echo "<script>alert('Pilih file yang diupload');</script>";
                                                            return false;
                                                        }
                                                        
                                                        
                                                        $ekstensii = explode('.', $namaName);
                                                        $ekstensi = end($ekstensii);
                                                        $namaasli = $ekstensii[0];
                                                        
                                                        $timestamp = time();
                                                        $addnamefile = date("mdHis", $timestamp);
                                                        
                                                        $namaExcel = 'STNKJadi'.$addnamefile.'.'.$ekstensi;
                                                        
                                                        
                                                        $allFile = '_excel/'.$namaExcel;
                                                        
                                                        // move_uploaded_file($tmpName, $tmpFile);
                                                        move_uploaded_file($tmpName, $allFile);
                                                        
                                                        error_reporting(0);
                                                        ini_set('display_errors', 0);
                                                        
                                                        require "excelReader/excel_reader2.php";
                                                        require "excelReader/SpreadsheetReader.php";
                                                        
                                                        $reader = new SpreadsheetReader($allFile);
                                                        // var_dump($reader);
                                                        // die;
                                                        foreach($reader as $key => $rows) {
                                                            $exrangka = $rows[0];
                                                            $exnopol = $rows[1];
                                                            
                                                            // Check if rangka already exists
                                                            $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE rangka = '$exrangka'"));
                                                            $booksurvey = query("SELECT * FROM surveyupdate WHERE rangka = '$exrangka'")[0];
                                                            $kendaraan = $booksurvey["kendaraan"];
                                                            $extelp = '0'.$booksurvey["telp"];
                                                            $exnama = $booksurvey["nama"];
                                                            $cekkonsumen = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM konsumen WHERE nopol = '$exnopol'"));
                                                            if (stristr($kendaraan, 'XPANDER')) {
                                                                $vehicle = 'MITSUBISHI XPANDER';
                                                            } elseif (stristr($kendaraan, 'PAJERO')) {
                                                                $vehicle = 'MITSUBISHI PAJERO';
                                                            } elseif (stristr($kendaraan, 'DESTINATOR')) {
                                                                $vehicle = 'MITSUBISHI DESTINATOR';
                                                            } elseif (stristr($kendaraan, 'XFORCE')) {
                                                                $vehicle = 'MITSUBISHI XFORCE';
                                                            } elseif (stristr($kendaraan, 'L300')) {
                                                                $vehicle = 'MITSUBISHI L300';
                                                            } elseif (stristr($kendaraan, 'TRITON')) {
                                                                $vehicle = 'MITSUBISHI TRITON';
                                                            }
                                                            
                                                            
                                                            if ($cekrangka > 0) {
                                                                if ($booksurvey["stnk"] === '') {
                                                                    $queryexcel = "UPDATE surveyupdate SET stnk = '$exnopol' WHERE rangka = '$exrangka'";
                                                                    mysqli_query($conn, $queryexcel);
                                                                    if ($cekkonsumen === 0) {
                                                                        $queryexcelkonsumen = "INSERT INTO konsumen VALUES (NULL, '$exnopol', '$vehicle', '$exnama', '$extelp', '', '', '1')";
                                                                        mysqli_query($conn, $queryexcelkonsumen);
                                                                    }
                                                                }
                                                            } else {
                                                                
                                                            }
                                                            
                                                        }
                                                        
                                                        if (mysqli_affected_rows($conn) > 0) {
                                                            header("Location: stnk.php?alert=addsuccess");
                                                        }
                                                        
                                                }
                                            ?>
                                            <!-- end nav-->
                                            <table id="basic-datatable" class="table dt-responsive nowrap w-100">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nama</th>
                                                        <th>Prioritas</th>
                                                        <th>Telp</th>
                                                        <th>No. Polisi</th>
                                                        <th>Kendaraan</th>
                                                        <th>Book Count</th>
                                                        <th>Pajak Tahunan</th>
                                                        <th>Batas TNKB</th>
                                                        <th>FU Record</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <?php
                                                        $estlink = date('Y-m-d', strtotime($row["wa_date"] . ' +3 days'));
                                                        
                                                        $selisih_detik = strtotime($estlink) - strtotime($hariini);
                                                        
                                                        $days_left = floor($selisih_detik / (60 * 60 * 24));
                                                        
                                                        if ( $row["prioritas"] === '1' ) {
                                                            $statuscolor = 'info';
                                                            $statustext = 'Biasa';
                                                        } elseif ( $row["prioritas"] === '2' ) {
                                                            $statuscolor = 'success';
                                                            $statustext = 'Loyal';
                                                        } elseif ( $row["prioritas"] === '3' ) {
                                                            $statuscolor = 'danger';
                                                            $statustext = 'Prioritas';
                                                        }
                                                        
                                                        
                                                    ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td>
                                                            <a class="text-<?=$statuscolor?>" href="#" data-bs-toggle="modal" data-bs-target="#modal-status-<?php echo $row["id"] ?>"><strong><?php echo $statustext ?></strong></a>
                                                        </td>
                                                        <div id="modal-status-<?php echo $row["id"] ?>" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="standard-modalLabel" aria-hidden="true">
                                                            <div class="modal-dialog">
                                                                <div class="modal-content">
                                                                    <div class="modal-header modal-colored-header bg-<?=$statuscolor?>">
                                                                        <h4 class="modal-title" id="standard-modalLabel"><?php echo $row["nopol"] ?> - <?php echo $row["nama"] ?></h4>
                                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                    </div>
                                                                    <form action="" method="POST">
                                                                        <input name="id" value="<?php echo $row["id"] ?>" type="hidden">
                                                                    <div class="modal-body row">
                                                                        <div class="mb-3 col-lg-4">
                                                                            <label class="form-label">Prioritas</label>
                                                                            <select name="prioritas" class="form-select" id="prioritas">
                                                                                <option <?php if ($row["prioritas"] === '1') echo selected ?> value="1">Common</option>
                                                                                <option <?php if ($row["prioritas"] === '2') echo selected ?> value="2">Loyal</option>
                                                                                <option <?php if ($row["prioritas"] === '3') echo selected ?> value="3">High Priority</option>
                                                                            </select>
                                                                        </div>
                                                                        <div class="mb-3 col-lg-4">
                                                                            <label class="form-label">Pajak Tahunan</label>
                                                                            <input value="<?=$row["one_year"]?>" name="oneyear" class="form-control" id="example-date" type="date">
                                                                        </div>
                                                                        <div class="mb-3 col-lg-4">
                                                                            <label class="form-label">Batas TNKB</label>
                                                                            <input value="<?=$row["five_year"]?>" name="fiveyear" class="form-control" id="example-date" type="date">
                                                                        </div>
                                                                    </div>
                                                                    <div class="modal-footer">
                                                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                                                        <button type="submit" name="update" class="btn btn-<?=$statuscolor?>">Save changes</button>
                                                                    </div>
                                                                    </form>
                                                                </div><!-- /.modal-content -->
                                                            </div><!-- /.modal-dialog -->
                                                        </div><!-- /.modal -->
                                                        <td>
                                                            <a target="_blank" href="https://wa.me/62<?php echo $row["telp"] ?>" class="text-<?=$statuscolor?>"><?php echo $row["telp"] ?></a>
                                                        </td>
                                                        <td>
                                                            <a id="rangka<?php echo $row["id"] ?>" href="konsumendirect.php?nopol=<?php echo $row["nopol"] ?>" class="text-<?=$statuscolor?>" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?php echo $row["kendaraan"] ?>" title="<?php echo $row["nopol"] ?>"><?php echo $row["nopol"] ?></a>
                                                            <a href="#" onclick="CopyToClipboard('rangka<?php echo $row["id"] ?>');return false;" class="text-secondary"><i class='mdi mdi-content-copy'></i></a>
                                                        </td>
                                                        <td><?php echo $row["kendaraan"] ?></td>
                                                        <td>
                                                            <?php
                                                            $nopolnya = $row["nopol"];
                                                            $totalservice = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM booking WHERE nopol = '$nopolnya'"));
                                                            
                                                            echo $totalservice.'x Service'
                                                            ?>
                                                        </td>
                                                        <td><?php echo $row["one_year"] ?></td>
                                                        <td><?php echo $row["five_year"] ?></td>
                                                        <td>
                                                            <?php
                                                            $trackfs_id = $row["nopol"];
                                                            $trackrecord = query("SELECT * FROM booking_record WHERE after = '$trackfs_id' AND status = 'WA STNK' ORDER BY id DESC");
                                                            ?>
                                                            <?php foreach ($trackrecord as $tr) : ?>
                                                            <small class="text-wrap">- <?=plus_tujuh($tr['time'])?>, <?=$tr['status']?> (<?=$tr['before']?>)</small><br>
                                                            <?php endforeach; ?>
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
                                                        <th>Telepon</th>
                                                        <th>Kendaraan</th>
                                                        <th>No. Polisi</th>
                                                        <th>STNK</th>
                                                        <th>TNKB</th>
                                                        <th>Prioritas</th>
                                                        <th>Record</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php
                                                        $trackstnk = query("SELECT DISTINCT after FROM booking_record WHERE status = 'WA STNK' ORDER BY id DESC LIMIT 50");
                                                    ?>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($trackstnk as $rowi) : ?>
                                                    <?php
                                                        $nostnk = $rowi['after'];
                                                        $roww = query("SELECT * FROM konsumen WHERE nopol = '$nostnk'")[0];
                                                    ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $roww["nama"] ?></td>
                                                        <td><?php echo $roww["telp"] ?></td>
                                                        <td><?php echo $roww["kendaraan"] ?></td>
                                                        <td><?php echo $roww["nopol"] ?></td>
                                                        <td><?php echo $roww["one_year"] ?></td>
                                                        <td><?php echo $roww["five_year"] ?></td>
                                                        <td>
                                                            <?php
                                                                if ( $roww["prioritas"] === '1' ) {
                                                                    echo 'Biasa';
                                                                } elseif ( $roww["prioritas"] === '2' ) {
                                                                    echo 'Loyal';
                                                                } elseif ( $roww["prioritas"] === '3' ) {
                                                                    echo 'Prioritas';
                                                                }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            $trackfs_id = $roww["nopol"];
                                                            $trackrecord = query("SELECT * FROM booking_record WHERE after = '$trackfs_id' AND status = 'WA STNK' ORDER BY id DESC");
                                                            ?>
                                                            <?php foreach ($trackrecord as $tr) : ?>
                                                            <small class="text-wrap">- <?=plus_tujuh($tr['time'])?>, <?=$tr['status']?> (<?=$tr['before']?>)</small><br>
                                                            <?php endforeach; ?>
                                                        </td>
                                                    </tr>
                                                    <?php $i++ ?>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        </div> 
                        <div class="col-xl-6 col-lg-8">
                            <div class="card">
                                    <div class="card-body">
                                        <!--<div class="dropdown float-end">-->
                                        <!--    <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">-->
                                        <!--        <i class="mdi mdi-dots-vertical"></i>-->
                                        <!--    </a>-->
                                        <!--    <div class="dropdown-menu dropdown-menu-end">-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Today</a>-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Last Week</a>-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Last Month</a>-->
                                        <!--    </div>-->
                                        <!--</div>-->
    
                                        <h4 class="header-title mb-1">Jenis Konsumen</h4>
                                        <div id="prioritas-chart" class="apex-charts" data-colors="#ffbc00,#727cf5,#0acf97"></div>
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
                                        <!--<div class="dropdown float-end">-->
                                        <!--    <a href="#" class="dropdown-toggle arrow-none card-drop" data-bs-toggle="dropdown" aria-expanded="false">-->
                                        <!--        <i class="mdi mdi-dots-vertical"></i>-->
                                        <!--    </a>-->
                                        <!--    <div class="dropdown-menu dropdown-menu-end">-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Today</a>-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Last Week</a>-->
                                                <!-- item-->
                                        <!--        <a href="javascript:void(0);" class="dropdown-item">Last Month</a>-->
                                        <!--    </div>-->
                                        <!--</div>-->
    
                                        <h4 class="header-title mb-1">Jumlah Service</h4>
    
                                        <div id="service-chart" class="apex-charts" data-colors="#ffbc00,#727cf5,#0acf97"></div>
    
                                        
                                    </div>
                                    <!-- end card body-->
                                </div>
                        </div>
                        <?php
                            $hariinifix = date('Y-m-d'); // Mendapatkan tanggal hari ini
                            $hplus30 = date('Y-m-d', strtotime($hariinifix . ' +20 days')); // Mendapatkan tanggal 30 hari setelah hari ini
                            $hplus15 = date('Y-m-d', strtotime($hplus30 . ' +10 days'));
                            
                            $bookreminder = query("SELECT * FROM konsumen WHERE one_year BETWEEN '$hplus30' AND '$hplus15'");
                        ?>
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <h4 class="header-title">Perlu diingatkan bayar pajak STNK</h4>
                                    
                                    <table id="alternative-page-datatable" class="table dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama</th>
                                                <th>Nopol</th>
                                                <th>Telp</th>
                                                <th>STNK</th>
                                                <th>TNKB</th>
                                            </tr>
                                        </thead>
                                    
                                    
                                        <tbody>
                                            <?php $i = 1; ?>
                                            <?php foreach ($bookreminder as $br) : ?>
                                            <tr>
                                                <td><?=$i?></td>
                                                <td><?=$br["nama"]?></td>
                                                <td><?=$br["nopol"]?></td>
                                                <td>
                                                    <a target="_blank" href="wastnk1.php?id=<?=$br["id"]?>"><?=$br["telp"]?></a>
                                                </td>
                                                <td><?=$br["one_year"]?> <span class="badge bg-primary"><?php echo floor((time() - strtotime($br["one_year"])) / (60 * 60 * 24)); ?> hari</span></td>
                                                <td><?=$br["five_year"]?> <span class="badge bg-primary"><?php echo floor((time() - strtotime($br["five_year"])) / (60 * 60 * 24)); ?> hari</span></td>
                                            </tr>
                                            <?php $i++ ?>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div> 
                        </div>
                    </div>
                    
                    
                    <!-- end row-->    
                </div>
                    



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
        
        $unikatribut = query("SELECT DISTINCT prioritas FROM konsumen");
    ?>
    <script>
        var options = {
          series: [
              <?php foreach ($unikatribut as $atribut) : ?>
              <?php
              $atributnya = $atribut["prioritas"];
              
              $jmlatribut = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM konsumen WHERE prioritas = '$atributnya'"));
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
            <?php
            if ( $atribut["prioritas"] === '1' ) {
                $statuscolor = 'info';
                $statustext = 'Biasa';
            } elseif ( $atribut["prioritas"] === '2' ) {
                $statuscolor = 'success';
                $statustext = 'Loyal';
            } elseif ( $atribut["prioritas"] === '3' ) {
                $statuscolor = 'danger';
                $statustext = 'Prioritas Tinggi';
            }
            ?>
            '<?=$statustext?>',
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

        var chart = new ApexCharts(document.querySelector("#prioritas-chart"), options);
        chart.render();
    </script>
    <script>
        var options = {
          series: [
              <?php
              // Query SQL untuk mengambil data booking beserta nomor polisi
                $sql = "SELECT nopol, COUNT(*) AS jumlah_booking FROM booking GROUP BY nopol";
                $result = $conn->query($sql);
                
                // Inisialisasi variabel untuk menyimpan hasil perhitungan
                $counts = array(
                    1 => 0,
                    2 => 0,
                    3 => 0,
                    4 => 0,
                    5 => 0,
                    6 => 0,
                    7 => 0,
                    8 => 0,
                    9 => 0,
                    10 => 0,
                    'lebih_dari_10' => 0
                );
                
                // Proses hasil query
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $jumlah_booking = $row["jumlah_booking"];
                        // Mengecek jumlah booking dan menambahkan ke variabel counts sesuai dengan kriteria yang diberikan
                        if ($jumlah_booking <= 10) {
                            $counts[$jumlah_booking]++;
                        } else {
                            $counts['lebih_dari_10']++;
                        }
                    }
                
                    // Menampilkan hasil perhitungan
                    foreach ($counts as $jumlah_booking => $jumlah_nopol) {
                        if ($jumlah_booking == 'lebih_dari_10') {
                            echo "$jumlah_nopol,";
                        } else {
                            echo "$jumlah_nopol,";
                        }
                    }
                } else {
                    echo "Tidak ada hasil";
                }
              ?>
              ],
          chart: {
          width: 380,
          type: 'donut',
        },
        labels: ['1x Booking Service', '2x Booking Service', '3x Booking Service', '4x Booking Service', '5x Booking Service', '6x Booking Service', '7x Booking Service', '8x Booking Service', '9x Booking Service', '10x Booking Service', 'Lebih 10x Booking Service'],
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

        var chart = new ApexCharts(document.querySelector("#service-chart"), options);
        chart.render();
    </script>

</body>

</html>