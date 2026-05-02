<?php



require 'func.php';
include 'accesslogin.php';



date_default_timezone_set('Asia/Jakarta');

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
    
$hari_ini = date('j F Y');

$id = $_GET['id'];
$via = $_GET['via'];

$book = query("SELECT * FROM surveyupdate WHERE id = $id")[0];
    
    

  $nowa = $book['telp'];
  $nama = $book['nama'];
  $kendaraan = $book['kendaraan'];
  $rangka = $book['rangka'];
    if ( $via === 'wa' ) {
        header("Location: https://wa.me/62$nowa?text=$salam, Bapak/Ibu *$nama*,%0AKami sangat menghargai waktu anda!%0AKami PT DWINDO BERLIAN SAMJAYA ingin mengucapkan terima kasih atas kepercayaan Bapak/Ibu dalam melakukan pembelian kendaraan  *$kendaraan* di tempat kami.%0AMohon bantuannya dengan meluangkan sedikit waktu untuk mengisi survei digital yang sudah dikirim melalui *Whatsapp Mitsubishi Motors Indonesia* ✅.%0A%0A_Kami ingin mengingatkan bahwa, jika Bapak/Ibu merasa puas dengan pelayanan dan proses penjualan kami, mohon berikan nilai 9 atau 10 pada survey tersebut. Nilai ini sangat berarti bagi kami, *karena hanya nilai 9 dan 10 yang menunjukkan kepuasan dari pelanggan kami*._%0A%0ATerima kasih telah menjadi bagian dari perjalanan kami, dan kami senang dapat terus melayani Anda dengan lebih baik lagi. Semoga hari anda menyenangkan dan semoga sehat selalu!");
    } elseif ($via === 'sms') {
        header("Location: https://wa.me/62$nowa?text=$salam, Bapak/Ibu *$nama*,%0AKami sangat menghargai waktu anda!%0AKami PT DWINDO BERLIAN SAMJAYA ingin mengucapkan terima kasih atas kepercayaan Bapak/Ibu dalam melakukan pembelian kendaraan  *$kendaraan* di tempat kami.%0AMohon bantuannya dengan meluangkan sedikit waktu untuk mengisi survei digital yang sudah dikirim melalui *SMS MITSUBISHI* ✅.%0A%0A_Kami ingin mengingatkan bahwa, jika Bapak/Ibu merasa puas dengan pelayanan dan proses penjualan kami, mohon berikan nilai 9 atau 10 pada survey tersebut. Nilai ini sangat berarti bagi kami, *karena hanya nilai 9 dan 10 yang menunjukkan kepuasan dari pelanggan kami*._%0A%0ATerima kasih telah menjadi bagian dari perjalanan kami, dan kami senang dapat terus melayani Anda dengan lebih baik lagi. Semoga hari anda menyenangkan dan semoga sehat selalu!");
    } elseif ($via === 'bpkb') {
        $queryy = "UPDATE surveyupdate SET 
                    bpkb = 'WA $hari_ini'
                    WHERE id = $id
                    ";
        mysqli_query($conn, $queryy);
        header("Location: https://wa.me/62$nowa?text=$salam, Kami dari Mitsubishi Bintaro ingin dengan hormat mengingatkan Bapak/Ibu *$nama* bahwa BPKB untuk kendaraan *$kendaraan* dengan nomor rangka *$rangka* sudah dapat diambil. Kami sangat berharap Bapak/Ibu berkenan untuk mengambilnya di kantor kami pada waktu yang memungkinkan. Mohon maaf apabila pemberitahuan ini mengganggu kesibukan Bapak/Ibu, namun hal ini merupakan upaya kami untuk memberikan pelayanan terbaik kepada pelanggan yang kami.");
    } elseif ($via === 'bpkbspv') {
        $telpspv = $_GET['nomer'];
        $queryy = "UPDATE surveyupdate SET 
                    bpkb = 'WA SPV $hari_ini'
                    WHERE id = $id
                    ";
        mysqli_query($conn, $queryy);
        
        header("Location: https://wa.me/62$telpspv?text=$salam, Kami dari Mitsubishi Bintaro ingin mengingatkan Bapak/Ibu *$nama* bahwa BPKB untuk kendaraan *$kendaraan* dengan nomor rangka *$rangka* sudah bisa diambil. Kami berharap Anda dapat segera mengambilnya di kantor kami. Mohon maaf jika kami mengganggu kesibukan Anda, namun kami berupaya untuk memberikan pelayanan terbaik kepada Anda sebagai pelanggan kami.");
    } elseif ($via === 'tutor') {
        $queryfuwa = "INSERT INTO fu_wa VALUES (NULL, NULL, $id, '$rangka', 'TUTORIAL DIKIRIM', 'Whatsapp', '')";
        mysqli_query($conn, $queryfuwa);
        
        header("Location: https://wa.me/62$nowa?text=$salam, Bapak/Ibu *$nama* yang terhormat kami dari Mitsubishi Bintaro ingin mengucapkan terima kasih atas pembelian kendaraan *$kendaraan*,%0A%0AMohon Aktivasi Garansi kendaraan Bapak/Ibu supaya bisa melakukan Service Pertamanya dengan lancar, dengan langkah langkah berikut :%0A- Download Aplikasi My Mitsubishi Motors ID melalui link https://mitsubishimotorsid-mobileapp.com/mobile-ads%0A- Login/Daftar dengan Nomor Telepon atau Email *aktif dan bisa diakses*%0A- Tambahkan kendaraan dengan masukan *Nomor Rangka* dan *3 Angka Terakhir Nomor Mesin* yang kami kirimkan%0A- Klik *Aktifkan Garansi*%0A- Pastikan data Dokumen benar%0A- Klik Persetujuan Syarat dan Ketentuan%0A- Klik *Konfirmasi Penerimaan Kendaraan*%0A- Tanda Tangan Elektronik dengan benar%0A- Klik *Submit*%0A%0AProses Selesai");
    } else {
        header("Location: https://wa.me/62$nowa?text=$salam, Bapak/Ibu *$nama*,%0AKami sangat menghargai waktu anda!%0AKami PT DWINDO BERLIAN SAMJAYA ingin mengucapkan terima kasih atas kepercayaan Bapak/Ibu dalam melakukan pembelian kendaraan  *$kendaraan* di tempat kami.%0AMohon bantuannya dengan meluangkan sedikit waktu untuk mengisi survei digital yang sudah dikirim melalui *Aplikasi My Mitsubishi ID* ✅.%0A%0A_Kami ingin mengingatkan bahwa, jika Bapak/Ibu merasa puas dengan pelayanan dan proses penjualan kami, mohon berikan nilai 9 atau 10 pada survey tersebut. Nilai ini sangat berarti bagi kami, *karena hanya nilai 9 dan 10 yang menunjukkan kepuasan dari pelanggan kami*._%0A%0ATerima kasih telah menjadi bagian dari perjalanan kami, dan kami senang dapat terus melayani Anda dengan lebih baik lagi. Semoga hari anda menyenangkan dan semoga sehat selalu!");
    }
      

$besok = new DateTime('tomorrow');
$ada = $besok->format('Y-m-d');
$tomorrow = mysqli_query($conn, "SELECT tanggal FROM booking WHERE tanggal = '$ada'");
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Chat Whatsapp</title>
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
                    <li class="breadcrumb-item active">Whatsapp</li>
                  </ol>
                </div>
                <h4 class="page-title">Kirim Whatsapp</h4>
              </div>
            </div>
          </div>
          <!-- end page title -->





          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <p class="text-muted font-14">Form Untuk Mengirim Pesan Whatsapp ke Konsumen</p>

                  <!-- end nav-->
                  <div class="tab-content">
                    <form action="" method="POST">
                      <div class="tab-pane show active" id="select2-preview">
                        <div class="row">
                          <div class="col-lg-6">
                            <!-- Single Date Picker -->
                            <div class="mb-3">
                              <label for="nowa" class="form-label">No. Whatsapp</label>
                              <input type="text" name="nowa" id="nowa" class="form-control date" placeholder="Masukan No. Whatsapp" required>
                            </div>
                        </div>    
                        <div class="col-lg-6">
                            <div class="mb-3">
                              <label for="nama" class="form-label">Nama Customer</label>
                              <input type="text" name="nama" id="nama" class="form-control date" placeholder="Masukan Nama Customer" required>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="mb-3">
                              <label for="kendaraan" class="form-label">Kendaraan</label>
                              <input type="text" name="kendaraan" id="kendaraan" class="form-control date" placeholder="Masukan Kendaraan Customer" required>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="mb-3">
                              <label for="type" class="form-label">Type Follow Up</label>
                              <select name="type" id="type" class="form-select" required>
                                <option value="panjang">Panjang</option>
                                <option value="pendek">Pendek</option>
                              </select>
                            </div>
                        </div>
                          
                          
                          <div class="d-grid mb-0 text-center">
                            <button class="btn btn-success" name="chatwa" type="submit"><i class="mdi mdi-whatsapp"></i> Chat </button>
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
            </script> Â© CS Bintaro - punyaBarod.com
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

</body>

</html>