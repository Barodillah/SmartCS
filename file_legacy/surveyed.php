<?php
require 'func.php';

// Ambil parameter bulan dari URL jika ada
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : date('Y-m');

// Pecah menjadi tahun dan bulan
list($tahun, $bln) = explode('-', $bulan);

// Buat tanggal awal dan akhir dari bulan yang dimaksud
$tanggal_awal = date('Y-m-d', strtotime("$tahun-$bln-01"));
$tanggal_akhir = date('Y-m-t', strtotime("$tahun-$bln-01"));


?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surveyed Review</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container">
    <div class="row my-3">
        <div class="col-lg-4">
            <form action="" method="GET">
            <div class="input-group"> 
                <input type="month" name="bulan" id="example-fileinput" class="form-control" required>
                <button type="submit" class="input-group-text bg-primary border-primary text-white">
                    cek
                </button>
            </div>
            </form>
        </div>
        <div class="col-lg-4">
            <form action="" method="POST" enctype="multipart/form-data">
            <div class="input-group"> 
                <input type="file" name="excel" id="example-fileinput" class="form-control" required>
                <button type="submit" name="import" class="input-group-text bg-primary border-primary text-white">
                    import
                </button>
            </div>
            </form>
        </div>
        <div class="col-lg-4">
            <?php
            if (isset($_POST["import"])) {
            // var_dump($_FILES);
            // var_dump($_POST);
            // die;
                    
                    $namaName = $_FILES['excel']['name'];
                    $tmpName = $_FILES['excel']['tmp_name'];
                    $fileerror = $_FILES['excel']['error'];
                    
                    if ($fileerror === 4) {
                        echo "<script>alert('Pilih file yang diupload');</script>";
                        return false;
                    }
                    
                    $ekstensii = explode('.', $namaName);
                    $ekstensi = end($ekstensii);
                    $namaasli = $ekstensii[0];
                    
                    $timestamp = time();
                    $addnamefile = date("mdHis", $timestamp);
                    
                    $namaExcel = 'surveyed'.$addnamefile.'.'.$ekstensi;
                    
                    
                    $allFile = '_excel/'.$namaExcel;
                    
                    move_uploaded_file($tmpName, $allFile);
                    
                    error_reporting(0);
                    ini_set('display_errors', 0);
                    
                    require "excelReader/excel_reader2.php";
                    require "excelReader/SpreadsheetReader.php";
                    
                    $reader = new SpreadsheetReader($allFile);
                    // var_dump($reader);
                    // die;
                    foreach($reader as $key => $rows) {
                        $exrangka = $rows[1];
                        $experiod = $rows[0];
                        $exstatus = $rows[2];
                        
                        $cust = query("SELECT * FROM surveyupdate WHERE rangka = '$exrangka'")[0];
                        $cust_id = $cust['id'];
                        
                        $cekrangka = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM surveyed WHERE cust_id = $cust_id"));
                        
                        if ($cekrangka === 0) {
                            $queryexcel = "INSERT INTO surveyed VALUES (NULL, '$experiod', $cust_id, '$exstatus')";
                            mysqli_query($conn, $queryexcel);
                        } else {
                            
                        }
                        
                    }
                    if (mysqli_affected_rows($conn) > 0) {
                        header("Location: surveyed.php?alert=addsuccess");
                    }
                }
            ?>
        </div>
    </div>
    <div class="my-2">
        <?php
        $hasilsurveyed = query("SELECT * FROM surveyed WHERE periode BETWEEN '$tanggal_awal' AND '$tanggal_akhir'");
        ?>
        
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Periode</th>
                    <th>Nama</th>
                    <th>Rangka</th>
                    <th>Sales</th>
                    <th>SPV</th>
                    <th>Status</th>
                    <th>NPS</th>
                    <th>Note</th>
                </tr>
            </thead>
            <tbody>
                <?php $no = 1; ?>
                <?php foreach ($hasilsurveyed as $hs) : ?>
                    <?php
                    $id_cust = $hs['cust_id'];
                    $customer = query("SELECT * FROM surveyupdate WHERE id = $id_cust")[0];
        
                    // Format periode menjadi Bulan Tahun (misal: Mei 2025)
                    $periode = date('F Y', strtotime($hs['periode']));
                    ?>
                    <tr>
                        <td><?= htmlspecialchars($customer['id']); ?></td>
                        <td><?= $periode; ?></td>
                        <td><?= htmlspecialchars($customer['nama']); ?></td>
                        <td><?= htmlspecialchars($customer['rangka']); ?></td>
                        <td><?= htmlspecialchars($customer['sales']); ?></td>
                        <td><?= htmlspecialchars($customer['spv']); ?></td>
                        <td><?= htmlspecialchars($hs['status']); ?></td>
                        <?php
                            $hasilnps = query("SELECT * FROM surveyhasil WHERE cust_id = $id_cust")[0];
                            $catatanya = $hasilnps['note'];
                            $nilai = $hasilnps['nilai'];
                            
                            if (isset($hasilnps) AND $hs['status'] === 'Unsurveyed') {
                                $queryy = "UPDATE surveyed SET 
                                            status = 'Surveyed'
                                            WHERE cust_id = $id_cust
                                            ";
                            
                                mysqli_query($conn, $queryy);
                            }
                        ?>
                        <td><?=$nilai?></td>
                        <td><?=$catatanya?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

    </div>
    <?php
    // Ambil semua data dari tabel surveyed
    $dataSurveyed = query("SELECT * FROM surveyed WHERE periode BETWEEN '$tanggal_awal' AND '$tanggal_akhir'");
    
    // Inisialisasi array untuk rekap per sales
    $rekapSales = [];
    
    foreach ($dataSurveyed as $row) {
        $id_cust = $row['cust_id'];
        $customer = query("SELECT * FROM surveyupdate WHERE id = $id_cust")[0];
        $sales = $customer['sales'];
    
        if (!isset($rekapSales[$sales])) {
            $rekapSales[$sales] = [
                'total' => 0,
                'surveyed' => 0,
                'unsurveyed' => 0,
                'promotor' => 0,
                'passiver' => 0,
                'detraktor' => 0
            ];
        }
    
        $rekapSales[$sales]['total']++;
    
        if (strtolower($row['status']) === 'surveyed') {
            $rekapSales[$sales]['surveyed']++;
    
            // Cek nilai NPS jika status surveyed
            $hasilnps = query("SELECT * FROM surveyhasil WHERE cust_id = $id_cust");
            if (!empty($hasilnps)) {
                $nilai = $hasilnps[0]['nilai'];
                if ($nilai >= 9 && $nilai <= 10) {
                    $rekapSales[$sales]['promotor']++;
                } elseif ($nilai >= 7 && $nilai <= 8) {
                    $rekapSales[$sales]['passiver']++;
                } elseif ($nilai >= 0 && $nilai <= 6) {
                    $rekapSales[$sales]['detraktor']++;
                }
            }
        } else {
            $rekapSales[$sales]['unsurveyed']++;
        }
    }
    
    // Hitung rasio, NPS, dan skor gabungan
    $ranking = [];
    
    foreach ($rekapSales as $sales => $data) {
        if ($data['total'] < 2) continue;
    
        $ratio = $data['total'] > 0 ? ($data['surveyed'] / $data['total']) * 100 : 0;
    
        $promotor = $data['promotor'];
        $passiver = $data['passiver'];
        $detraktor = $data['detraktor'];
        
        $totalnps = $promotor+$passiver+$detraktor;
    
        $promotorPct = $data['surveyed'] > 0 ? ($promotor / $totalnps) * 100 : 0;
        $passiverPct = $data['surveyed'] > 0 ? ($passiver / $totalnps) * 100 : 0;
        $detraktorPct = $data['surveyed'] > 0 ? ($detraktor / $totalnps) * 100 : 0;
        $nps = $promotorPct - $detraktorPct;
    
        // Normalisasi NPS ke skala 0–100
        $nps_normal = ($nps + 100) / 2;
    
        // Hitung skor berdasarkan kombinasi rasio dan NPS
        $skor = ($ratio * 0.5) + ($nps_normal * 0.5);
    
        $ranking[] = [
            'sales' => $sales,
            'total' => $data['total'],
            'surveyed' => $data['surveyed'],
            'unsurveyed' => $data['unsurveyed'],
            'ratio' => round($ratio, 2),
            'skor' => round($skor, 2),
            'promotor' => $promotor,
            'passiver' => $passiver,
            'detraktor' => $detraktor,
            'promotor_pct' => round($promotorPct, 2),
            'passiver_pct' => round($passiverPct, 2),
            'detraktor_pct' => round($detraktorPct, 2),
            'nps' => round($nps, 2)
        ];
    }
    
    // Urutkan berdasarkan skor tertinggi
    usort($ranking, function($a, $b) {
        return $b['skor'] <=> $a['skor'];
    });
    ?>

    
    <div class="card" style="margin-top: 20px;">
        <div class="card-body">
            <h4>Ranking Survey Sales (Min. 2 Konsumen)</h4>
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Skor</th>
                        <th>Sales</th>
                        <th>Jumlah Konsumen</th>
                        <th>Tersurvey</th>
                        <th>Tidak Tersurvey</th>
                        <th>Ratio (%)</th>
                        <th style="background-color: #4CAF50; color: white;">Promotor</th>
                        <th style="background-color: #FFEB3B; color: black;">Passiver</th>
                        <th style="background-color: #F44336; color: white;">Detraktor</th>
                        <th style="background-color: #4CAF50; color: white;">Promotor (%)</th>
                        <th style="background-color: #FFEB3B; color: black;">Passiver (%)</th>
                        <th style="background-color: #F44336; color: white;">Detraktor (%)</th>
                        <th>NPS (%)</th> 
                    </tr>
                </thead>
                <tbody>
                    <?php $no = 1; ?>
                    <?php foreach ($ranking as $row): ?>
                        <tr>
                            <td><?= $no++; ?></td>
                            <td><?= $row['skor']; ?></td>
                            <td><?= htmlspecialchars($row['sales']); ?></td>
                            <td><?= $row['total']; ?></td>
                            <td><?= $row['surveyed']; ?></td>
                            <td><?= $row['unsurveyed']; ?></td>
                            <td><?= $row['ratio']; ?>%</td>
                            <td><?= $row['promotor']; ?></td>
                            <td><?= $row['passiver']; ?></td>
                            <td><?= $row['detraktor']; ?></td>
                            <td><?= $row['promotor_pct']; ?>%</td>
                            <td><?= $row['passiver_pct']; ?>%</td>
                            <td><?= $row['detraktor_pct']; ?>%</td>
                            <td><?= $row['nps']; ?>%</td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    
    <?php
    $ranking = [];
    $nonQualified = [];
    
    foreach ($rekapSales as $sales => $data) {
        $ratio = $data['total'] > 0 ? ($data['surveyed'] / $data['total']) * 100 : 0;
    
        $promotor = $data['promotor'];
        $passiver = $data['passiver'];
        $detraktor = $data['detraktor'];
    
        $promotorPct = $data['surveyed'] > 0 ? ($promotor / $data['surveyed']) * 100 : 0;
        $passiverPct = $data['surveyed'] > 0 ? ($passiver / $data['surveyed']) * 100 : 0;
        $detraktorPct = $data['surveyed'] > 0 ? ($detraktor / $data['surveyed']) * 100 : 0;
        $nps = $promotorPct - $detraktorPct;
        $nps_normal = ($nps + 100) / 2;
        $skor = ($ratio * 0.5) + ($nps_normal * 0.5);
    
        $rowData = [
            'sales' => $sales,
            'total' => $data['total'],
            'surveyed' => $data['surveyed'],
            'unsurveyed' => $data['unsurveyed'],
            'ratio' => round($ratio, 2),
            'skor' => round($skor, 2),
            'promotor' => $promotor,
            'passiver' => $passiver,
            'detraktor' => $detraktor,
            'promotor_pct' => round($promotorPct, 2),
            'passiver_pct' => round($passiverPct, 2),
            'detraktor_pct' => round($detraktorPct, 2),
            'nps' => round($nps, 2)
        ];
    
        if ($data['total'] < 2) {
            $nonQualified[] = $rowData;
        } else {
            $ranking[] = $rowData;
        }
    }
    
    usort($ranking, function($a, $b) {
        return $b['skor'] <=> $a['skor'];
    });

    ?>
    <div class="card my-4" style="margin-top: 20px;">
        <div class="card-body">
            <h4>Sales dengan Kurang dari 2 Konsumen</h4>
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Sales</th>
                        <th>Jumlah Konsumen</th>
                        <th>Tersurvey</th>
                        <th>Tidak Tersurvey</th>
                        <th>Ratio (%)</th>
                        <th>Skor</th>
                        <th style="background-color: #4CAF50; color: white;">Promotor</th>
                        <th style="background-color: #FFEB3B; color: black;">Passiver</th>
                        <th style="background-color: #F44336; color: white;">Detraktor</th>
                        <th style="background-color: #4CAF50; color: white;">Promotor (%)</th>
                        <th style="background-color: #FFEB3B; color: black;">Passiver (%)</th>
                        <th style="background-color: #F44336; color: white;">Detraktor (%)</th>
                        <th>NPS (%)</th> 
                    </tr>
                </thead>
                <tbody>
                    <?php $no = 1; ?>
                    <?php foreach ($nonQualified as $row): ?>
                        <?php if ($row['surveyed'] != 1): ?>
                            <tr>
                                <td><?= $no++; ?></td>
                                <td><?= htmlspecialchars($row['sales']); ?></td>
                                <td><?= $row['total']; ?></td>
                                <td><?= $row['surveyed']; ?></td>
                                <td><?= $row['unsurveyed']; ?></td>
                                <td><?= $row['ratio']; ?>%</td>
                                <td><?= $row['skor']; ?></td>
                                <td><?= $row['promotor']; ?></td>
                                <td><?= $row['passiver']; ?></td>
                                <td><?= $row['detraktor']; ?></td>
                                <td><?= $row['promotor_pct']; ?>%</td>
                                <td><?= $row['passiver_pct']; ?>%</td>
                                <td><?= $row['detraktor_pct']; ?>%</td>
                                <td><?= $row['nps']; ?>%</td>
                            </tr>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
    
    
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
