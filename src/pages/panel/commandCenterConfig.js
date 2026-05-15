import { Calendar, Users, Target, AlertOctagon, FileText, ClipboardList, Layers } from 'lucide-react';

export const CATEGORIES = [
    { id: 'booking', label: 'Booking Service', icon: Calendar, color: 'from-blue-500 to-indigo-600', desc: 'Trend booking, kapasitas stall, utilisasi & heatmap kedatangan', apis: ['data_booking', 'analisis_booking'] },
    { id: 'konsumen', label: 'Database Konsumen', icon: Users, color: 'from-emerald-500 to-green-600', desc: 'Profil pelanggan, distribusi prioritas, data pajak STNK', apis: ['data_konsumen'] },
    { id: 'potensi', label: 'Potensi Service', icon: Target, color: 'from-orange-500 to-amber-600', desc: 'Lead potensial, due service, clean data analysis', apis: ['potensi_booking'] },
    { id: 'dissatisfaction', label: 'Dissatisfaction', icon: AlertOctagon, color: 'from-red-500 to-rose-600', desc: 'Keluhan pelanggan, criteria, follow-up tracking', apis: ['data_dissatisfaction'] },
    { id: 'sales_survey', label: 'Sales Survey', icon: FileText, color: 'from-purple-500 to-violet-600', desc: 'Kepuasan pembelian, estimasi NPS, feedback konsumen', apis: ['sales_survey'] },
    { id: 'survey_ktb', label: 'Survey KTB', icon: ClipboardList, color: 'from-cyan-500 to-teal-600', desc: 'Survey warranty KTB, follow-up status, umur data', apis: ['warranty_ktb'] },
    { id: 'semua', label: 'Semua (Comprehensive)', icon: Layers, color: 'from-gray-700 to-gray-900', desc: 'Full cross-data analysis dari semua sumber', apis: ['all'] },
];

export const SUB_PARAMS = {
    booking: [
        { key: 'timeRange', label: 'Rentang Waktu', type: 'select', options: [{ v: 7, l: '7 Hari' }, { v: 14, l: '14 Hari' }, { v: 30, l: '30 Hari' }, { v: 60, l: '60 Hari' }], default: 14 },
        { key: 'bulan', label: 'Bulan Analisis Kapasitas', type: 'month', default: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; } },
    ],
    konsumen: [
        { key: 'filterPrioritas', label: 'Filter Prioritas', type: 'select', options: [{ v: 'all', l: 'Semua' }, { v: 'biasa', l: 'Biasa' }, { v: 'loyal', l: 'Loyal' }, { v: 'prioritas', l: 'Prioritas' }], default: 'all' },
    ],
    potensi: [
        { key: 'sumber', label: 'Sumber Data', type: 'select', options: [{ v: 'all', l: 'Semua' }, { v: 'pkt_3_6', l: 'PKT 3-6 Bulan' }, { v: 'pkt_6_12', l: 'PKT 6-12 Bulan' }, { v: 'due', l: 'Due Service' }], default: 'all' },
    ],
    dissatisfaction: [
        { key: 'bulan', label: 'Bulan', type: 'month', default: () => new Date().toISOString().slice(0, 7) },
        { key: 'filterStatus', label: 'Filter Status', type: 'select', options: [{ v: 'all', l: 'Semua' }, { v: 'new', l: 'Belum Selesai' }], default: 'all' },
    ],
    sales_survey: [
        { key: 'timeRange', label: 'Rentang Waktu', type: 'select', options: [{ v: 7, l: '7 Hari' }, { v: 14, l: '14 Hari' }, { v: 30, l: '30 Hari' }, { v: 60, l: '60 Hari' }], default: 30 },
        { key: 'filterSurvey', label: 'Filter', type: 'select', options: [{ v: 'all', l: 'Semua' }, { v: 'belum', l: 'Belum Follow Up' }, { v: 'puas', l: 'PUAS' }, { v: 'tidak_puas', l: 'TIDAK PUAS' }], default: 'all' },
    ],
    survey_ktb: [
        { key: 'bulan', label: 'Bulan', type: 'month', default: () => new Date().toISOString().slice(0, 7) },
    ],
    semua: [
        { key: 'timeRange', label: 'Rentang Waktu', type: 'select', options: [{ v: 7, l: '7 Hari' }, { v: 14, l: '14 Hari' }, { v: 30, l: '30 Hari' }], default: 14 },
    ],
};

const BASE = 'https://csdwindo.com/api/panel';

export const fetchBookingData = async (params) => {
    const days = params.timeRange || 14;
    const promises = []; const dayLabels = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        dayLabels.push(ds);
        promises.push(fetch(`${BASE}/data_booking.php?date=${ds}`).then(r => r.json()).catch(() => ({ status: false })));
    }
    const results = await Promise.all(promises);
    const bookingCtx = dayLabels.map((date, i) => {
        const r = results[i]; let b = 0, dt = 0, w = 0, c = 0, t = 0;
        if (r?.status && r.data) { t = r.data.length; r.data.forEach(x => { const s = (x.status || '').toUpperCase(); if (s === 'BOOKING') b++; else if (s === 'DATANG') dt++; else if (s === 'WALK IN' || s === 'WALKIN') w++; else if (s === 'CANCEL' || s === 'BATAL') c++; }); }
        return `${date}: Total=${t}, Booking(NoShow)=${b}, Datang=${dt}, WalkIn=${w}, Cancel=${c}`;
    }).join('\n');

    // Analisis kapasitas
    const bulan = params.bulan || '';
    const [yr, mn] = bulan ? bulan.split('-') : [new Date().getFullYear().toString(), String(new Date().getMonth()).padStart(2, '0')];
    let capacityCtx = '';
    try {
        const capRes = await fetch(`${BASE}/analisis_booking.php?tahun=${yr}&bulan=${mn}`);
        const capJson = await capRes.json();
        if (capJson.status && capJson.data) {
            capacityCtx = '\n\n=== ANALISIS KAPASITAS & UTILISASI ===\n';
            capacityCtx += 'Tanggal | Booking | Datang | WalkIn | Cancel | TotalEntry | Kapasitas(32)\n';
            capJson.data.forEach(d => {
                const total = (parseInt(d.datang) || 0) + (parseInt(d.walk_in) || 0);
                capacityCtx += `${d.tanggal} | ${d.booking} | ${d.datang} | ${d.walk_in} | ${d.cancel} | ${total} | 32\n`;
            });
        }
    } catch (e) { console.error(e); }

    let heatmapCtx = '';
    try {
        const hRes = await fetch(`${BASE}/analisis_booking.php?tahun=${yr}&bulan=${mn}&action=heatmap&type=WALK IN`);
        const hJson = await hRes.json();
        if (hJson.status && hJson.data?.length > 0) {
            heatmapCtx = '\n\n=== HEATMAP WALK IN (per jam per hari) ===\n';
            heatmapCtx += 'Jam | ' + Object.keys(hJson.data[0]).filter(k => k !== 'jam').join(' | ') + '\n';
            hJson.data.forEach(row => {
                heatmapCtx += `${row.jam} | ` + Object.entries(row).filter(([k]) => k !== 'jam').map(([, v]) => v).join(' | ') + '\n';
            });
        }
    } catch (e) { console.error(e); }

    return `=== TREND BOOKING (${days} HARI) ===\nKeterangan: BOOKING=sudah booking tapi TIDAK DATANG tanpa konfirmasi (No-Show), DATANG=booking dan datang, WALK IN=datang tanpa booking, CANCEL=dibatalkan\n${bookingCtx}${capacityCtx}${heatmapCtx}`;
};

export const fetchKonsumenData = async (params) => {
    try {
        const [statsRes, dataRes] = await Promise.all([
            fetch(`${BASE}/konsumen_stats.php`).then(r => r.json()).catch(() => null),
            fetch(`${BASE}/data_konsumen.php?page=1&limit=100&filter=${params.filterPrioritas || 'all'}`).then(r => r.json()).catch(() => null),
        ]);
        let ctx = '=== STATISTIK KONSUMEN ===\n';
        if (statsRes) ctx += `Empty Pajak: ${statsRes.empty_pajak || 0}, Biasa: ${statsRes.priority?.biasa || 0}, Loyal: ${statsRes.priority?.loyal || 0}, Prioritas: ${statsRes.priority?.prioritas || 0}\n`;
        if (dataRes?.status && dataRes.data) {
            ctx += `\n=== SAMPLE DATA (${dataRes.data.length} konsumen) ===\n`;
            dataRes.data.slice(0, 60).forEach(k => { ctx += `${k.nama} | ${k.nopol} | ${k.kendaraan} | Prioritas:${k.prioritas || 0} | Pajak1Th:${k.one_year || '-'}\n`; });
        }
        return ctx;
    } catch (e) { return '(Gagal mengambil data konsumen)'; }
};

export const fetchPotensiData = async (params) => {
    try {
        const res = await fetch(`${BASE}/potensi_booking.php`);
        const json = await res.json();
        if (!json.status) return '(Tidak ada data potensi)';
        let ctx = '=== POTENSI SERVICE ===\n';
        const tabs = ['pkt_3_6', 'pkt_6_12', 'due'];
        const tabLabels = { pkt_3_6: 'PKT 3-6 Bulan', pkt_6_12: 'PKT 6-12 Bulan', due: 'Due Service' };
        const filter = params.sumber || 'all';
        const activeKeys = filter === 'all' ? tabs : [filter];
        activeKeys.forEach(tab => {
            const items = json.data?.[tab]?.all || json.data?.[tab] || [];
            if (Array.isArray(items) && items.length > 0) {
                ctx += `\n--- ${tabLabels[tab] || tab} (${items.length} data) ---\n`;
                items.slice(0, 40).forEach(it => { ctx += `${it.name || it.nama || '-'} | ${it.model || it.kendaraan || '-'} | ${it.plate || it.nopol || '-'} | KM:${it.km || '-'} | LastSvc:${it.last_service || '-'}\n`; });
            }
        });
        return ctx || '(Tidak ada data potensi)';
    } catch (e) { return '(Gagal mengambil data potensi)'; }
};

export const fetchDissatisfactionData = async (params) => {
    try {
        const bulan = params.bulan || new Date().toISOString().slice(0, 7);
        let url = `${BASE}/data_dissatisfaction.php?month=${bulan}`;
        if (params.filterStatus === 'new') url = `${BASE}/data_dissatisfaction.php?filter_new=true`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.status || !json.data) return '(Tidak ada data dissatisfaction)';
        let ctx = `=== DATA DISSATISFACTION (${bulan}) ===\nTotal: ${json.data.length}, Belum Selesai: ${json.new_count || 0}\n\n`;
        const criteriaMap = { '1': 'Bad Comment', '2': 'Low Score', '3': 'Bad Comment & Low Score' };
        json.data.slice(0, 50).forEach(d => {
            ctx += `${d.nama} | SA:${d.sa} | ${criteriaMap[d.criteria] || d.criteria} | Atribut:${d.atribut} | Status:${d.status || 'NEW'} | Keluhan:"${d.keluhan || '-'}"\n`;
        });
        return ctx;
    } catch (e) { return '(Gagal mengambil data dissatisfaction)'; }
};

export const fetchSalesSurveyData = async (params) => {
    try {
        const res = await fetch(`${BASE}/sales_survey.php?action=list`);
        const json = await res.json();
        if (!json.status || !json.data) return '(Tidak ada data survey)';
        const days = params.timeRange || 30;
        const ago = new Date(); ago.setDate(ago.getDate() - days);
        const cats = ['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN', 'SARAN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'PERJANJIAN', 'SALAH SAMBUNG'];
        const counts = {}; cats.forEach(c => counts[c] = 0);
        let items = json.data;
        if (params.filterSurvey === 'puas') items = items.filter(x => x.status === 'PUAS');
        else if (params.filterSurvey === 'tidak_puas') items = items.filter(x => ['TIDAK PUAS', 'KOMPLEN'].includes(x.status));
        else if (params.filterSurvey === 'belum') items = items.filter(x => ['PKT', 'PERLU FOLLOW UP', 'SURVEY_WA'].includes(x.status));
        items.forEach(x => { const w = x.wa_date ? new Date(x.wa_date) : null; if (w && w >= ago && counts[(x.status || '').toUpperCase()] !== undefined) counts[(x.status || '').toUpperCase()]++; });
        let ctx = `=== DISTRIBUSI SALES SURVEY (${days} HARI) ===\n`;
        ctx += Object.entries(counts).map(([s, c]) => `${s}: ${c}`).join('\n') + '\n';
        const notes = items.filter(x => x.note?.trim()).sort((a, b) => new Date(b.wa_date || b.time || 0) - new Date(a.wa_date || a.time || 0)).slice(0, 30);
        if (notes.length > 0) {
            ctx += `\n=== FEEDBACK KONSUMEN (${notes.length}) ===\n`;
            notes.forEach((x, i) => { ctx += `${i + 1}. [${x.status}] ${x.nama} (${x.kendaraan}, Sales:${x.sales}): "${x.note}"\n`; });
        }
        return ctx;
    } catch (e) { return '(Gagal mengambil data survey)'; }
};

export const fetchSurveyKTBData = async (params) => {
    try {
        const res = await fetch(`${BASE}/warranty_ktb.php?action=list&source=survey`);
        const json = await res.json();
        if (!json.status || !json.data) return '(Tidak ada data survey KTB)';
        const bulan = params.bulan || new Date().toISOString().slice(0, 7);
        const selected = new Date(bulan + '-01');
        const startDate = new Date(selected.getFullYear(), selected.getMonth() - 1, 26);
        const endDate = new Date(selected.getFullYear(), selected.getMonth(), 25);
        let items = json.data.filter(it => {
            const isSurveyed = ['PUAS', 'BIASA SAJA', 'TIDAK PUAS', 'KOMPLEN', 'SARAN', 'TIDAK DIANGKAT', 'NOMOR SALAH', 'DITOLAK/REJECT', 'PERJANJIAN', 'SALAH SAMBUNG', 'PKT'].includes(it.status);
            if (!isSurveyed) return false;
            if (!it.pkt_date) return false;
            const pktDate = new Date(it.pkt_date + 'T00:00:00');
            return pktDate >= startDate && pktDate <= endDate;
        });
        const belum = items.filter(i => i.status === 'PKT').length;
        let ctx = `=== SURVEY KTB (${bulan}) ===\nTotal: ${items.length}, Belum FU: ${belum}\n\n`;
        items.slice(0, 50).forEach(it => {
            const days = it.pkt_date ? Math.floor(Math.abs(new Date() - new Date(it.pkt_date)) / 86400000) : 0;
            ctx += `${it.nama} | ${it.kendaraan} | Sales:${it.sales}/${it.spv} | Status:${it.status === 'PKT' ? 'PERLU FOLLOW UP' : it.status} | Umur:${days}hari | Note:"${it.note || '-'}"\n`;
        });
        return ctx;
    } catch (e) { return '(Gagal mengambil data survey KTB)'; }
};

export const getSystemPrompt = (category, params) => {
    const catLabel = CATEGORIES.find(c => c.id === category)?.label || category;
    const depth = params.depth || 'Standar';
    const structures = {
        booking: `### 📊 Ringkasan Performa Booking & Kapasitas\n### 📈 Trend Kehadiran vs No-Show vs Walk-In\n### 🏭 Analisis Utilisasi Stall & Kapasitas\n### ⚠️ Area yang Perlu Perhatian\n### ✅ Rekomendasi Peningkatan`,
        konsumen: `### 👥 Profil & Distribusi Pelanggan\n### 📊 Analisis Prioritas & Loyalitas\n### 🔍 Insight Data STNK/Pajak\n### ✅ Rekomendasi Retensi Pelanggan`,
        potensi: `### 🎯 Ringkasan Potensi Service\n### 📊 Distribusi Lead per Kategori\n### ⚠️ Lead yang Perlu Prioritas\n### ✅ Rekomendasi Strategi Follow-Up`,
        dissatisfaction: `### 😤 Ringkasan Keluhan Pelanggan\n### 🔍 Analisis Akar Masalah (Root Cause)\n### 📊 Distribusi per SA & Atribut\n### ⚠️ Risiko Churn\n### ✅ Rekomendasi Penanganan & Pencegahan`,
        sales_survey: `### 📋 Distribusi Kepuasan Pelanggan\n### 📈 Analisis Trend (Positif vs Negatif)\n### 💬 Insight dari Feedback Konsumen\n### ✅ Rekomendasi Strategi Peningkatan CS`,
        survey_ktb: `### 📋 Status Survey KTB\n### 📊 Analisis Follow-Up & Aging\n### ⚠️ Data yang Memerlukan Perhatian\n### ✅ Rekomendasi Tindakan`,
        semua: `### 📊 Ringkasan Performa Operasional\n### 📋 Analisis Kepuasan Pelanggan\n### 😤 Highlight Keluhan & Dissatisfaction\n### 🎯 Potensi & Peluang Service\n### ⚠️ Area yang Perlu Perhatian\n### ✅ Rekomendasi Tindakan Prioritas`,
    };
    return `Anda adalah AI asisten Customer Satisfaction Manager di dealer resmi Mitsubishi Motors Dwindo Bintaro.
Tugas Anda adalah menganalisis data operasional dealer dan memberikan insight strategis.

Konteks Analisis:
- Fokus Kategori: ${catLabel}
- Kedalaman: ${depth}
${category === 'booking' ? `- PENTING: Status BOOKING artinya konsumen sudah booking tetapi TIDAK DATANG tanpa konfirmasi pembatalan (No-Show). Ini BUKAN status "sedang booking".` : ''}

Berikan analisis dalam format Markdown. Bahasa Indonesia profesional. Jelas dan actionable.
Fokuskan SELURUH analisis MURNI pada "${catLabel}". JANGAN menganalisis hal di luar konteks ini.
${depth === 'Mendalam' ? 'Berikan analisis yang DETAIL dan KOMPREHENSIF dengan angka-angka spesifik.' : ''}
${depth === 'Pencarian Solusi' ? 'Fokuskan pada IDENTIFIKASI MASALAH dan SOLUSI KONKRET yang bisa langsung diterapkan.' : ''}
Struktur output WAJIB:\n${structures[category] || structures.semua}`;
};
