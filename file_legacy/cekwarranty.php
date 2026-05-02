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

if ( isset($_GET["search"]) ) {
    $cari = $_GET["cari"];
    $book = query("SELECT * FROM surveyupdate 
                WHERE
                nama LIKE '%$cari%' OR
                rangka LIKE '%$cari%' OR
                spv LIKE '%$cari%' OR
                kendaraan LIKE '%$cari%'
                ORDER BY id DESC");
} elseif ( isset($_GET["cek"]) ) {
    $dari = $_GET["dari"];
    $firsttgl = $dari.'-01';
    $lasttgl = $dari.'-31';
    $book = query("SELECT * FROM surveyupdate WHERE wa_date BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
} else {
    $book = query("SELECT * FROM surveyupdate WHERE wa_date BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
}



$ini = new DateTime('today');
$hariini = $ini->format('Y-m-d');
// $tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");



if ( isset($_POST["update"]) ) {
    $status = $_POST["status"];
    $spv = $_POST["spv"];
    $sales = $_POST["sales"];
    $pkt = $_POST["pkt"];
    $id = $_POST["id"];
    
    $ikutpkt = $_POST["ikutpkt"];
    
    $caribulan = query("SELECT * FROM surveyupdate WHERE id = $id")[0];
    
    if ($ikutpkt === 'Yes') {
        $querypkt = "INSERT INTO bukti_pkt VALUES (NULL, NULL, $id)";
        mysqli_query($conn, $querypkt);
    }
    
    $queryy = "UPDATE surveyupdate SET 
                status = '$status',
                spv = '$spv',
                sales = '$sales',
                wa_date = '$pkt'
                WHERE id = $id
                ";

    mysqli_query($conn, $queryy);
   $bulannya = date("Y-m", strtotime($caribulan['pdi_date']));
  
  header("Location: surveyupdate.php?alert=update&dari=$bulannya&cek=");
    
    
}
$pdi = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PDI'"));

if ( isset($_POST["sendkonsumen"]) ) {
    
    
    $nama = $_POST["nama"];
    $telp = $_POST["telp"];
    $nopol = $_POST["nopol"];
    $kendaraan = $_POST["kendaraan"];
    $prioritas = $_POST["prioritas"];
    $id = $_POST["id"];
    
    $querystnk = "UPDATE surveyupdate SET 
                stnk = '$nopol'
                WHERE id = $id
                ";

    mysqli_query($conn, $querystnk);
    $querykon = "INSERT INTO konsumen VALUES (NULL, '$nopol', '$kendaraan', '$nama', '$telp', '', '', '$prioritas')";
    mysqli_query($conn, $querykon);
  header("Location: surveyupdate.php?alert=tobecus");
}

if ( isset($_POST["catatNPS"]) ) {
    
    $nilai = $_POST["nilai"];
    $note = $_POST["note"];
    $survey_date = $_POST["survey_date"];
    $rangkanyaa = $_POST["rangkanyaa"];
    $id = $_POST["id"];
    
    $cekhasilsurvey = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyhasil WHERE cust_id = $id"));
    
    if ($cekhasilsurvey > 0) {
        $surveyhasilq = "UPDATE surveyhasil SET 
                survey_date = '$survey_date',
                nilai = $nilai,
                note = '$note'
                WHERE cust_id = $id
                ";

        mysqli_query($conn, $surveyhasilq);
    } else {
        $queryhasilnps = "INSERT INTO surveyhasil VALUES (NULL, '$survey_date', $id, $nilai, '$note')";
        mysqli_query($conn, $queryhasilnps);
    }
    
    header("Location: surveyupdate.php?alert=updatehasil&cari=$rangkanyaa&search=");
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Survey Update <?= $dari ?></title>
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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">Survey Update</a></li>
                                        <li class="breadcrumb-item active">Semua Data</li>
                                    </ol>
                                </div>
                                <h4 class="page-title">Semua Data Survey Update</h4>
                            </div>
                        </div>
                    </div>
                    <!-- end page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">

                                    <h4 class="header-title">Semua Data Survey Update</h4>

                                    <ul class="nav nav-tabs nav-bordered mb-3">
                                        <li class="nav-item">
                                            <a href="#survey" data-bs-toggle="tab" aria-expanded="false" class="nav-link active">
                                                PDI/PKT dan Survey
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
                                            <p>Menampilkan data Survey Update Bulan <?= $dari1 ?><?= $mulai ?> s/d <?= $dari2 ?><?= $sampai ?></p>
                                            <a class="mt-1" target="_blank" href="belumpkt.php?d=3"><?=$pdi?> Belum WA - Reminder Belum WA/PKT</a><br>
                                            <a class="mt-1" target="_blank" href="surveyaktif.php">Link Aktif</a>
                                            <?php
                                                
                                                $sql = "
                                                    SELECT 
                                                        DATE_FORMAT(survey_date, '%Y-%m') AS bulan,
                                                        SUM(CASE WHEN nilai >= 9 THEN 1 ELSE 0 END) AS promotor,
                                                        SUM(CASE WHEN nilai BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS passiver,
                                                        SUM(CASE WHEN nilai <= 6 THEN 1 ELSE 0 END) AS detraktor,
                                                        COUNT(*) AS total
                                                    FROM surveyhasil
                                                    WHERE survey_date BETWEEN '$firsttgl' AND '$lasttgl'
                                                    GROUP BY DATE_FORMAT(survey_date, '%Y-%m')
                                                    ORDER BY bulan ASC
                                                ";
                                                
                                                $result = $conn->query($sql);
                                                ?>
                                                
                                                <table class="border text-center mt-2 mb-2">
                                                    <thead>
                                                        <tr class="border">
                                                            <th class="border px-2">Bulan</th>
                                                            <th class="border px-2">Promotor</th>
                                                            <th class="border px-2">Passiver</th>
                                                            <th class="border px-2">Detraktor</th>
                                                            <th class="border px-2">%Promotor</th>
                                                            <th class="border px-2">%Passiver</th>
                                                            <th class="border px-2">%Detraktor</th>
                                                            <th class="border px-2">NPS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <?php while ($row = $result->fetch_assoc()): 
                                                            $promotor = $row['promotor'];
                                                            $passiver = $row['passiver'];
                                                            $detraktor = $row['detraktor'];
                                                            $total = $row['total'];
                                                
                                                            $pPromotor = $total ? round(($promotor / $total) * 100, 2) : 0;
                                                            $pPassiver = $total ? round(($passiver / $total) * 100, 2) : 0;
                                                            $pDetraktor = $total ? round(($detraktor / $total) * 100, 2) : 0;
                                                            $nps = $pPromotor - $pDetraktor;
                                                        ?>
                                                        <tr class="border">
                                                            <td class="border px-2"><?= date("F Y", strtotime($row['bulan']."-01")) ?></td>
                                                            <td class="border px-2"><?= $promotor ?></td>
                                                            <td class="border px-2"><?= $passiver ?></td>
                                                            <td class="border px-2"><?= $detraktor ?></td>
                                                            <td class="border px-2"><?= $pPromotor ?>%</td>
                                                            <td class="border px-2"><?= $pPassiver ?>%</td>
                                                            <td class="border px-2"><?= $pDetraktor ?>%</td>
                                                            <td class="border px-2"><?= $nps ?></td>
                                                        </tr>
                                                        <?php endwhile; ?>
                                                    </tbody>
                                                </table>
                                                        <div class="row">
                                                            <div class="col-lg-4">
                                                                <!-- Single Date Picker -->
                                                                <div class="mb-3">
                                                                    <form action="" method="GET">
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
                                                                    <form action="" method="GET">
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
                                                        
                                                        $namaExcel = 'surveyAktif'.$addnamefile.'.'.$ekstensi;
                                                        
                                                        
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
                                                            $exnama = $rows[2];
                                                            $extelp = $rows[3];
                                                            $exwadate = $rows[0];
                                                            $expdidate = $rows[0];
                                                            $exrangka = $rows[1];
                                                            $exkendaraan = $rows[4];
                                                            $exspv = $rows[6];
                                                            $exsales = $rows[5];
                                                            
                                                            
                                                            
                                                            // Check if rangka already exists
                                                            $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE rangka = '$exrangka'"));
                                                        
                                                            if ($cekrangka === 0) {
                                                                $queryexcel = "INSERT INTO surveyupdate VALUES (NULL, NULL, 'PDI', '$exnama', '$extelp', '$exrangka', '$exkendaraan', '$exspv', '$exsales', '$expdidate', '$exwadate', '', '', '', '', '', '')";
                                                                mysqli_query($conn, $queryexcel);
                                                            } else {
                                                                
                                                            }
                                                            
                                                        }
                                                        if (mysqli_affected_rows($conn) > 0) {
                                                            header("Location: surveyupdate.php?dari=$thisbulan$mulai&alert=tambah");
                                                        }
                                                        
                                                }
                                            ?>
                                            <!-- end nav-->
                                            <table id="basic-datatable" class="table dt-responsive nowrap w-100">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Nama</th>
                                                        <th>Status</th>
                                                        <th>Telp</th>
                                                        <th>Rangka</th>
                                                        <th>Est. Link</th>
                                                        <th>PKT</th>
                                                        <th>Case</th>
                                                        <th>Estimasi Nilai & Catatan</th>
                                                        <th>STNK</th>
                                                        <th>BPKB</th>
                                                        <th>FS 1</th>
                                                        <th>FS 2</th>
                                                        <th>Service</th>
                                                        <th>Record</th>
                                                        <th>Hasil</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <?php
                                                        $estlink = date('Y-m-d', strtotime($row["wa_date"] . ' +3 days'));
                                                        
                                                        $selisih_detik = strtotime($estlink) - strtotime($hariini);
                                                        
                                                        $days_left = floor($selisih_detik / (60 * 60 * 24));
                                                        
                                                        if ( $row["status"] === 'PERLU FOLLOW UP' ) {
                                                            $statuscolor = 'primary';
                                                        } elseif ( $row["status"] === 'PUAS' ) {
                                                            $statuscolor = 'info';
                                                        } elseif ( $row["status"] === 'TIDAK PUAS' ) {
                                                            $statuscolor = 'danger';
                                                        } elseif ( $row["status"] === 'KOMPLEN' ) {
                                                            $statuscolor = 'danger';
                                                        } elseif ( $row["status"] === 'TIDAK DIANGKAT' ) {
                                                            $statuscolor = 'warning';
                                                        } elseif ( $row["status"] === 'NOMOR SALAH' ) {
                                                            $statuscolor = 'warning';
                                                        } elseif ( $row["status"] === 'SALAH SAMBUNG' ) {
                                                            $statuscolor = 'warning';
                                                        } elseif ( $row["status"] === 'PROMOTOR' ) {
                                                            $statuscolor = 'success';
                                                        } elseif ( $row["status"] === 'PASSIVER' ) {
                                                            $statuscolor = 'warning';
                                                        } elseif ( $row["status"] === 'DETRACTOR' ) {
                                                            $statuscolor = 'danger';
                                                        } elseif ( $row["status"] === 'PDI' ) {
                                                            $statuscolor = 'secondary';
                                                        } else {
                                                            $statuscolor = 'warning';
                                                        }
                                                        
                                                        if ( $row["status"] === 'PDI' ) {
                                                            $statustext = 'BELUM PKT';
                                                            $alertspv = '';
                                                        } else {
                                                            $statustext = $row["status"];
                                                            $alertspv = 'd-none';
                                                        }
                                                        
                                                        if ( $row["stnk"] != '' ) {
                                                            $bgtable = 'bg-light';
                                                        } else {
                                                            $bgtable = '';
                                                        }
                                                    ?>
                                                    
                                                    <tr class="<?=$bgtable?>">
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td>
                                                            <a class="text-<?=$statuscolor?>" href="#" data-bs-toggle="modal" data-bs-target="#modal-status-<?php echo $row["id"] ?>"><strong><?php echo $statustext ?></strong></a>
                                                            <a target="_blank" href="belumpktrem.php?id=<?php echo $row["id"] ?>" class="text-info <?=$alertspv?>"><i class="mdi mdi-bell-alert-outline"></i></a>
                                                            <div id="modal-status-<?php echo $row["id"] ?>" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="<?=$statuscolor?>-header-modalLabel" aria-hidden="true">
                                                                <div class="modal-dialog">
                                                                    <div class="modal-content">
                                                                        <div class="modal-header modal-colored-header bg-<?=$statuscolor?>">
                                                                            <h4 class="modal-title" id="<?=$statuscolor?>-header-modalLabel"><?php echo $row["nama"] ?> - <?php echo $row["status"] ?></h4>
                                                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                        </div>
                                                                        <form action="" method="POST">
                                                                        <div class="modal-body">
                                                                            <input name="id" type="hidden" value="<?=$row["id"]?>">
                                                                            <div class="mb-3">
                                                                                <label for="example-select" class="form-label">Status Follow Up</label>
                                                                                <select name="status" class="form-select" id="example-select" required>
                                                                                    <option <?php if($row["status"] === 'PDI') echo "selected"; ?> value="">PDI</option>
                                                                                    <option <?php if($row["status"] === 'PERLU FOLLOW UP') echo "selected"; ?> value="PERLU FOLLOW UP">PKT</option>
                                                                                    <option <?php if($row["status"] === 'PUAS') echo "selected"; ?> value="PUAS">PUAS</option>
                                                                                    <option <?php if($row["status"] === 'TIDAK PUAS') echo "selected"; ?> value="TIDAK PUAS">TIDAK PUAS</option>
                                                                                    <option <?php if($row["status"] === 'KOMPLEN') echo "selected"; ?> value="KOMPLEN">KOMPLEN</option>
                                                                                    <option <?php if($row["status"] === 'TIDAK DIANGKAT') echo "selected"; ?> value="TIDAK DIANGKAT">TIDAK DIANGKAT</option>
                                                                                    <option <?php if($row["status"] === 'NOMOR SALAH') echo "selected"; ?> value="NOMOR SALAH">NOMOR SALAH</option>
                                                                                    <option <?php if($row["status"] === 'DITOLAK/REJECT') echo "selected"; ?> value="DITOLAK/REJECT">DITOLAK/REJECT</option>
                                                                                    <option <?php if($row["status"] === 'PERJANJIAN') echo "selected"; ?> value="PERJANJIAN">PERJANJIAN</option>
                                                                                    <option <?php if($row["status"] === 'SALAH SAMBUNG') echo "selected"; ?> value="SALAH SAMBUNG">SALAH SAMBUNG</option>
                                                                                    <option <?php if($row["status"] === 'PROMOTOR') echo "selected"; ?> value="PROMOTOR">PROMOTOR</option>
                                                                                    <option <?php if($row["status"] === 'PASSIVER') echo "selected"; ?> value="PASSIVER">PASSIVER</option>
                                                                                    <option <?php if($row["status"] === 'DETRACTOR') echo "selected"; ?> value="DETRACTOR">DETRACTOR</option>
                                                                                </select>
                                                                            </div>
                                                                            <?php
                                                                                if ( $row["status"] === 'PDI' ) {
                                                                                    $disablepkt = '';
                                                                                } else {
                                                                                    $disablepkt = 'd-none';
                                                                                }
                                                                            ?>
                                                                            <div class="mb-3 <?=$disablepkt?>">
                                                                                <label for="example-date" class="form-label">PKT Date</label>
                                                                                <input name="pkt" value="<?=$row["wa_date"]?>" class="form-control" id="example-date" type="date">
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="example-palaceholder" class="form-label">SPV</label>
                                                                                <input name="spv" value="<?=$row["spv"]?>" type="text" id="example-palaceholder" class="form-control" placeholder="Nama Supervisor ...">
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="example-textarea" class="form-label">Sales</label>
                                                                                <input type="text" name="sales" value="<?=$row["sales"]?>" class="form-control" id="example-textarea" rows="5" placeholder="Nama Sales ...">
                                                                            </div>
                                                                            <?php
                                                                                $idpkt = $row["id"];
                                                                                $ttlbukti = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM bukti_pkt WHERE unit_id = $idpkt"));
                                                                                
                                                                                if ($ttlbukti > 0) {
                                                                                    $pktceknya = 'checked';
                                                                                } else {
                                                                                    $pktceknya = '';
                                                                                }
                                                                            ?>
                                                                            <div class="form-check">
                                                                              <input name="ikutpkt" class="form-check-input" type="checkbox" value="Yes" id="flexCheckDefault" <?=$pktceknya?>>
                                                                              <label class="form-check-label text-wrap" for="flexCheckDefault">
                                                                               Apakah <mark>Sales</mark> mengikuti PKT/Serah terima kendaraan?
                                                                              </label>
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
                                                            <a href="#" class="text-<?=$statuscolor?>" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?php echo $row["time"] ?>">0<?php echo $row["telp"] ?></a>
                                                            <a target="_blank" href="waadmin.php?id=<?php echo $row["id"] ?>&via=wa" class="text-success"><i class="mdi mdi-whatsapp"></i></a>
                                                            <a target="_blank" href="waadmin.php?id=<?php echo $row["id"] ?>&via=sms" class="text-info"><i class="mdi mdi-message-text-outline"></i></a>
                                                            <a target="_blank" href="waadmin.php?id=<?php echo $row["id"] ?>&via=mmid" class="text-danger"><i class="mdi mdi-tablet-android"></i></a>
                                                        </td>
                                                        <td>
                                                            <a id="rangka<?php echo $row["id"] ?>" href="#" class="text-<?=$statuscolor?>" data-bs-toggle="modal" data-bs-target="#modal-to-konsumen-<?php echo $row["id"] ?>"><?php echo $row["rangka"] ?></a>
                                                            <a href="#" onclick="CopyToClipboard('rangka<?php echo $row["id"] ?>');return false;" class="text-secondary"><i class='mdi mdi-content-copy'></i></a>
                                                        </td>
                                                        <div id="modal-to-konsumen-<?php echo $row["id"] ?>" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="<?=$statuscolor?>-header-modalLabel" aria-hidden="true">
                                                            <div class="modal-dialog">
                                                                <div class="modal-content">
                                                                    <div class="modal-header modal-colored-header bg-<?=$statuscolor?>">
                                                                        <h4 class="modal-title" id="<?=$statuscolor?>-header-modalLabel">Send To Customer <?php echo $row["rangka"] ?></h4>
                                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-hidden="true"></button>
                                                                    </div>
                                                                    <form action="" method="POST">
                                                                    <div class="modal-body row">
                                                                        <input name="id" type="hidden" value="<?=$row["id"]?>">
                                                                        <div class="mb-3">
                                                                            <label class="form-label">Nama</label>
                                                                            <input name="nama" value="<?=$row["nama"]?>" class="form-control" id="example-date" type="text" readonly>
                                                                        </div>
                                                                        <div class="mb-3">
                                                                            <label class="form-label">No. Telepon</label>
                                                                            <input name="telp" value="0<?=$row["telp"]?>" class="form-control" id="example-date" type="text">
                                                                        </div>
                                                                        <?php
                                                                        $kendaraan = $row["kendaraan"];
                                                                        
                                                                        if (stristr($kendaraan, 'XPANDER')) {
                                                                            $vehicle = 'MITSUBISHI XPANDER';
                                                                        } elseif (stristr($kendaraan, 'DESTINATOR')) {
                                                                            $vehicle = 'MITSUBISHI DESTINATOR';
                                                                        } elseif (stristr($kendaraan, 'PAJERO')) {
                                                                            $vehicle = 'MITSUBISHI PAJERO';
                                                                        } elseif (stristr($kendaraan, 'XFORCE')) {
                                                                            $vehicle = 'MITSUBISHI XFORCE';
                                                                        } elseif (stristr($kendaraan, 'L300')) {
                                                                            $vehicle = 'MITSUBISHI L300';
                                                                        } elseif (stristr($kendaraan, 'TRITON')) {
                                                                            $vehicle = 'MITSUBISHI TRITON';
                                                                        }
                                                                        ?>
                                                                        <div class="mb-3">
                                                                            <label class="form-label"><?=$row["kendaraan"]?></label>
                                                                            <input name="kendaraan" value="<?=$vehicle?>" type="text" id="example-palaceholder" class="form-control" placeholder="Tulis Kendaraan...">
                                                                        </div>
                                                                        <div class="mb-3 col-lg-6">
                                                                            <label class="form-label">Nomor Polisi</label>
                                                                            <input type="text" value="B<?=$row["stnk"]?>" name="nopol" class="form-control" placeholder="Nomor Polisi..." required>
                                                                        </div>
                                                                        <div class="mb-3 col-lg-6">
                                                                            <label class="form-label">Prioritas</label>
                                                                            <select name="prioritas" class="form-select" id="prioritas" required>
                                                                                <option value="">- <?=$row["status"]?> -</option>
                                                                                <option value="1">Common</option>
                                                                                <option value="2">Loyal</option>
                                                                                <option value="3">High Priority</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div class="modal-footer">
                                                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Close</button>
                                                                        <button type="submit"  name="sendkonsumen" class="btn btn-<?=$statuscolor?>">To Be Customer</button>
                                                                    </div>
                                                                    </form>
                                                                </div><!-- /.modal-content -->
                                                            </div><!-- /.modal-dialog -->
                                                        </div><!-- /.modal -->
                                                        <?php
                                                            if ( $days_left > 0) {
                                                                $badgecolor = 'warning';
                                                                $textlink = $days_left.' Hari lagi';
                                                            } elseif ( $days_left <= 0 AND $days_left > -3 ) {
                                                                $badgecolor = 'success';
                                                                $textlink = 'Link Aktif';
                                                            } elseif ( $days_left < -3) {
                                                                $badgecolor = 'danger';
                                                                $textlink = 'Link Expired';
                                                            }
                                                            
                                                            if ($row['status'] === 'PDI') {
                                                                $pktdate = 'belum PKT';
                                                            } else {
                                                                $pktdate = 'PKT : '.$row['wa_date'].', Link akan dikirim pada '.$estlink;
                                                            }
                                                        ?>
                                                        <td>
                                                            <a href="#" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?=$pktdate?>" title="PDI : <?=$row['pdi_date']?>"><span class="badge bg-<?=$badgecolor?>"><?=$textlink?></span></a>
                                                            
                                                        </td>
                                                        <td>
                                                            <?php
                                                                $idpkt = $row["id"];
                                                                $ttlbukti = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM bukti_pkt WHERE unit_id = $idpkt"));
                                                                
                                                                if ($ttlbukti > 0) {
                                                                    $klikpkt = '#';
                                                                    $sudah = 'check-circle-outline';
                                                                    $warnanya = 'success';
                                                                } else {
                                                                    $klikpkt = 'buktipkt.php?unit_id='.$idpkt;
                                                                    $sudah = 'car';
                                                                    $warnanya = 'danger';
                                                                }
                                                            ?>
                                                            
                                                            <a href="<?=$klikpkt?>" class="text-<?=$warnanya?>" onclick="return confirm('Apakah Anda yakin Sales ikut PKT?')">
                                                                <i class='mdi mdi-<?=$sudah?>'></i>
                                                            </a>

                                                        </td>
                                                        <td>
                                                            <?php
                                                                $idcase = $row["id"];
                                                                $ttlcase = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate_case WHERE unit_id = $idcase AND status = 'Open'"));
                                                                
                                                                $case = query("SELECT * FROM surveyupdate_case WHERE unit_id = $idcase")[0];
                                                            
                                                                $newTimestamp = strtotime($case["time"] . ' +7 hours');

                                                                // Hitung selisih waktu dari sekarang
                                                                $diff = time() - $newTimestamp;
                                                                
                                                                // Konversi ke format "berapa hari yang lalu"
                                                                if ($diff < 60) {
                                                                    $umurcase = 'Baru saja';
                                                                } elseif ($diff < 3600) {
                                                                    $umurcase = floor($diff / 60) . ' menit yang lalu';
                                                                } elseif ($diff < 86400) {
                                                                    $umurcase = floor($diff / 3600) . ' jam yang lalu';
                                                                } else {
                                                                    $umurcase = floor($diff / 86400) . ' hari yang lalu';
                                                                }
                                                                
                                                                if ($ttlcase > 0) {
                                                                    $klikpkt = 'closecase.php?unit_id='.$idpkt;
                                                                    $sudah = 'chat-alert-outline';
                                                                    $warnanya = 'danger';
                                                                } else {
                                                                    $klikpkt = '#';
                                                                    $sudah = 'check-circle-outline';
                                                                    $warnanya = 'success';
                                                                    $umurcase = '';
                                                                }
                                                            ?>

                                                            
                                                            <a href="<?=$klikpkt?>" class="text-<?=$warnanya?>" onclick="return confirm('Sure Close this Case?')">
                                                                <i class='mdi mdi-<?=$sudah?>'></i> <?=$umurcase?>
                                                            </a>

                                                        </td>
                                                        <td>
                                                            <p class="text-wrap"><em>"<?=$row["est"]?> - <?=$row["note"]?>"</em></p>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if ($row["stnk"] === '') {
                                                                $stnkproses = floor((time() - strtotime($row["pdi_date"])) / (60 * 60 * 24));
                                                                echo $stnkproses.' Hari';
                                                            } else {
                                                                echo $row["stnk"];
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if ($row["bpkb"] === '') {
                                                                $bpkbproses = floor((time() - strtotime($row["pdi_date"])) / (60 * 60 * 24));
                                                                echo $bpkbproses.' Hari';
                                                            } else {
                                                                echo $row["bpkb"];
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if ($row["fs1"] === '') {
                                                                echo 'Not FS1';
                                                            } else {
                                                                echo $row["fs1"];
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if ($row["fs2"] === '') {
                                                                echo 'Not FS2';
                                                            } else {
                                                                echo $row["fs2"];
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if ($row["stnk"] === '') {
                                                                $stnkproses = floor((time() - strtotime($row["pdi_date"])) / (60 * 60 * 24));
                                                                echo $stnkproses.' Hari Proses STNK';
                                                            } else {
                                                                $nopolnya = $row["stnk"];
                                                                $totalservice = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM booking WHERE nopol = '$nopolnya'"));
                                                                
                                                                echo $totalservice.'x Service';
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                                $recordnya = query("SELECT * FROM surveyupdate_record WHERE unit_id = $idpkt");
                                                            ?>
                                                            <?php foreach ($recordnya as $rcnya) : ?>
                                                            <?php
                                                                $waktu_asli = $rcnya['time']; // Format timestamp
                                                                $waktu_baru = date("d/m/y H:i", strtotime($waktu_asli) + (7 * 3600));
                                                            ?>
                                                            <p class="mb-0"><small><?=$rcnya['status']?>, <?=$rcnya['pkt']?>, <?=$waktu_baru?></small></p>
                                                            <?php endforeach; ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                                $hasilnps = query("SELECT * FROM surveyhasil WHERE cust_id = $idpkt")[0];
                                                                $survey_date = date("Y-m-d", strtotime($hasilnps["survey_date"]));
                                                            ?>
                                                            <form action="" method="POST" class="d-flex align-items-center gap-2">
                                                                <input type="hidden" name="id" value="<?=$row["id"]?>">
                                                                <input type="hidden" name="rangkanyaa" value="<?=$row["rangka"]?>">
                                                                <input type="number" class="form-control" name="nilai" placeholder="Nilai NPS" style="width: 100px;" value="<?=$hasilnps["nilai"]?>">
                                                                <input type="text" class="form-control" name="note" placeholder="Note NPS" style="width: 200px;" value="<?=$hasilnps["note"]?>">
                                                                <input type="date" class="form-control" name="survey_date" placeholder="Note NPS" value="<?=$hasilnps["survey_date"]?>">
                                                                <button type="submit" name="catatNPS" class="btn btn-primary">Update</button>
                                                            </form>

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
                                                        <th>STNK</th>
                                                        <th>BPKB</th>
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td><?php echo $row["rangka"] ?></td>
                                                        <td><?php echo $row["kendaraan"] ?></td>
                                                        <td><?php echo $row["telp"] ?></td>
                                                        <td><?php echo $row["sales"] ?></td>
                                                        <td><?php echo $row["spv"] ?></td>
                                                        <td><?php echo $row["status"] ?></td>
                                                        <td><?php echo $row["est"] ?></td>
                                                        <td><?php echo $row["note"] ?></td>
                                                        <td><?php echo $row["stnk"] ?></td>
                                                        <td><?php echo $row["bpkb"] ?></td>
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
        $perlufollowup = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PERLU FOLLOW UP' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        
        $puas = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PUAS' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $tidakpuas = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'TIDAK PUAS' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $komplen = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'KOMPLEN' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $tidakdiangkat = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'TIDAK DIANGKAT' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $reject = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'DITOLAK/REJECT' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $nomorsalah = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'NOMOR SALAH' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $salahsambung = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'SALAH SAMBUNG' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $promotor = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PROMOTOR' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $passiver = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PASSIVER' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        $detractor = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'DETRACTOR' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl'"));
        
        $berhasilfu = $komplen+$puas+$promotor+$passiver+$detractor+$tidakpuas;
        $inproges = $perlufollowup+$tidakdiangkat+$nomorsalah+$salahsambung+$reject;
    ?>
    <script>
        var options = {
          series: [<?=$puas?>, <?=$tidakpuas?>, <?=$komplen?>, <?=$tidakdiangkat?>, <?=$nomorsalah?>, <?=$reject?>, <?=$salahsambung?>, <?=$promotor?>, <?=$passiver?>, <?=$detractor?>],
          chart: {
          width: 380,
          type: 'pie',
        },
        labels: ['PUAS', 'TIDAK PUAS', 'KOMPLEN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'REJECT', 'SALAH SAMBUNG', 'PROMOTOR', 'PASSIVER', 'DETRACTOR'],
        // colors: ['#0acf97', '#d9534f', '#d9534f', '#ffbc00', '#ffbc00', '#ffbc00', '#0acf97', '#ffbc00', '#d9534f', '#0acf97'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#respond-chart"), options);
        chart.render();
    </script>
    <script>
        var options = {
          series: [<?=$berhasilfu?>, <?=$inproges?>],
          chart: {
          width: 380,
          type: 'pie',
        },
        labels: ['Success Follow Up', 'In Progess'],
        colors: ['#0acf97', '#ffbc00'],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#surveyed-chart"), options);
        chart.render();
    </script>

</body>

</html>