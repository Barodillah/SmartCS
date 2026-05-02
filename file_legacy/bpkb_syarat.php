<?php
require 'func.php';
$book = query("SELECT * FROM surveyupdate WHERE status = 'PDI' ORDER BY id DESC");

// Mengatur zona waktu ke Waktu Indonesia Barat (WIB)
date_default_timezone_set('Asia/Jakarta');

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

    <p id="textToCopy">
*SYARAT SYARAT PENGAMBILAN BPKB*<br>
`Waktu pengambilan Senin - Jumat, 09:00 s/d 15:00`<br>
<br>
PERORANGAN / PERUSAHAAN / CV / YAYASAN<br>
<br>
A. Diambil sendiri oleh pemilik<br>
1. Membawa KTP asli/SIM asli<br>
<br>
B. Diambil oleh kuasa dari pemilik<br>
1. Membawa KTP asli Pemilik BPKB ( pemberi kuasa)<br>
2. Membawa KTP asli Penerima Kuasa<br>
3. Membawa surat kuasa bermaterai yang telah ditandatangani oleh Pemilik BPKB dan penerima kuasanya<br>
<br>
C. Jika pemilik BPKB meninggal dunia<br>
1. Membawa surat kematian pemilik BPKB<br>
2. Membawa kartu keluarga pemilik BPKB<br>
3. Membawa surat kuasa dari seluruh ahli waris dan KTP asli ahli waris pemberi kuasa<br>
4. Membawa surat keterangan ahli waris<br>
5. Membawa KTP asli penerima kuasa<br>
<br>
D. Oleh Perusahaan/CV/Yayasan<br>
1. Membawa surat kuasa bermaterai dari Perusahaan ( diatas kop surat ) + Stempel Perusahaan/CV/Yayasan dan ditandatangani oleh pejabat berwenang<br>
2. Membawa copy KTP  pemberi kuasa dan penerima kuasa<br>
3. Membawa Stempel Perusahaan/CV/Yayasan<br>
<br>
Terima kasih atas kerjasama dan kepercayaan Anda sebagai pelanggan kami.<br>
<br>
Hormat kami,<br>
Mitsubishi Bintaro 🙏
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
