<?php

date_default_timezone_set("Asia/Jakarta");

require 'func.php';

header("refresh: 300");



$besok = new DateTime('tomorrow');
$ada = $besok->format('Y-m-d');

$harini = new DateTime('today');
$adaini = $harini->format('Y-m-d');

$kemaren = new DateTime('yesterday');
$adamaren = $kemaren->format('Y-m-d');

$keyword = $_GET['date'];

if (!isset($keyword)) {
    $keyword = 'TIDAKADA';
} else {
    $keyword = $_GET['date'];
}

$currentHour = date("H:i");

if ($currentHour >= "07:30" && $currentHour < "08:30") {
    $jamnya = '08:00';
    $jamnyas = '08:30';
} else if ($currentHour >= "08:30" && $currentHour < "09:30") {
    $jamnya = '09:00';
    $jamnyas = '09:30';
} else if ($currentHour >= "09:30" && $currentHour < "10:30") {
    $jamnya = '10:00';
    $jamnyas = '10:30';
} else if ($currentHour >= "10:30" && $currentHour < "11:30") {
    $jamnya = '11:00';
    $jamnyas = '11:30';
}

// Gunakan $jamnya dan $jamnyas sesuai kebutuhan di dalam kode Anda


$book = query("SELECT * FROM booking WHERE status = 'REQUEST'");
$booksel = query("SELECT * FROM booking WHERE status = 'REQUEST DIFOLLOW UP'");
$bookkon = query("SELECT * FROM booking WHERE status = 'KONFIRMASI'");
$bookedit = query("SELECT * FROM booking WHERE status = 'EDIT'");
$bookingat = query("SELECT * FROM booking WHERE tanggal = '$adaini' AND status = 'BOOKING' AND jam = '$jamnya'");
$bookingats = query("SELECT * FROM booking WHERE tanggal = '$adaini' AND status = 'BOOKING' AND jam = '$jamnyas'");
$bookcari = query("SELECT * FROM booking 
                WHERE
                nama LIKE '%$keyword%' OR
                nopol LIKE '%$keyword%' OR
                telp LIKE '%$keyword%' OR
                tanggal LIKE '%$keyword%'
                ORDER BY id DESC");
                
function time_elapsed_string($datetime, $full = false) {
    $now = new DateTime;
    $ago = new DateTime($datetime);
    $diff = $now->diff($ago);

    $diff->w = floor($diff->d / 7);
    $diff->d -= $diff->w * 7;

    $string = array(
        'y' => 'tahun',
        'm' => 'bulan',
        'w' => 'minggu',
        'd' => 'hari',
        'h' => 'jam',
        'i' => 'menit',
        's' => 'detik',
    );
    foreach ($string as $k => &$v) {
        if ($diff->$k) {
            $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
        } else {
            unset($string[$k]);
        }
    }

    if (!$full) $string = array_slice($string, 0, 1);
    return $string ? implode(', ', $string) . ' yang lalu' : 'sekarang';
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Perlu Di Whatsapp</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta content="A fully featured admin theme which can be used to build CRM, CMS, etc." name="description">
    <meta content="Coderthemes" name="author">
    <!-- App favicon -->
    <link rel="shortcut icon" href="assets/images/favicon.ico">

    <!-- third party css -->
    <link href="assets/css/vendor/jquery-jvectormap-1.2.2.css" rel="stylesheet" type="text/css">
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
    <script src="dist/sweetalert2.all.min.js"></script>

</head>

<body class="loading" data-layout-config='{"leftSideBarTheme":"dark","layoutBoxed":false, "leftSidebarCondensed":false, "leftSidebarScrollable":false,"darkMode":false, '>
    <!-- Begin page -->
    <div class="wrapper">
        <!-- ========== Left Sidebar Start ========== -->
        
        <!-- Left Sidebar End -->

        <!-- ============================================================== -->
        <!-- Start Page Content here -->
        <!-- ============================================================== -->

        <div class="container">
            <div class="content">
                <!-- Topbar Start -->
                
                <!-- end Topbar -->

                <!-- Start Content-->
                <div class="container-fluid">

                    <!-- start page title -->
                
                    <!--coba-->
                    <!-- end page title -->
                    <div class="row">
                        <div class="col-12">
                            <div class="page-title-box">
                                <br>
                                <a href="hpcs.php">REFRESH</a>
                                <br>
                            </div>
                        </div>
                    </div>
                    <!--coba-->
                    <!-- end page title -->
                    <div class="row"  id="besok">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-body">
                                    <form class="d-flex">
                                        <div class="input-group">
                                            <input type="text" name="date" class="form-control form-control-light">
                                            <button type="submit" name="cari" class="input-group-text bg-primary border-primary text-white">
                                                <i class="mdi mdi-magnify font-13"></i>
                                            </button>
                                        </div>
                                        
                                    </form>
                                    <br>
                                    
                                    

                                    <h4 class="header-title">PERLU DI WHATSAPP</h4>
                                    

                                    
                                    <br>


                                    <!-- end nav-->
                                    <div class="tab-content">
                                        <div class="tab-pane show active">
                                            <table id="basic-datatable" class="table dt-responsive nowrap w-100">
                                                <thead>
                                                    <tr>
                                                        
                                                        <th>No. Booking</th>
                                                        <th>No. Polisi</th>
                                                        <th>Nama</th>
                                                        <th>Tanggal</th>
                                                        
                                                        
                                                        <th>Jam</th>
                                                        <th>Kendaraan</th>
                                                        
                                                        <th>Jenis</th>
                                                        <th>Keluhan</th>
                                                        <th>Time & By</th>
                                                        <th></th>
                                                        
                                                        
                                                    </tr>
                                                </thead>


                                                <tbody>
                                                    <?php foreach ($book as $row) : ?>
                                                        <tr>
                                                            
                                                            <td class="text-success" style="font-weight:bold; text-align: center;"><?php echo $row["antrian"];?></td>
                                                            <td><?php echo $row["nopol"] ?></td>
                                                            <td><?php echo $row["nama"] ?></td>
                                                            <td><?php echo $row["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $row["jam"] ?></td>
                                                            <td><?php echo $row["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $row["jenis"] ?></td>
                                                            <td><?php echo $row["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($row["time"]) ?> by <?php echo $row["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="updatesendwa.php?id=<?php echo $row["id"] ?>" class="btn btn-success"><i class="mdi mdi-whatsapp"></i></a> 
                                                                <a target="_blank" href="https://team.csdwindo.online/statusservice/backbooking.php?id=<?php echo $row["id"] ?>&user=ADMIN" class="btn btn-secondary"><i class="mdi mdi-whatsapp"></i></a> 
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($booksel as $rows) : ?>
                                                        <tr>
                                                            
                                                            <td class="text-info" style="font-weight:bold; text-align: center;"><?php echo $rows["antrian"];?></td>
                                                            <td><?php echo $rows["nopol"] ?></td>
                                                            <td><?php echo $rows["nama"] ?></td>
                                                            <td><?php echo $rows["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rows["jam"] ?></td>
                                                            <td><?php echo $rows["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rows["jenis"] ?></td>
                                                            <td><?php echo $rows["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rows["time"]) ?> by <?php echo $rows["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="waselesaiservice.php?id=<?php echo $rows["id"] ?>" class="btn btn-info"><i class="mdi mdi-whatsapp"></i></a> 
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($bookkon as $rowk) : ?>
                                                        <tr>
                                                            
                                                            <td class="text-primary" style="font-weight:bold; text-align: center;"><?php echo $rowk["antrian"];?></td>
                                                            <td><?php echo $rowk["nopol"] ?></td>
                                                            <td><?php echo $rowk["nama"] ?></td>
                                                            <td><?php echo $rowk["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rowk["jam"] ?></td>
                                                            <td><?php echo $rowk["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rowk["jenis"] ?></td>
                                                            <td><?php echo $rowk["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rowk["time"]) ?> by <?php echo $rowk["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="wakonfirmasi.php?id=<?php echo $rowk["id"] ?>" class="btn btn-secondary"><i class="mdi mdi-whatsapp"></i></a> 
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($bookedit as $rowe) : ?>
                                                        <tr>
                                                            
                                                            <td class="text-warning" style="font-weight:bold; text-align: center;"><?php echo $rowe["antrian"];?></td>
                                                            <td><?php echo $rowe["nopol"] ?></td>
                                                            <td><?php echo $rowe["nama"] ?></td>
                                                            <td><?php echo $rowe["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rowe["jam"] ?></td>
                                                            <td><?php echo $rowe["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rowe["jenis"] ?></td>
                                                            <td><?php echo $rowe["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rowe["time"]) ?> by <?php echo $rowe["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="rejadwalsendwa.php?id=<?php echo $rowe["id"] ?>" class="btn btn-warning"><i class="mdi mdi-whatsapp"></i></a> 
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($bookcari as $rowc) : ?>
                                                        <tr>
                                                            
                                                            <td  style="font-weight:bold; text-align: center;"><?php echo $rowc["antrian"];?></td>
                                                            <td><?php echo $rowc["nopol"] ?></td>
                                                            <td><?php echo $rowc["nama"] ?></td>
                                                            <td><?php echo $rowc["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rowc["jam"] ?></td>
                                                            <td><?php echo $rowc["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rowc["jenis"] ?></td>
                                                            <td><?php echo $rowc["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rowc["time"]) ?> by <?php echo $rowc["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="updatesendwa.php?id=<?php echo $row["id"] ?>" class="btn btn-success"><i class="mdi mdi-whatsapp"></i> Accept Booking</a><br>
                                                                <a target="_blank" href="rejadwalsendwa.php?id=<?php echo $rowe["id"] ?>" class="btn btn-warning"><i class="mdi mdi-whatsapp"></i> Reschedule</a><br>
                                                                <a target="_blank" href="wakonfirmasi.php?id=<?php echo $rowk["id"] ?>" class="btn btn-secondary"><i class="mdi mdi-whatsapp"></i> Konfirmasi Service</a><br>
                                                                <a target="_blank" href="waselesaiservice.php?id=<?php echo $rows["id"] ?>" class="btn btn-info"><i class="mdi mdi-whatsapp"></i> Selesai Service</a> 
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($bookingat as $rowi) : ?>
                                                
                                                        <tr>
                                                            
                                                            <td class="text-danger" style="font-weight:bold; text-align: center;"><?php echo $rowi["antrian"];?></td>
                                                            <td><?php echo $rowi["nopol"] ?></td>
                                                            <td><?php echo $rowi["nama"] ?></td>
                                                            <td><?php echo $rowi["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rowi["jam"] ?></td>
                                                            <td><?php echo $rowi["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rowi["jenis"] ?></td>
                                                            <td><?php echo $rowi["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rowi["time"]) ?> by <?php echo $rowi["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="waingatkan.php?id=<?php echo $rowi["id"] ?>" class="btn btn-danger"><i class="mdi mdi-whatsapp"></i></a><br>
                                                                <a href="bataldatang.php?id=<?php echo $rowi["id"] ?>" class="btn btn-danger"><i class="mdi mdi-cancel"></i>CANCEL</a><br>
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                    <?php foreach ($bookingats as $rowis) : ?>
                                                
                                                        <tr>
                                                            
                                                            <td class="text-danger" style="font-weight:bold; text-align: center;"><?php echo $rowis["antrian"];?></td>
                                                            <td><?php echo $rowis["nopol"] ?></td>
                                                            <td><?php echo $rowis["nama"] ?></td>
                                                            <td><?php echo $rowis["tanggal"] ?></td>
                                                            
                                                            <td><?php echo $rowis["jam"] ?></td>
                                                            <td><?php echo $rowis["kendaraan"] ?></td>
                                                            
                                                            <td><?php echo $rowis["jenis"] ?></td>
                                                            <td><?php echo $rowis["keluhan"] ?></td>
                                                            <td><?php echo time_elapsed_string($rowis["time"]) ?> by <?php echo $rowis["user"] ?></td>
                                                            <td>
                                                                <a target="_blank" href="waingatkan.php?id=<?php echo $rowis["id"] ?>" class="btn btn-danger"><i class="mdi mdi-whatsapp"></i></a><br>
                                                                <a href="bataldatang.php?id=<?php echo $rowis["id"] ?>" class="btn btn-danger"><i class="mdi mdi-cancel"></i>CANCEL</a><br>
                                                            </td>
                                                            
                                                            
                                                        </tr>
                                                    <?php endforeach; ?>
                                                </tbody>
                                            </table>
                                        </div> <!-- end preview-->

                                        <!-- end preview code-->
                                    </div> <!-- end tab-content-->

                                </div>
                                
                                <div class="container" style="margin-bottom: 10px;">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <script>
                                                document.write(new Date().getFullYear())
                                            </script> © CS Bintaro - <a target="_blank" href="https://punyabarod.com" style="color: #6c757d;"> punyaBarod.com </a> 
                                        </div>
                                        <div class="col-md-6">
                                            <div class="text-md-end footer-links d-none d-md-block">
                                                <a href="https://punyabarod.com/">About</a>
                                                <a href="https://punyabarod.com/">Support</a>
                                                <a href="https://punyabarod.com/">Contact Us</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- end card body-->
                            </div> <!-- end card -->
                        </div><!-- end col-->
                    </div>
                    
                    
                    

                    

                    <!-- end row -->


                    <!-- end row -->

                </div>
                <!-- container -->

            </div>
            <!-- content -->
            
            <!-- Footer Start -->
            <!--<footer class="footer" style="margin-bottom: 10px;">-->
            <!--    <div class="container">-->
            <!--        <div class="row">-->
            <!--            <div class="col-md-6">-->
            <!--                <script>-->
            <!--                    document.write(new Date().getFullYear())-->
            <!--                </script> © CS Bintaro - <a target="_blank" href="https://punyabarod.com" style="color: #6c757d;"> punyaBarod.com </a> -->
            <!--            </div>-->
            <!--            <div class="col-md-6">-->
            <!--                <div class="text-md-end footer-links d-none d-md-block">-->
            <!--                    <a href="https://punyabarod.com/">About</a>-->
            <!--                    <a href="https://punyabarod.com/">Support</a>-->
            <!--                    <a href="https://punyabarod.com/">Contact Us</a>-->
            <!--                </div>-->
            <!--            </div>-->
            <!--        </div>-->
            <!--    </div>-->
            <!--</footer>-->
            <!-- end Footer -->

        </div>

        <!-- ============================================================== -->
        <!-- End Page content -->
        <!-- ============================================================== -->


    </div>
    <!-- END wrapper -->

    <!-- Right Sidebar -->
    

    <div class="rightbar-overlay"></div>
    <!-- /End-bar -->

    <!-- bundle -->
    <script src="assets/js/vendor.min.js"></script>
    <script src="assets/js/app.min.js"></script>

    <!-- third party js -->
    <script src="assets/js/vendor/apexcharts.min.js"></script>
    <script src="assets/js/vendor/jquery-jvectormap-1.2.2.min.js"></script>
    <script src="assets/js/vendor/jquery-jvectormap-world-mill-en.js"></script>
    
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
    <?php




    ?>
    <!-- demo app -->
    <script src="assets/js/pages/demo.dashboard.js"></script>
    <?php if (isset($detail)) : ?>
        <script>
            Swal.fire({
              title: 'Detail Data',
              text: 'Booking a/n  <?php echo $lihat["nama"]; ?>, <?php echo $lihat["tanggal"]; ?>, <?php echo $lihat["jam"]; ?>, <?php echo $lihat["kendaraan"]; ?>, <?php echo $lihat["nopol"]; ?>, <?php echo $lihat["jenis"]; ?>',
              icon: 'info',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Ubah'
            }).then((result) => {
              if (result.isConfirmed) {
                  
                    Swal.fire({
                      title: 'Masukan No. Telepon Untuk Confirm Data',
                      input: 'text',
                      inputPlaceholder: 'Masukan No. Telepon',
                      showCancelButton: true,
                      inputValidator: (value) => {
                        return new Promise((resolve) => {
                          if (value === '<?php echo $lihat["telp"]; ?>') {
                            window.location.href = 'https://booking.dwindoservice.online/ubahcus2.php?id=<?php echo $lihat["id"]; ?>';
                          } else {
                            resolve('No. Telepon Anda Salah!')
                          }
                        })
                      }
                    })
                
                  
                
                  
                
                
                
              }
            });
        </script>
    <?php endif; ?>
    <?php if (isset($nodetail)) : ?>
        <script>
            Swal.fire(
                'Data tidak ada!!',
                'No. Polisi <?= $nopolg ?> tidak ditemukan',
                'error'
            );
        </script>
    <?php endif; ?>
    
    <!-- end demo js-->
</body>

</html>