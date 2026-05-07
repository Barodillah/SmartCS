<?php
// Set Timezone Jakarta
date_default_timezone_set('Asia/Jakarta');

// Kredensial Database
define('LEGACY_DB_HOST', '153.92.15.23');
define('LEGACY_DB_USER', 'u444914729_barod');
define('LEGACY_DB_PASS', '');
define('LEGACY_DB_NAME', '');

// Inisialisasi Koneksi PDO
try {
    $pdo = new PDO("mysql:host=" . LEGACY_DB_HOST . ";dbname=" . LEGACY_DB_NAME, LEGACY_DB_USER, LEGACY_DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage());
}

// Handler untuk request AJAX (Update Status Datang/Cancel)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    header('Content-Type: application/json');
    $id = $_POST['id'] ?? 0;
    $action = $_POST['action'];

    if ($id && in_array($action, ['DATANG', 'CANCEL'])) {
        try {
            // Mulai transaksi database agar Update dan Insert saling terikat
            $pdo->beginTransaction();

            // 1. Ambil status lama (before)
            $stmtGet = $pdo->prepare("SELECT status FROM booking WHERE id = :id");
            $stmtGet->execute(['id' => $id]);
            $statusBefore = $stmtGet->fetchColumn();

            if ($statusBefore) {
                // 2. Update status di tabel booking
                $stmtUpdate = $pdo->prepare("UPDATE booking SET status = :status WHERE id = :id");
                $stmtUpdate->execute(['status' => $action, 'id' => $id]);

                // 3. Insert catatan log ke tabel booking_record
                // Kata kunci before dan after dibungkus backtick ` ` agar tidak bentrok dengan syntax SQL
                $stmtLog = $pdo->prepare("INSERT INTO booking_record (booking_id, user, status, `before`, `after`) VALUES (:booking_id, :user, :status, :before, :after)");
                $stmtLog->execute([
                    'booking_id' => $id,
                    'user' => 'Frontliner',
                    'status' => $action,
                    'before' => $statusBefore,
                    'after' => $action
                ]);
            }

            // Simpan semua perubahan
            $pdo->commit();
            echo json_encode(['success' => true]);

        } catch (PDOException $e) {
            // Batalkan semua perubahan jika terjadi error
            $pdo->rollBack();
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action or ID']);
    }
    exit;
}

// Ambil SEMUA data booking hari ini (Tanpa filter status di SQL)
$today = date('Y-m-d');
$stmt = $pdo->prepare("SELECT * FROM booking WHERE tanggal = :tanggal ORDER BY jam ASC");
$stmt->execute(['tanggal' => $today]);
$bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Booking Hari Ini</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        csdred: '#E60012',
                        csddark: '#1D1D1D',
                    }
                }
            }
        }
    </script>
    <style>
        /* Custom scrollbar untuk list */
        ::-webkit-scrollbar {
            width: 6px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: #1D1D1D;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #E60012;
        }
    </style>
</head>

<body class="bg-gray-50 text-csddark font-sans antialiased">

    <!-- Header -->
    <header class="bg-csddark text-white shadow-md sticky top-0 z-10">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 class="text-xl font-bold flex items-center gap-2">
                <span class="w-3 h-8 bg-csdred rounded-sm inline-block"></span>
                Antrian Hari Ini
            </h1>
            <div class="text-sm bg-csdred px-3 py-1 rounded-full font-semibold">
                <?= date('d M Y') ?>
            </div>
        </div>
    </header>

    <!-- Stats Cards Counter -->
    <div class="max-w-3xl mx-auto px-4 mt-6 grid grid-cols-4 gap-2 md:gap-4">
        <div
            class="bg-white p-3 rounded-xl shadow-sm border-b-4 border-gray-300 flex flex-col items-center justify-center">
            <p class="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-1">Total</p>
            <p class="text-xl md:text-3xl font-black text-csddark" id="stat-total">0</p>
        </div>
        <div
            class="bg-white p-3 rounded-xl shadow-sm border-b-4 border-csdred flex flex-col items-center justify-center">
            <p class="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-1">Booking</p>
            <p class="text-xl md:text-3xl font-black text-csddark" id="stat-booking">0</p>
        </div>
        <div
            class="bg-white p-3 rounded-xl shadow-sm border-b-4 border-green-500 flex flex-col items-center justify-center">
            <p class="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-1">Datang</p>
            <p class="text-xl md:text-3xl font-black text-csddark" id="stat-datang">0</p>
        </div>
        <div
            class="bg-white p-3 rounded-xl shadow-sm border-b-4 border-gray-600 flex flex-col items-center justify-center bg-gray-50">
            <p class="text-[10px] md:text-xs text-gray-500 font-bold uppercase mb-1">Cancel</p>
            <p class="text-xl md:text-3xl font-black text-gray-600" id="stat-cancel">0</p>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="max-w-3xl mx-auto px-4 mt-6 mb-2">
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
            <input type="text" id="searchInput" oninput="filterBookings()"
                class="block w-full p-3 pl-10 text-sm text-csddark border border-gray-300 rounded-lg bg-white focus:ring-csdred focus:border-csdred outline-none shadow-sm transition-all"
                placeholder="Cari Nopol, Nama, atau Kendaraan dari semua status...">
        </div>
    </div>

    <!-- Main Content (Container for JS Render) -->
    <main class="max-w-3xl mx-auto px-4 py-4" id="booking-container">
        <!-- List booking akan dirender oleh JavaScript di sini -->
    </main>

    <!-- Overlay Modals -->
    <div id="modal-overlay"
        class="fixed inset-0 bg-black bg-opacity-60 z-40 hidden flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">

        <!-- MODAL 1: Detail Data -->
        <div id="modal-detail"
            class="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden hidden transform transition-all">
            <div class="bg-csddark px-5 py-4 flex justify-between items-center text-white">
                <h3 class="font-bold text-lg">Detail Data</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg></button>
            </div>
            <div class="p-5 space-y-3 text-sm">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-gray-500 font-bold">Status:</span>
                    <span id="det-status-badge"
                        class="px-3 py-1 rounded-full text-xs font-bold text-white uppercase"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">Nama</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-nama"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">No. Telepon</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-telp"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">Kendaraan</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-kendaraan"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">No. Polisi</span>
                    <span class="col-span-2 font-semibold text-csdred" id="det-nopol"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">Jam</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-jam"></span>
                </div>
                <div class="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                    <span class="text-gray-500">Jenis Service</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-jenis"></span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <span class="text-gray-500">Keluhan</span>
                    <span class="col-span-2 font-semibold text-csddark" id="det-keluhan"></span>
                </div>
            </div>

            <!-- Tombol Action hanya muncul jika status masih BOOKING -->
            <div id="modal-action-buttons" class="p-4 bg-gray-50 border-t flex gap-3 hidden">
                <button onclick="promptCancel()"
                    class="flex-1 bg-white border border-gray-300 text-csddark font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors">
                    CANCEL
                </button>
                <button onclick="updateStatus('DATANG')"
                    class="flex-1 bg-csddark text-white font-bold py-2 px-4 rounded hover:bg-black transition-colors shadow-md">
                    DATANG
                </button>
            </div>
        </div>

        <!-- MODAL 2: Konfirmasi Cancel -->
        <div id="modal-confirm"
            class="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden hidden transform transition-all text-center p-6">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg class="h-8 w-8 text-csdred" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                    </path>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-csddark mb-2">Batalkan Booking?</h3>
            <p class="text-sm text-gray-500 mb-6">Tindakan ini akan mengubah status menjadi CANCEL dan Anda dapat
                memberitahu pelanggan.</p>
            <div class="flex gap-3">
                <button onclick="showModal('modal-detail')"
                    class="flex-1 bg-gray-100 text-csddark font-bold py-2 px-4 rounded hover:bg-gray-200">
                    Kembali
                </button>
                <button onclick="processCancel()"
                    class="flex-1 bg-csdred text-white font-bold py-2 px-4 rounded hover:bg-red-700 shadow-md">
                    Ya, Batalkan
                </button>
            </div>
        </div>

        <!-- MODAL 3: Success Cancel & WA -->
        <div id="modal-wa"
            class="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden hidden transform transition-all text-center p-6 border-t-4 border-csdred">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 class="text-lg font-bold text-csddark mb-2">Status Diperbarui</h3>
            <p class="text-sm text-gray-500 mb-6">Booking telah berhasil diubah menjadi CANCEL. Silakan kirimkan
                notifikasi ke pelanggan melalui WhatsApp.</p>
            <div class="flex flex-col gap-3">
                <a id="btn-wa" href="#" target="_blank" onclick="finishProcess()"
                    class="w-full bg-[#25D366] text-white font-bold py-3 px-4 rounded hover:bg-[#1ebd5a] flex items-center justify-center gap-2 shadow-md">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M12.031 0C5.39 0 0 5.39 0 12.032c0 2.128.552 4.195 1.6 6.009L.462 24l6.101-1.127c1.765.952 3.754 1.455 5.808 1.455h.005c6.64 0 12.03-5.39 12.03-12.031C24.406 5.391 19.016 0 12.031 0zm0 22.385c-1.802 0-3.568-.484-5.116-1.403l-.367-.217-3.805.702.715-3.712-.238-.38c-1.026-1.637-1.567-3.535-1.567-5.485 0-5.568 4.53-10.098 10.098-10.098s10.098 4.53 10.098 10.098c0 5.568-4.53 10.098-10.098 10.098zm5.539-7.561c-.303-.152-1.796-.887-2.073-.988-.278-.101-.481-.152-.684.152-.202.303-.784.988-.962 1.19-.177.202-.354.228-.658.076-2.038-.981-3.486-2.071-4.836-4.423-.177-.303-.019-.467.133-.619.135-.135.303-.354.455-.532.152-.177.202-.303.303-.506.101-.202.051-.38-.025-.532-.076-.152-.684-1.646-.936-2.253-.247-.594-.497-.514-.684-.523h-.583c-.202 0-.532.076-.81.38-.278.303-1.063 1.038-1.063 2.531s1.088 2.937 1.24 3.139c.152.202 2.14 3.264 5.186 4.58.723.312 1.288.498 1.73.638.727.23 1.389.197 1.912.119.587-.087 1.796-.734 2.05-1.443.253-.709.253-1.316.177-1.443-.076-.126-.278-.202-.582-.354z">
                        </path>
                    </svg>
                    Kirim WA Konfirmasi Cancel
                </a>
                <button onclick="finishProcess()"
                    class="w-full bg-gray-100 text-gray-500 font-bold py-3 px-4 rounded hover:bg-gray-200">
                    Selesai & Tutup
                </button>
            </div>
        </div>

    </div>

    <!-- Inject Data PHP ke Javascript -->
    <script>
        const bookings = <?= json_encode($bookings) ?>;
        let activeBooking = null;

        // Hitung & Update Counter Card Berdasarkan Total Data Keseluruhan
        function updateStats() {
            const total = bookings.length;
            const booking = bookings.filter(b => b.status === 'BOOKING').length;
            const datang = bookings.filter(b => b.status === 'DATANG').length;
            const cancel = bookings.filter(b => b.status === 'CANCEL').length;

            document.getElementById('stat-total').innerText = total;
            document.getElementById('stat-booking').innerText = booking;
            document.getElementById('stat-datang').innerText = datang;
            document.getElementById('stat-cancel').innerText = cancel;
        }

        // Template List Card
        function createListCard(row, borderClass, textOpacity = '') {
            return `
                <div onclick="openDetail(${row.id})" class="bg-white border-l-4 ${borderClass} ${textOpacity} p-4 rounded-r-lg shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group mb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="bg-csddark text-white text-xs font-bold px-2 py-1 rounded">${row.jam}</span>
                            <h3 class="font-bold text-lg">${row.nopol}</h3>
                        </div>
                        <p class="text-sm font-medium ${textOpacity ? 'text-gray-500' : 'text-gray-600'}">${row.nama} • ${row.kendaraan}</p>
                    </div>
                    <div class="text-gray-300 group-hover:text-csddark transition-colors flex flex-col items-end gap-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                </div>
            `;
        }

        // Render List Booking yang dibagi menjadi 3 Section
        function renderBookings(data) {
            const container = document.getElementById('booking-container');

            if (data.length === 0) {
                container.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        <p class="text-lg">Tidak ada data yang ditemukan.</p>
                    </div>
                `;
                return;
            }

            const listBooking = data.filter(b => b.status === 'BOOKING');
            const listCancel = data.filter(b => b.status === 'CANCEL');
            const listDatang = data.filter(b => b.status === 'DATANG');

            let html = '';

            // Section 1: BOOKING
            if (listBooking.length > 0) {
                html += `<div class="mb-8">
                            <h2 class="text-sm font-bold text-csdred mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-csdred"></span> Status: BOOKING
                            </h2>
                            <div>`;
                listBooking.forEach(row => html += createListCard(row, 'border-csdred'));
                html += `   </div>
                        </div>`;
            }

            // Section 2: CANCEL
            if (listCancel.length > 0) {
                html += `<div class="mb-8">
                            <h2 class="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-gray-500"></span> Status: CANCEL
                            </h2>
                            <div class="opacity-80">`;
                listCancel.forEach(row => html += createListCard(row, 'border-gray-500 bg-gray-50', 'text-gray-400'));
                html += `   </div>
                        </div>`;
            }

            // Section 3: DATANG
            if (listDatang.length > 0) {
                html += `<div class="mb-8">
                            <h2 class="text-sm font-bold text-green-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-green-500"></span> Status: DATANG
                            </h2>
                            <div>`;
                listDatang.forEach(row => html += createListCard(row, 'border-green-500'));
                html += `   </div>
                        </div>`;
            }

            container.innerHTML = html;
        }

        // Fungsi Filter Realtime (mencari ke semua status)
        function filterBookings() {
            const query = document.getElementById('searchInput').value.toLowerCase();

            const filteredData = bookings.filter(b =>
                b.nopol.toLowerCase().includes(query) ||
                b.nama.toLowerCase().includes(query) ||
                b.kendaraan.toLowerCase().includes(query)
            );

            renderBookings(filteredData);
        }

        // Inisialisasi awal saat halaman diload
        document.addEventListener('DOMContentLoaded', () => {
            updateStats();
            renderBookings(bookings);
        });

        // ----------------------------------------------------
        // LOGIC MODAL & UPDATE STATUS
        // ----------------------------------------------------
        function formatPhoneForWA(phone) {
            if (phone.startsWith('0')) {
                return '62' + phone.substring(1);
            }
            return phone;
        }

        function openDetail(id) {
            activeBooking = bookings.find(b => b.id == id);
            if (!activeBooking) return;

            // Render Teks & Badge Status
            const badge = document.getElementById('det-status-badge');
            badge.innerText = activeBooking.status;
            badge.className = 'px-3 py-1 rounded-full text-xs font-bold text-white uppercase ';

            if (activeBooking.status === 'BOOKING') badge.className += 'bg-csdred';
            else if (activeBooking.status === 'DATANG') badge.className += 'bg-green-500';
            else badge.className += 'bg-gray-500';

            document.getElementById('det-nama').innerText = activeBooking.nama;
            document.getElementById('det-telp').innerText = activeBooking.telp;
            document.getElementById('det-kendaraan').innerText = activeBooking.kendaraan;
            document.getElementById('det-nopol').innerText = activeBooking.nopol;
            document.getElementById('det-jam').innerText = activeBooking.jam;
            document.getElementById('det-jenis').innerText = activeBooking.jenis;
            document.getElementById('det-keluhan').innerText = activeBooking.keluhan;

            // Menampilkan atau Menyembunyikan tombol action
            const actionButtons = document.getElementById('modal-action-buttons');
            if (activeBooking.status === 'BOOKING') {
                actionButtons.classList.remove('hidden');
                actionButtons.classList.add('flex');
            } else {
                actionButtons.classList.add('hidden');
                actionButtons.classList.remove('flex');
            }

            showModal('modal-detail');
        }

        function promptCancel() {
            showModal('modal-confirm');
        }

        async function updateStatus(statusType) {
            if (!activeBooking) return;

            const formData = new FormData();
            formData.append('action', statusType);
            formData.append('id', activeBooking.id);

            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    window.location.reload();
                } else {
                    alert('Gagal mengupdate data: ' + result.message);
                }
            } catch (error) {
                alert('Terjadi kesalahan jaringan.');
            }
        }

        async function processCancel() {
            if (!activeBooking) return;

            const formData = new FormData();
            formData.append('action', 'CANCEL');
            formData.append('id', activeBooking.id);

            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    prepareWaButton();
                    showModal('modal-wa');
                } else {
                    alert('Gagal mengupdate data: ' + result.message);
                }
            } catch (error) {
                alert('Terjadi kesalahan jaringan.');
            }
        }

        function prepareWaButton() {
            const text = `Halo Kak ${activeBooking.nama},\n\nMohon maaf, jadwal Booking Service untuk kendaraan *${activeBooking.kendaraan}* dengan Nopol *${activeBooking.nopol}* pada jam *${activeBooking.jam}* telah kami *CANCEL / BATALKAN*.\n\nJika ingin melakukan booking ulang, silakan klik link berikut:\nhttps://booking.csdwindo.com\n\nApabila ada pertanyaan lebih lanjut, Kakak bisa tanya ke *DINA* (Virtual Assistant Kami) di:\nhttp://csdwindo.com\n\nTerima kasih 🙏`;

            const phone = formatPhoneForWA(activeBooking.telp);
            const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

            document.getElementById('btn-wa').href = waLink;
        }

        function finishProcess() {
            window.location.reload();
        }

        function showModal(modalId) {
            document.getElementById('modal-overlay').classList.remove('hidden');
            ['modal-detail', 'modal-confirm', 'modal-wa'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            document.getElementById(modalId).classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modal-overlay').classList.add('hidden');
            ['modal-detail', 'modal-confirm', 'modal-wa'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            activeBooking = null;
        }

        document.getElementById('modal-overlay').addEventListener('click', function (e) {
            if (e.target === this) {
                if (!document.getElementById('modal-wa').classList.contains('hidden')) {
                    return;
                }
                closeModal();
            }
        });
    </script>
</body>

</html>