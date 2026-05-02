<?php
// Set timezone sesuai kebutuhan
date_default_timezone_set('Asia/Jakarta');

// Mendapatkan tanggal hari ini
$tanggal_hari_ini = date('d F Y', strtotime($_GET['date']));

if ($_GET['divisi'] === 'MMKSI') {
    $ttd = 'M. Munir';
    $ttdfull = 'd-none';
    $judul = ' MMKSI';
} elseif ($_GET['divisi'] === 'KTB') {
    $ttd = 'Jo Herman';
    $ttdfull = 'd-none';
    $judul = ' KTB';
} else {
    $ttd = 'M. Munir';
    $ttdfull = '';
    $judul = '';
}
?>

<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"><title>Absensi Kegiatan Dealer</title>
    <style type="text/css">
        // <uniquifier>: Use a uniquifier for the class name
        // <weight>: Use a value from 100 to 900
        
        * {
          font-family: "Noto Sans", sans-serif;
          font-weight: 100;
          font-style: normal;
        }
    
        .angka-pojok {
            padding-left: 1pt;
            text-indent: 0pt;
            line-height: 8pt;
            text-align: left;
        }
    </style>
  </head>
  <body>
    <div class="container text-center mt-3">
        <h3><strong>ABSENSI KEGIATAN DEALER<?=$judul?></strong></h3>
        <div class="row">
            <div class="col-4">
                <p><strong>Tanggal </strong>: <span class="text-decoration-underline"><?=$tanggal_hari_ini?></span></p>
            </div>
            <div class="col-4">
                <p><strong>Kegiatan </strong>: <span class="text-decoration-underline"><?=$_GET['kegiatan']?></span></p>
            </div>
            <div class="col-4">
                <p><strong>Materi </strong>: <span class="text-decoration-underline"><?=$_GET['materi']?></span></p>
            </div>
        </div>
        <table class="table table-bordered border-dark table-sm">
          <thead>
            <tr class="p-0 bg-info">
                <th class="px-0">#</th>
                <th class="px-4">NAMA</th>
                <th>JABATAN</th>
                <th class="px-0">KET</th>
                <th colspan="2">ABSENSI</th>
            </tr>
          </thead>
          <?php
            echo '<tbody>';
            for ($i = 1; $i <= 22; $i++) {
                echo '<tr class="p-0">';
                echo '<td class="px-0">' . $i . '</td>';
                echo '<td class="px-4"></td>';
                echo '<td></td>';
                echo '<td class="px-0"></td>';
                echo '<td rowspan="2"><p class="angka-pojok"><small>' . $i . '</small></p></td>';
                $i = $i + 1;
                echo '<td rowspan="2"><p class="angka-pojok"><small>' . $i . '</small></p></td>';
                echo '</tr>';
                echo '<tr class="p-0">';
                echo '<td class="px-0">' . ($i) . '</td>';
                echo '<td class="px-4"></td>';
                echo '<td></td>';
                echo '<td class="px-0"></td>';
                echo '</tr>';
            }
            echo '</tbody>';
            ?>
        </table>
        <div class="row text-start">
            <p class="mb-0 pr-8">Tangerang, <?=$tanggal_hari_ini?></p>
            <div class="col-6 mt-0 pt-0">
                <p class="mt-0 pt-0">Mengetahui,
                <br>
                <br>
                <br>
                <span class="text-decoration-underline"><?=$ttd?></span>
                <br>Branch Manager
                </p>
            </div>
            <div class="col-6 mt-0 pt-0 text-center <?=$ttdfull?>">
                <p class="mt-0 pt-0">Mengetahui,
                <br>
                <br>
                <br>
                <span class="text-decoration-underline">Jo Herman</span>
                <br>Branch Manager
                </p>
            </div>
        </div>
    </div>
    <br>
    <br>
    <div class="container text-center mt-5">
        <h3><strong>CATATAN KEGIATAN<?=$judul?></strong></h3>
        <div class="row">
            <div class="col-4">
                <p><strong>Tanggal </strong>: <span class="text-decoration-underline"><?=$tanggal_hari_ini?></span></p>
            </div>
            <div class="col-4">
                <p><strong>Kegiatan </strong>: <span class="text-decoration-underline"><?=$_GET['kegiatan']?></span></p>
            </div>
            <div class="col-4">
                <p><strong>Materi </strong>: <span class="text-decoration-underline"><?=$_GET['materi']?></span></p>
            </div>
        </div>
        <table class="table table-bordered border-dark table-sm">
          <thead>
            <tr class="p-0 bg-info">
                <th class="px-0">#</th>
                <th class="px-0">DIVISI</th>
                <th class="px-5">ISU / SARAN</th>
                <th class="px-5">SOLUSI / PUTUSAN</th>
            </tr>
          </thead>
          <tbody>
            <tbody>
            <?php for ($i = 1; $i <= 7; $i++): ?>
                <tr>
                    <td style="padding: 45px 10px;"><?= $i ?></td>
                    <td style="padding: 45px 10px;"></td>
                    <td style="padding: 45px 10px;"></td>
                    <td style="padding: 45px 10px;"></td>
                </tr>
            <?php endfor; ?>
            </tbody>
        </table>
        <div class="row text-start">
            <p class="mb-0 pr-8">Tangerang, <?=$tanggal_hari_ini?></p>
            <div class="col-6 mt-0 pt-0">
                <p class="mt-0 pt-0">Mengetahui,
                <br>
                <br>
                <br>
                <span class="text-decoration-underline"><?=$ttd?></span>
                <br>Branch Manager
                </p>
            </div>
            <div class="col-6 mt-0 pt-0 text-center <?=$ttdfull?>">
                <p class="mt-0 pt-0">Mengetahui,
                <br>
                <br>
                <br>
                <span class="text-decoration-underline">Jo Herman</span>
                <br>Branch Manager
                </p>
            </div>
        </div>
    </div>

    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    <script>
    // Mencetak halaman secara otomatis saat halaman dimuat
    window.onload = function() {
        window.print();
    }
    </script>
    
    <!--
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
    -->
  </body>
</html>