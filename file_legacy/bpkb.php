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
    $book = query("SELECT * FROM surveyupdate 
                WHERE bpkb = 'READY' OR bpkb = 'CALL' AND
                nama LIKE '%$cari%' OR
                rangka LIKE '%$cari%' OR
                spv LIKE '%$cari%' OR
                kendaraan LIKE '%$cari%'
                ORDER BY id DESC");
} elseif ( isset($_POST["cek"]) ) {
    $dari = $_POST["dari"];
    $firsttgl = $dari.'-01';
    $lasttgl = $dari.'-31';
    $book = query("SELECT * FROM surveyupdate WHERE bpkb = 'READY' AND wa_date BETWEEN '$firsttgl' AND '$lasttgl' ORDER BY id DESC");
} else {
    $book = query("SELECT * FROM surveyupdate WHERE bpkb = 'READY' OR bpkb = 'CALL' ORDER BY id DESC");
}



$ini = new DateTime('today');
$hariini = $ini->format('Y-m-d');
// $tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");



if ( isset($_GET["via"]) ) {
    $via = $_GET["via"];
    $id = $_GET["id"];
    
    $queryy = "UPDATE surveyupdate SET 
                bpkb = 'CALL'
                WHERE id = $id
                ";

    mysqli_query($conn, $queryy);
  
  
  header("Location: bpkb.php?alert=call");
    
    
}
$pdi = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE status = 'PDI'"));
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>BPKB <?= $dari ?></title>
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
                                        <li class="breadcrumb-item"><a href="javascript: void(0);">BPKB</a></li>
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

                                    <h4 class="header-title">Semua Data BPKB</h4>

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
                                            <p>Menampilkan data BPKB Bulan <?= $dari1 ?><?= $mulai ?> s/d <?= $dari2 ?><?= $sampai ?></p>
                                            <a class="mt-1" target="_blank" href="bpkb_syarat.php">Syarat Pengambilan BPKB</a>
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
                                                            
                                                            <!--<div class="col-lg-4">-->
                                                                <!-- Single Date Picker -->
                                                            <!--    <div class="mb-3">-->
                                                            <!--        <form action="" method="POST">-->
                                                            <!--        <div class="input-group"> -->
                                                            <!--            <input type="month" name="dari" id="tanggal" class="form-control date" value="<?= $dari ?>" required>-->
                                                            <!--            <button type="submit" name="cek" class="input-group-text bg-primary border-primary text-white">-->
                                                            <!--                <i class="mdi mdi-magnify font-13"></i>-->
                                                            <!--            </button>-->
                                                            <!--        </div>-->
                                                            <!--        </form>-->
                                                            <!--    </div>-->
                                                            <!--</div>-->
        
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
                                                        
                                                        $namaExcel = 'ReadyBPKB'.$addnamefile.'.'.$ekstensi;
                                                        
                                                        
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
                                                            
                                                            
                                                            
                                                            // Check if rangka already exists
                                                            $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyupdate WHERE rangka = '$exrangka' AND bpkb != ''"));
                                                        
                                                            if ($cekrangka === 0) {
                                                                $queryexcel = "UPDATE surveyupdate SET bpkb = 'READY' WHERE rangka = '$exrangka'";
                                                                mysqli_query($conn, $queryexcel);
                                                            } else {
                                                                
                                                            }
                                                            
                                                        }
                                                        
                                                        if (mysqli_affected_rows($conn) > 0) {
                                                            header("Location: bpkb.php?alert=ready");
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
                                                    </tr>
                                                </thead>
                                            
                                            
                                                <tbody>
                                                    <?php $i = 1; ?>
                                                    <?php foreach ($book as $row) : ?>
                                                    <?php
                                                        $estlink = date('Y-m-d', strtotime($row["wa_date"] . ' +3 days'));
                                                        
                                                        $selisih_detik = strtotime($estlink) - strtotime($hariini);
                                                        
                                                        $days_left = floor($selisih_detik / (60 * 60 * 24));
                                                        
                                                        if ( $row["bpkb"] === 'READY' ) {
                                                            $statuscolor = 'primary';
                                                        } elseif ( $row["bpkb"] === 'CALL' ) {
                                                            $statuscolor = 'danger';
                                                        }
                                                        
                                                        if ( $row["bpkb"] === 'CALL' ) {
                                                            $statustext = 'REQUEST CALL';
                                                        } else {
                                                            $statustext = $row["bpkb"];
                                                        }
                                                    ?>
                                                    <tr>
                                                        <td><?php echo $i ?></td>
                                                        <td><?php echo $row["nama"] ?></td>
                                                        <td>
                                                            <a class="text-<?=$statuscolor?>" href="#" data-bs-toggle="modal" data-bs-target="#modal-status-<?php echo $row["id"] ?>"><strong><?php echo $statustext ?></strong></a>
                                                        </td>
                                                        <td>
                                                            <a href="#" class="text-<?=$statuscolor?>" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?php echo $row["time"] ?>">0<?php echo $row["telp"] ?></a>
                                                            <a target="_blank" href="waadmin.php?id=<?php echo $row["id"] ?>&via=bpkb" class="text-success"><i class="mdi mdi-whatsapp"></i></a>
                                                            <a href="bpkb.php?id=<?php echo $row["id"] ?>&via=call" class="text-danger"><i class="mdi mdi-phone"></i></a>
                                                            <a href="#" onclick="waSPV<?php echo $row["id"] ?>()" class="text-info"><i class="mdi mdi-whatsapp"></i></a>
                                                        </td>
                                                        <script>
                                                            function waSPV<?php echo $row["id"] ?>() {
                                                                Swal.fire({
                                                                  input: 'text',
                                                                  inputLabel: 'Nomor SPV <?php echo $row["spv"] ?>',
                                                                  inputPlaceholder: 'Tulis Nomor <?php echo $row["spv"] ?>...',
                                                                  showCancelButton: true,
                                                                  inputValidator: (value) => {
                                                                      window.location.href = 'waadmin.php?id=<?php echo $row["id"] ?>&via=bpkbspv&nomer='+value;
                                                                  }
                                                                })
                                                            }
                                                        </script>
                                                        <td>
                                                            <a id="rangka<?php echo $row["id"] ?>" href="#" class="text-<?=$statuscolor?>" data-bs-toggle="popover" data-bs-placement="top" data-bs-trigger="hover" data-bs-content="<?php echo $row["kendaraan"] ?>" title="<?php echo $row["rangka"] ?>"><?php echo $row["rangka"] ?></a>
                                                            <a href="#" onclick="CopyToClipboard('rangka<?php echo $row["id"] ?>');return false;" class="text-secondary"><i class='mdi mdi-content-copy'></i></a>
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
    

</body>

</html>