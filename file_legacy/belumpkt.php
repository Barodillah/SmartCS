<?php
require 'func.php';

if (isset($_GET['d'])) {
    $lebihdari = (int)$_GET['d']; // minimal hari
} else {
    $lebihdari = 3;
}

if (isset($_GET['m'])) {
    $maksimal = (int)$_GET['m']; // maksimal hari
} else {
    if ($lebihdari>=30) {
        $maksimal = 365;
    } else if ($lebihdari>=20) {
        $maksimal = 30;
    } else {
        $maksimal = 20;
    }
}

// WIB
date_default_timezone_set('Asia/Jakarta');

// Tentukan rentang tanggal
$minDate = date('Y-m-d', strtotime('-'.$lebihdari.' days')); 
$maxDate = date('Y-m-d', strtotime('-'.$maksimal.' days')); 

$query = "SELECT * FROM surveyupdate 
          WHERE status = 'PDI' 
            AND pdi_date < '$minDate'
            AND pdi_date >= '$maxDate'
          ORDER BY spv ASC, sales ASC";

$book = query($query);

// Mendapatkan waktu saat ini
$waktuSekarang = date('H:i');

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>reminder Belum WA/PKT</title>
</head>
<body>
<small>dari : <?=$lebihdari?>, sampai : <?=$maksimal?></small>
    <p id="textToCopy">
*REMINDER BELUM WA/PKT*<br>
<br>
Siang semua,<br>
<!--Mengingatkan saja kepada rekan-rekan, Sudahkah rekan-rekan menyelesaikan Warranty Activation dan Lapor PKT?<br>Jika belum, segera lakukan sekarang agar tidak terlewat.<br>_Dan jika sudah, tidak ada ruginya untuk mengecek kembali di Aplikasi SFID masing-masing untuk memastikan bahwa semuanya sudah selesai dengan baik._<br>-->
<br>
_Data yang belum menyelesaikan Warranty Activation dan Lapor PKT (Lebih dari <?=$lebihdari?> hari) Per hari ini jam <?=$waktuSekarang?>_<br>
<?php foreach ($book as $row) : ?>
<?php
$setelahpdi = floor((time() - strtotime($row["pdi_date"])) / (60 * 60 * 24));
if ($setelahpdi > 3) {
    $tebal = '*';
    $peringatan = '';
} else if ($setelahpdi > 5) {
    $tebal = '*';
    $peringatan = '*';
} else {
    $tebal = '_';
    $peringatan = '';
}
?>
- <?=$peringatan?><?=$row['rangka']?> <?=$row['nama']?><?=$peringatan?> <?=$tebal?>(<?=$setelahpdi?> hari)<?=$tebal?> - <?=$row['sales']?>, <?=$row['spv']?><br>
<?php endforeach; ?>
<br>
<!--Jangan ragu untuk menghubungi tim dukungan jika ada kendala dalam proses.<br>-->
<br>
_Yang belum menyelesaikan Warranty Activation dan Lapor PKT harap segera, *dan diharapkan konsumen langsung yang menandatangani Warranty Activation.* Supaya tidak terjadi sesuatu yang tidak dinginkan kedepannya_<br>
<br>
Semangat dan terima kasih! 💪
</p>

    <button onclick="copyText()">Salin Teks</button>

    <script>
        function copyText() {
            // Mendapatkan elemen dengan id "textToCopy"
            var textToCopy = document.getElementById("textToCopy");

            // Membuat rangkaian pemilihan dan seleksi teks
            var range = document.createRange();
            range.selectNode(textToCopy);

            // Menghapus isi dari Clipboard sebelumnya dan menyalin teks yang dipilih
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand("copy");

            // Memberi tahu pengguna bahwa teks telah disalin
            alert("Teks telah disalin");
        }
    </script>

</body>
</html>
