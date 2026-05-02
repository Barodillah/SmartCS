<?php
session_start();
if (!isset($_SESSION["login"])) {
    header("Location: login.php");
    exit;
}

require 'func.php';
include 'accesslogin.php';

if ($user['nama'] == 'BAROD') {
    header("Location: surveyupdate.php");
    exit;
}

if ($user['nama'] == 'TEAM CS') {
    header("Location: exportsaja.php");
    exit;
}

$firsttgl = date('Y-m-01');
$lasttgl = date('Y-m-t');
$thisbulan = date('Y-m');

if (isset($_POST["search"])) {
    $cari = $_POST["cari"];
    $book = query("SELECT * FROM surveyupdate 
                WHERE
                nama LIKE '%$cari%' OR
                rangka LIKE '%$cari%' OR
                spv LIKE '%$cari%' OR
                kendaraan LIKE '%$cari%'
                ORDER BY id DESC");
} elseif (isset($_POST["cek"])) {
    $dari = $_POST["dari"];
    $dari1 = $dari . '-01';
    $dari2 = $dari . '-31';
    $book = query("SELECT * FROM surveyupdate WHERE status != 'PDI' AND wa_date BETWEEN '$dari1' AND '$dari2' ORDER BY id DESC");
} elseif (isset($_POST["belum"])) {
    $book = query("SELECT * FROM surveyupdate 
                    WHERE status IN ('PERLU FOLLOW UP', 'TIDAK DIANGKAT', 'DITOLAK/REJECT', 'PERJANJIAN') 
                    ORDER BY id DESC;
                    ");
} else {
    $book = query("SELECT * FROM surveyupdate WHERE status != 'PDI' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
}



$ini = new DateTime('today');
$hariini = $ini->format('Y-m-d');
// $tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");

if (isset($_POST["update"])) {
    $status = $_POST["status"];
    $nilai = $_POST["nilai"];
    $note = $_POST["note"];
    $id = $_POST["id"];

    $ikutpkt = $_POST["ikutpkt"];

    if ($ikutpkt === 'Yes') {
        $buktipkt = 'Yes';
        $querypkt = "INSERT INTO bukti_pkt VALUES (NULL, NULL, $id)";
        mysqli_query($conn, $querypkt);
    } else {
        $buktipkt = 'No';
        $querypkt = "DELETE FROM bukti_pkt WHERE unit_id = $id";
        mysqli_query($conn, $querypkt);
    }

    $kasus = $_POST["kasus"];

    if ($kasus === 'Open') {
        $idcase = $id;
        $ttlcase = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate_case WHERE unit_id = $idcase"));

        if ($ttlcase > 0) {

        } else {
            $querycase = "INSERT INTO surveyupdate_case VALUES (NULL, NULL, $id, 'Open')";
            mysqli_query($conn, $querycase);
        }
    }

    $queryy = "UPDATE surveyupdate SET 
                status = '$status',
                est = '$nilai',
                note = '$note'
                WHERE id = $id
                ";

    mysqli_query($conn, $queryy);


    $queryrecord = "INSERT INTO surveyupdate_record VALUES (NULL, NULL, $id, '$status', '$buktipkt')";
    mysqli_query($conn, $queryrecord);

    header("Location: surveyupdateCS.php?alert=update");


}

if (isset($_GET["nopuas"])) {
    $note = $_GET["note"];
    $id = $_GET["id"];

    $querynopuas = "UPDATE surveyupdate SET
                status = 'TIDAK PUAS',
                note = '$note'
                WHERE id = $id
                ";

    mysqli_query($conn, $querynopuas);


    header("Location: surveyupdateCS.php?alert=update");


}

if (isset($_GET["saran"])) {
    $note = $_GET["note"];
    $nilai = $_GET["nilai"];
    $id = $_GET["id"];

    $querysaran = "UPDATE surveyupdate SET 
                status = 'SARAN',
                est = '$nilai',
                note = '$note'
                WHERE id = $id
                ";

    mysqli_query($conn, $querysaran);


    header("Location: surveyupdateCS.php?alert=update");


}

if (isset($_GET["puas"])) {
    $id = $_GET["id"];

    $querypuas = "UPDATE surveyupdate SET 
                status = 'PUAS'
                WHERE id = $id
                ";

    mysqli_query($conn, $querypuas);


    header("Location: surveyupdateCS.php?alert=update");


}

$perlufollowup = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PERLU FOLLOW UP'"));

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Survey Update</title>
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

</head>

<body class="loading"
    data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, "showRightSidebarOnStart": true}'>
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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">Survey Update</a>
                                        </li>
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
                                    <p>Menampilkan data Survey Update Bulan ini</p>
                                    <p><strong><?= $perlufollowup ?> Konsumen perlu di follow up</strong> > klik tombol
                                        "Belum Follow Up"</p>
                                    <a class="mt-1" target="_blank" href="belumpkt.php">Reminder Belum WA/PKT</a>
                                    <br><br>




                                    <div class="row">
                                        <div class="col-lg-5">
                                            <!-- Single Date Picker -->
                                            <div class="mb-3">
                                                <form action="" method="POST">
                                                    <div class="input-group">
                                                        <input type="text" name="cari" id="tanggal"
                                                            class="form-control date" placeholder="Search..." required>
                                                        <button type="submit" name="search"
                                                            class="input-group-text bg-primary border-primary text-white">
                                                            <i class="mdi mdi-magnify font-13"></i>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        <div class="col-lg-5">
                                            <!-- Single Date Picker -->
                                            <div class="mb-3">
                                                <form action="" method="POST">
                                                    <div class="input-group">
                                                        <input type="month" name="dari" id="tanggal"
                                                            class="form-control date" value="<?= $dari ?>" required>
                                                        <button type="submit" name="cek"
                                                            class="input-group-text bg-primary border-primary text-white">
                                                            <i class="mdi mdi-magnify font-13"></i>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        <div class="col-lg-2">
                                            <!-- Single Date Picker -->
                                            <div class="mb-3">
                                                <form action="" method="POST">
                                                    <div class="input-group">
                                                        <input type="hidden" name="excel" id="example-fileinput"
                                                            class="form-control" required>
                                                        <button type="submit" name="belum"
                                                            class="btn btn-primary border-primary text-white">
                                                            <i class="mdi mdi-phone-alert font-13"></i> Belum Follow Up
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

                                        $namaExcel = 'surveyAktif' . $addnamefile . '.' . $ekstensi;


                                        $allFile = '_excel/' . $namaExcel;

                                        // move_uploaded_file($tmpName, $tmpFile);
                                        move_uploaded_file($tmpName, $allFile);

                                        error_reporting(0);
                                        ini_set('display_errors', 0);

                                        require "excelReader/excel_reader2.php";
                                        require "excelReader/SpreadsheetReader.php";

                                        $reader = new SpreadsheetReader($allFile);
                                        // var_dump($reader);
                                        // die;
                                        foreach ($reader as $key => $rows) {
                                            $exnama = $rows[0];
                                            $extelp = $rows[1];
                                            $exwadate = $rows[2];
                                            $exrangka = $rows[3];
                                            $exkendaraan = $rows[4];

                                            $queryexcel = "INSERT INTO surveyupdate VALUES (NULL, NULL, 'PERLU FOLLOW UP', '$exnama', '$extelp', '$exrangka', '$exkendaraan', '$exwadate', '', '')";
                                            mysqli_query($conn, $queryexcel);

                                        }
                                        if (mysqli_affected_rows($conn) > 0) {
                                            header("Location: surveyupdate.php?dari=$thisbulan$mulai&alert=tambah");
                                        }

                                    }
                                    ?>
                                    <!-- end nav-->
                                    <table id="datatable-buttons"
                                        class="table table-striped dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Nama</th>
                                                <th>Status</th>
                                                <th>Telp</th>
                                                <th>Rangka</th>
                                                <th>Est. Link</th>
                                                <th>Note</th>
                                            </tr>
                                        </thead>


                                        <tbody>
                                            <?php $i = 1; ?>
                                            <?php foreach ($book as $row): ?>
                                                <?php
                                                $estlink = date('Y-m-d', strtotime($row["wa_date"] . ' +3 days'));

                                                $selisih_detik = strtotime($estlink) - strtotime($hariini);

                                                $days_left = floor($selisih_detik / (60 * 60 * 24));

                                                if ($row["status"] === 'PERLU FOLLOW UP') {
                                                    $statuscolor = 'primary';
                                                } elseif ($row["status"] === 'PUAS') {
                                                    $statuscolor = 'success';
                                                } elseif ($row["status"] === 'SARAN') {
                                                    $statuscolor = 'info';
                                                } elseif ($row["status"] === 'TIDAK PUAS') {
                                                    $statuscolor = 'danger';
                                                } elseif ($row["status"] === 'KOMPLEN') {
                                                    $statuscolor = 'danger';
                                                } elseif ($row["status"] === 'TIDAK DIANGKAT') {
                                                    $statuscolor = 'secondary';
                                                } elseif ($row["status"] === 'NOMOR SALAH') {
                                                    $statuscolor = 'secondary';
                                                } elseif ($row["status"] === 'SALAH SAMBUNG') {
                                                    $statuscolor = 'secondary';
                                                } elseif ($row["status"] === 'PROMOTOR') {
                                                    $statuscolor = 'success';
                                                } elseif ($row["status"] === 'PASSIVER') {
                                                    $statuscolor = 'secondary';
                                                } elseif ($row["status"] === 'DETRACTOR') {
                                                    $statuscolor = 'danger';
                                                } elseif ($row["status"] === 'BIASA SAJA') {
                                                    $statuscolor = 'warning';
                                                } else {
                                                    $statuscolor = 'secondary';
                                                }

                                                if ($row["status"] === 'PERLU FOLLOW UP') {
                                                    $statustext = 'BELUM FOLLOW UP';
                                                } else {
                                                    $statustext = $row["status"];
                                                }
                                                ?>
                                                <tr>
                                                    <td><?php echo $i ?></td>
                                                    <td>
                                                        <a href="#" class="text-<?= $statuscolor ?>" data-bs-toggle="popover"
                                                            data-bs-placement="top" data-bs-trigger="hover"
                                                            data-bs-content="Sales : <?php echo $row["sales"] ?>"
                                                            title="SPV : <?php echo $row["spv"] ?>"><?php echo $row["nama"] ?></a>
                                                    </td>
                                                    <td>
                                                        <a class="text-<?= $statuscolor ?>" href="#" data-bs-toggle="modal"
                                                            data-bs-target="#modal-status-<?php echo $row["id"] ?>"><strong><?php echo $statustext ?></strong></a>
                                                        <div id="modal-status-<?php echo $row["id"] ?>" class="modal fade"
                                                            tabindex="-1" role="dialog"
                                                            aria-labelledby="<?= $statuscolor ?>-header-modalLabel"
                                                            aria-hidden="true">
                                                            <div class="modal-dialog">
                                                                <div class="modal-content">
                                                                    <div
                                                                        class="modal-header modal-colored-header bg-<?= $statuscolor ?>">
                                                                        <h4 class="modal-title"
                                                                            id="<?= $statuscolor ?>-header-modalLabel">
                                                                            <?php echo $row["nama"] ?> -
                                                                            <?php echo $row["status"] ?></h4>
                                                                        <button type="button" class="btn-close"
                                                                            data-bs-dismiss="modal"
                                                                            aria-hidden="true"></button>
                                                                    </div>
                                                                    <form action="" method="POST">
                                                                        <div class="modal-body">
                                                                            <input name="id" type="hidden"
                                                                                value="<?= $row["id"] ?>">
                                                                            <div class="mb-3">
                                                                                <label for="example-select"
                                                                                    class="form-label">Status Follow
                                                                                    Up</label>
                                                                                <select name="status" class="form-select"
                                                                                    id="example-select">
                                                                                    <option <?php if ($row["status"] === 'PERLU FOLLOW UP')
                                                                                        echo "selected"; ?>
                                                                                        value="PERLU FOLLOW UP">PERLU FOLLOW
                                                                                        UP</option>
                                                                                    <option <?php if ($row["status"] === 'PUAS')
                                                                                        echo "selected"; ?> value="PUAS">PUAS
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'BIASA SAJA')
                                                                                        echo "selected"; ?>
                                                                                        value="BIASA SAJA">BIASA SAJA
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'TIDAK PUAS')
                                                                                        echo "selected"; ?>
                                                                                        value="TIDAK PUAS">TIDAK PUAS
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'KOMPLEN')
                                                                                        echo "selected"; ?> value="KOMPLEN">
                                                                                        KOMPLEN</option>
                                                                                    <option <?php if ($row["status"] === 'SARAN')
                                                                                        echo "selected"; ?> value="SARAN">SARAN
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'TIDAK DIANGKAT')
                                                                                        echo "selected"; ?>
                                                                                        value="TIDAK DIANGKAT">TIDAK
                                                                                        DIANGKAT</option>
                                                                                    <option <?php if ($row["status"] === 'NOMOR SALAH')
                                                                                        echo "selected"; ?>
                                                                                        value="NOMOR SALAH">NOMOR SALAH
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'DITOLAK/REJECT')
                                                                                        echo "selected"; ?>
                                                                                        value="DITOLAK/REJECT">
                                                                                        DITOLAK/REJECT</option>
                                                                                    <option <?php if ($row["status"] === 'PERJANJIAN')
                                                                                        echo "selected"; ?>
                                                                                        value="PERJANJIAN">PERJANJIAN
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'SALAH SAMBUNG')
                                                                                        echo "selected"; ?>
                                                                                        value="SALAH SAMBUNG">SALAH SAMBUNG
                                                                                    </option>
                                                                                    <option <?php if ($row["status"] === 'PROMOTOR')
                                                                                        echo "selected"; ?> value="PROMOTOR">
                                                                                        PROMOTOR</option>
                                                                                    <option <?php if ($row["status"] === 'PASSIVER')
                                                                                        echo "selected"; ?> value="PASSIVER">
                                                                                        PASSIVER</option>
                                                                                    <option <?php if ($row["status"] === 'DETRACTOR')
                                                                                        echo "selected"; ?>
                                                                                        value="DETRACTOR">DETRACTOR</option>
                                                                                </select>
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="example-palaceholder"
                                                                                    class="form-label">Estimasi
                                                                                    Nilai</label>
                                                                                <input name="nilai" value="<?= $row["est"] ?>"
                                                                                    type="text" id="example-palaceholder"
                                                                                    class="form-control"
                                                                                    placeholder="Estimasi nilai yang diberikan konsumen...">
                                                                            </div>
                                                                            <div class="mb-3">
                                                                                <label for="example-textarea"
                                                                                    class="form-label">Catatan</label>
                                                                                <input type="textarea" name="note"
                                                                                    value="<?= $row["note"] ?>"
                                                                                    class="form-control"
                                                                                    id="example-textarea" rows="5"
                                                                                    placeholder="Saran yang diberikan konsumen...">
                                                                            </div>
                                                                            <?php
                                                                            // $nya = $row['id'];
                                                                            // $rangkanya = $row['rangka'];
                                                                            // $cekrfu = query("SELECT * FROM fu_wa WHERE unit_id = $nya AND rangka = '$rangkanya' ORDER BY id DESC")[0];
                                                                            // if ($cekrfu["edukasi"] === 'Yes') {
                                                                            //     $ceknya = 'checked';
                                                                            // } else {
                                                                            //     $ceknya = '';
                                                                            // }
                                                                            $idpkt = $row["id"];
                                                                            $ttlbukti = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM bukti_pkt WHERE unit_id = $idpkt"));

                                                                            if ($ttlbukti > 0) {
                                                                                $pktceknya = 'checked';
                                                                            } else {
                                                                                $pktceknya = '';
                                                                            }
                                                                            ?>
                                                                            <div class="form-check">
                                                                                <input name="ikutpkt"
                                                                                    class="form-check-input" type="checkbox"
                                                                                    value="Yes" id="flexCheckDefault"
                                                                                    <?= $pktceknya ?>>
                                                                                <label class="form-check-label text-wrap"
                                                                                    for="flexCheckDefault">
                                                                                    Apakah <mark>Sales
                                                                                        (<?= $row["sales"] ?>/<?= $row["spv"] ?>)</mark>
                                                                                    mengikuti PKT/Serah terima kendaraan?
                                                                                </label>
                                                                            </div>
                                                                            <?php
                                                                            $idcase = $row["id"];
                                                                            $ttlcase = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate_case WHERE unit_id = $idcase"));

                                                                            if ($ttlcase > 0) {
                                                                                $cekcase = 'checked';
                                                                            } else {
                                                                                $cekcase = '';
                                                                            }
                                                                            ?>
                                                                            <div class="form-check">
                                                                                <input name="kasus" class="form-check-input"
                                                                                    type="checkbox" value="Open" id="kasus"
                                                                                    <?= $cekcase ?>>
                                                                                <label class="form-check-label text-wrap"
                                                                                    for="kasus">
                                                                                    Masukan dalam kasus?
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="modal-footer">
                                                                            <button type="button" class="btn btn-light"
                                                                                data-bs-dismiss="modal">Close</button>
                                                                            <button type="submit" name="update"
                                                                                class="btn btn-<?= $statuscolor ?>">Save
                                                                                changes</button>
                                                                        </div>
                                                                    </form>
                                                                </div><!-- /.modal-content -->
                                                            </div><!-- /.modal-dialog -->
                                                        </div><!-- /.modal -->
                                                    </td>
                                                    <td>
                                                        <a class="text-<?= $statuscolor ?>" href="#" data-bs-toggle="modal"
                                                            data-bs-target="#script-fu<?= $row['id'] ?>">0<?php echo $row["telp"] ?></a>
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
                                                    if ($days_left > 0) {
                                                        $badgecolor = 'warning';
                                                        $textlink = $days_left . ' Hari lagi';
                                                        $textlinkfu = '<mark>' . $days_left . ' Hari lagi</mark> bapak/ibu akan dikirimi link survey';
                                                    } elseif ($days_left <= 0 AND $days_left > -3) {
                                                        $badgecolor = 'success';
                                                        $textlink = 'Link Aktif';
                                                        $textlinkfu = 'bapak/ibu <mark>Sudah</mark> dikirimi link survey';
                                                    } elseif ($days_left < -3) {
                                                        $badgecolor = 'danger';
                                                        $textlink = 'Link Expired';
                                                        $textlinkfu = 'Link Expired';
                                                    }
                                                    ?>
                                                    <!-- Modal -->
                                                    <div id="script-fu<?= $row['id'] ?>" class="modal fade" tabindex="-1"
                                                        role="dialog" aria-labelledby="multiple-oneModalLabel"
                                                        aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <h4 class="modal-title" id="multiple-oneModalLabel">
                                                                        Follow Up</h4>
                                                                    <button type="button" class="btn-close"
                                                                        data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <h5 class="mt-0"><?= $ucapan ?>,</h5>
                                                                    <p>Perkenalkan saya <mark><?= $user['nama'] ?></mark> dari
                                                                        Mitsubishi Bintaro, benar saya bicara dengan
                                                                        Bapak/Ibu <mark><?= $row['nama'] ?></mark>?
                                                                        <br><br>
                                                                        Pada data kami Bapak/Ibu melakukan pembelian
                                                                        kendaraan <mark><?= $row['kendaraan'] ?></mark> dengan
                                                                        nama STNK <mark><?= $row['nama'] ?></mark> bersama
                                                                        Sales kami
                                                                        <mark><?= $row['sales'] ?>/<?= $row['spv'] ?></mark>,
                                                                        apakah benar pak?
                                                                        <br><br>
                                                                        Saya ingin bertanya mengenai pelayanan sales kami ya
                                                                        pak,
                                                                        <br>- Apakah sales kami sudah menjelaskan
                                                                        fitur-fitur kendaraannya Pak/Bu?
                                                                        <br>- Apakah bapak/ibu puas dan merasa terbantu
                                                                        dengan pelayanan sales kami?
                                                                        <br>- Apakah bapak/ibu ada saran atau masukan untuk
                                                                        pelayanan sales kami?
                                                                    </p>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="button" class="btn btn-success"
                                                                        data-bs-target="#puas<?= $row['id'] ?>"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-dismiss="modal">Puas</button>
                                                                    <button type="button" class="btn btn-warning"
                                                                        data-bs-target="#saran<?= $row['id'] ?>"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-dismiss="modal">Saran</button>
                                                                    <button type="button" class="btn btn-danger"
                                                                        data-bs-target="#tidak-puas<?= $row['id'] ?>"
                                                                        data-bs-toggle="modal" data-bs-dismiss="modal">Tidak
                                                                        Puas</button>
                                                                </div>
                                                            </div><!-- /.modal-content -->
                                                        </div><!-- /.modal-dialog -->
                                                    </div><!-- /.modal -->

                                                    <!-- Modal -->
                                                    <div id="puas<?= $row['id'] ?>" class="modal fade" tabindex="-1"
                                                        role="dialog" aria-labelledby="multiple-twoModalLabel"
                                                        aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header bg-success">
                                                                    <h4 class="modal-title text-light"
                                                                        id="multiple-twoModalLabel">Konsumen Puas</h4>
                                                                    <button type="button" class="btn-close"
                                                                        data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <h5 class="mt-0">Karena bapak/ibu puas dan tidak ada
                                                                        saran,</h5>
                                                                    <p>Saya mohon bantuannya <?= $textlinkfu ?> dari
                                                                        <mark>Mitsubishi Motors Indonesia</mark>
                                                                        melalui <mark>Whatsapp/SMS/MMID</mark> mohon
                                                                        bantuannya diberikan nilai 9 atau 10 ya pak/bu,
                                                                        <mark>Karena bapak/ibu tadi menyampaikan bahwa puas
                                                                            dan tidak ada saran atas pelayanan sales
                                                                            kami.</mark>
                                                                        <br><br>
                                                                        Kami mengingatkan juga untuk service pertamanya
                                                                        supaya dilakukan pada 1000 km pertama atau 1,5 bulan
                                                                        pemakaian pertama. untuk booking service bisa
                                                                        menghubungi nomor ini atau melalui aplikasi MMID.
                                                                        <br><br>
                                                                        Sekian yang dapat saya sampaikan, terima kasih atas
                                                                        waktunya dan sehat selalu.
                                                                    </p>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <form action="" method="GET">
                                                                        <input name="id" type="hidden"
                                                                            value="<?= $row["id"] ?>">
                                                                        <button type="submit" name="puas"
                                                                            class="btn btn-success"
                                                                            data-bs-dismiss="modal">Konsumen Puas</button>
                                                                    </form>
                                                                </div>
                                                            </div><!-- /.modal-content -->
                                                        </div><!-- /.modal-dialog -->
                                                    </div>
                                                    <!-- Modal -->
                                                    <div id="tidak-puas<?= $row['id'] ?>" class="modal fade" tabindex="-1"
                                                        role="dialog" aria-labelledby="multiple-twoModalLabel"
                                                        aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header bg-danger">
                                                                    <h4 class="modal-title text-light"
                                                                        id="multiple-twoModalLabel">Konsumen Tidak Puas</h4>
                                                                    <button type="button" class="btn-close"
                                                                        data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <h5 class="mt-0">Bapak/Ibu tidak puas!</h5>
                                                                    <p>Untuk perbaikan kami kedepan bisa diinformasikan apa
                                                                        yang membuat bapak/ibu tidak puas?.</p>
                                                                    <form action="" method="GET">
                                                                        <input name="id" type="hidden"
                                                                            value="<?= $row["id"] ?>">
                                                                        <div class="mb-0">
                                                                            <textarea name="note" class="form-control"
                                                                                rows="3"
                                                                                placeholder="Tuliskan keluhan konsumen..."></textarea>
                                                                            <p class="text-danger"><small><em>Catat keluhan
                                                                                        dan berikan solusi yang inginkan
                                                                                        konsumen.</em></small></p>
                                                                        </div>
                                                                        <div class="dropdown-divider"></div>
                                                                        <p>
                                                                            Kami mengingatkan juga untuk service pertamanya
                                                                            supaya dilakukan pada 1000 km pertama atau 1,5
                                                                            bulan pemakaian pertama. untuk booking service
                                                                            bisa menghubungi nomor ini atau melalui aplikasi
                                                                            MMID.
                                                                            <br><br>
                                                                            Sekian yang dapat saya sampaikan, terima kasih
                                                                            atas waktunya dan sehat selalu.
                                                                        </p>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="submit" name="nopuas"
                                                                        class="btn btn-danger" data-bs-dismiss="modal">Tidak
                                                                        Puas</button>
                                                                </div>
                                                                </form>
                                                            </div><!-- /.modal-content -->
                                                        </div><!-- /.modal-dialog -->
                                                    </div>
                                                    <!-- Modal -->
                                                    <div id="saran<?= $row['id'] ?>" class="modal fade" tabindex="-1"
                                                        role="dialog" aria-labelledby="multiple-twoModalLabel"
                                                        aria-hidden="true">
                                                        <div class="modal-dialog">
                                                            <div class="modal-content">
                                                                <div class="modal-header bg-warning">
                                                                    <h4 class="modal-title" id="multiple-twoModalLabel">
                                                                        Konsumen Memberi Saran</h4>
                                                                    <button type="button" class="btn-close"
                                                                        data-bs-dismiss="modal" aria-label="Close"></button>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <h5 class="mt-0">Bisa disampaikan saran dan masukan dari
                                                                        bapak/ibu?</h5>
                                                                    <form action="" method="GET">
                                                                        <input name="id" type="hidden"
                                                                            value="<?= $row["id"] ?>">
                                                                        <div class="mb-0">
                                                                            <textarea name="note" class="form-control"
                                                                                rows="2"
                                                                                placeholder="Tuliskan saran/masukan konsumen..."></textarea>
                                                                            <p class="text-danger"><small><em>Catat saran
                                                                                        dan berikan ucapan terima kasih atas
                                                                                        masukannya kepada
                                                                                        konsumen.</em></small></p>
                                                                        </div>
                                                                        <div class="dropdown-divider"></div>
                                                                        Terima kasih atas masukan yang bapak/ibu sampaikan.
                                                                        <br>Tapi jika bapak/ibu ingin memberikan nilai dari
                                                                        1 sampai 10,
                                                                        <br><mark>1-6 <em>tidak puas</em></mark>
                                                                        <br><mark>7,8 <em>biasa saja</em></mark>
                                                                        <br><mark>9,10 <em>puas dan terbantu</em></mark>
                                                                        <br>bapak/ibu ingin memberikan nilai berapa?
                                                                        <br><br>
                                                                        <div class="mb-0">
                                                                            <input name="nilai" type="text"
                                                                                class="form-control"
                                                                                placeholder="Estimasi nilai yang diberikan konsumen...">
                                                                            <p class="text-success"><small><em>Jika
                                                                                        memberikan nilai 9,10 minta bantuan
                                                                                        <?= $textlinkfu ?> dari
                                                                                        <mark>Mitsubishi Motors
                                                                                            Indonesia</mark>
                                                                                        melalui
                                                                                        <mark>Whatsapp/SMS/MMID</mark></em></small>
                                                                            </p>
                                                                            <p class="text-danger"><small><em>Jika memberi
                                                                                        nilai 1-8 tidak usah disampaikan
                                                                                        jika ada link survey</em></small>
                                                                            </p>
                                                                        </div>
                                                                        <div class="dropdown-divider"></div>
                                                                        <p>
                                                                            Kami mengingatkan juga untuk service pertamanya
                                                                            supaya dilakukan pada 1000 km pertama atau 1,5
                                                                            bulan pemakaian pertama. untuk booking service
                                                                            bisa menghubungi nomor ini atau melalui aplikasi
                                                                            MMID.
                                                                            <br><br>
                                                                            Sekian yang dapat saya sampaikan, terima kasih
                                                                            atas waktunya dan sehat selalu.
                                                                        </p>
                                                                </div>
                                                                <div class="modal-footer">
                                                                    <button type="submit" name="saran"
                                                                        class="btn btn-warning"
                                                                        data-bs-dismiss="modal">Saran Konsumen</button>
                                                                </div>
                                                                </form>
                                                            </div><!-- /.modal-content -->
                                                        </div><!-- /.modal-dialog -->
                                                    </div>
                                                    <td><a href="#" class="text-<?= $statuscolor ?>" data-bs-toggle="popover"
                                                            data-bs-placement="top" data-bs-trigger="hover"
                                                            data-bs-content="<?php echo $row["kendaraan"] ?>"
                                                            title="<?php echo $row["rangka"] ?>"><?php echo $row["rangka"] ?></a>
                                                    </td>

                                                    <td>
                                                        <a href="#" data-bs-toggle="popover" data-bs-placement="top"
                                                            data-bs-trigger="hover"
                                                            data-bs-content="Link akan dikirim pada <?= $estlink ?>"
                                                            title="<?= $textlink ?>"><span
                                                                class="badge bg-<?= $badgecolor ?>"><?= $textlink ?></span></a>

                                                    </td>
                                                    <td>
                                                        <p><em>"<?= $row["est"] ?> - <?= $row["note"] ?>"</em></p>
                                                    </td>
                                                </tr>
                                                <?php $i++ ?>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>

                            </div> <!-- end card body-->
                        </div> <!-- end card -->
                    </div><!-- end col-->
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
                    <input class="form-check-input" type="checkbox" name="color-scheme-mode" value="light"
                        id="light-mode-check" checked="">
                    <label class="form-check-label" for="light-mode-check">Light Mode</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="color-scheme-mode" value="dark"
                        id="dark-mode-check">
                    <label class="form-check-label" for="dark-mode-check">Dark Mode</label>
                </div>


                <!-- Width -->
                <h5 class="mt-4">Width</h5>
                <hr class="mt-1">
                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="width" value="fluid" id="fluid-check"
                        checked="">
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
                    <input class="form-check-input" type="checkbox" name="theme" value="light" id="light-check"
                        checked="">
                    <label class="form-check-label" for="light-check">Light</label>
                </div>

                <div class="form-check form-switch mb-3">
                    <input class="form-check-input" type="checkbox" name="theme" value="dark" id="dark-check">
                    <label class="form-check-label" for="dark-check">Dark</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="fixed" id="fixed-check"
                        checked="">
                    <label class="form-check-label" for="fixed-check">Fixed</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="condensed"
                        id="condensed-check">
                    <label class="form-check-label" for="condensed-check">Condensed</label>
                </div>

                <div class="form-check form-switch mb-1">
                    <input class="form-check-input" type="checkbox" name="compact" value="scrollable"
                        id="scrollable-check">
                    <label class="form-check-label" for="scrollable-check">Scrollable</label>
                </div>

                <div class="d-grid mt-4">
                    <button class="btn btn-primary" id="resetBtn">Reset to Default</button>

                    <a href="../../product/hyper-responsive-admin-dashboard-template/index.htm"
                        class="btn btn-danger mt-3" target="_blank"><i class="mdi mdi-basket me-1"></i> Purchase Now</a>
                </div>
            </div> <!-- end padding-->

        </div>
    </div>

    <div class="rightbar-overlay"></div>
    <!-- /End-bar -->


    <!-- bundle -->
    <script src="assets/js/vendor.min.js"></script>
    <script src="assets/js/app.min.js"></script>

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

</body>

</html>