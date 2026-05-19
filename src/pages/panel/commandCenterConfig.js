import { Calendar, Users, Target, AlertOctagon, FileText, ClipboardList, Layers } from 'lucide-react';

export const CATEGORIES = [
    { id: 'booking', label: 'Booking Service', icon: Calendar, color: 'from-blue-500 to-indigo-600', desc: 'Trend booking, kapasitas stall, utilisasi & heatmap kedatangan', apis: ['data_booking', 'analisis_booking'] },
    { id: 'konsumen', label: 'Database Konsumen', icon: Users, color: 'from-emerald-500 to-green-600', desc: 'Profil pelanggan, distribusi prioritas, data pajak STNK', apis: ['data_konsumen'] },
    { id: 'potensi', label: 'Potensi Service', icon: Target, color: 'from-orange-500 to-amber-600', desc: 'Lead potensial, due service, clean data analysis', apis: ['potensi_booking'] },
    { id: 'dissatisfaction', label: 'Dissatisfaction', icon: AlertOctagon, color: 'from-red-500 to-rose-600', desc: 'Keluhan pelanggan, criteria, follow-up tracking', apis: ['data_dissatisfaction'] },
    { id: 'sales_survey', label: 'Sales Survey', icon: FileText, color: 'from-purple-500 to-violet-600', desc: 'Kepuasan pembelian, produktivitas tim follow-up, pola & anomali', apis: ['sales_survey'] },
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
        // Filter items dalam rentang waktu untuk counting
        const itemsInRange = items.filter(x => { const w = x.wa_date ? new Date(x.wa_date) : null; return w && w >= ago; });
        itemsInRange.forEach(x => { if (counts[(x.status || '').toUpperCase()] !== undefined) counts[(x.status || '').toUpperCase()]++; });
        let ctx = `=== DISTRIBUSI SALES SURVEY (${days} HARI) ===\n`;
        ctx += Object.entries(counts).map(([s, c]) => `${s}: ${c}`).join('\n') + '\n';
        // Feedback konsumen, difilter sesuai parameter timeRange
        const notes = itemsInRange.filter(x => x.note?.trim()).sort((a, b) => new Date(b.wa_date || b.time || 0) - new Date(a.wa_date || a.time || 0));
        if (notes.length > 0) {
            ctx += `\n=== FEEDBACK KONSUMEN (${notes.length} dalam ${days} hari) ===\n`;
            notes.slice(0, 50).forEach((x, i) => { ctx += `${i + 1}. [${x.status}] ${x.nama} (${x.kendaraan}, Sales:${x.sales}, SPV:${x.spv}): "${x.note}"\n`; });
        }

        // === PRODUKTIVITAS STAFF FOLLOW UP (dari surveyupdate_record) ===
        // Staff CS yang bertugas follow-up = 1 orang. Analisis produktivitas kerjanya.
        const followedUpItems = items.filter(x => {
            const t = x.time ? new Date(x.time.replace(' ', 'T') + 'Z') : null;
            return t && t >= ago && !['PKT', 'PDI'].includes(x.status);
        });

        const totalData = items.length;
        const totalBelumFU = items.filter(x => ['PKT', 'PERLU FOLLOW UP', 'SURVEY_WA'].includes(x.status)).length;
        const completionRate = totalData > 0 ? Math.round(((totalData - totalBelumFU) / totalData) * 100) : 0;

        // Hitung response time (wa_date -> time update) & daily throughput
        let totalResponseDays = 0, responseCounted = 0;
        const dailyWork = {}; // tanggal -> jumlah FU
        const dayOfWeekWork = [0, 0, 0, 0, 0, 0, 0]; // Minggu-Sabtu
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const resultCounts = { puas: 0, biasa: 0, negatif: 0, tidakAngkat: 0, nomorSalah: 0, ditolak: 0, lainnya: 0 };

        followedUpItems.forEach(x => {
            const s = (x.status || '').toUpperCase();
            if (s === 'PUAS') resultCounts.puas++;
            else if (s === 'BIASA SAJA') resultCounts.biasa++;
            else if (['TIDAK PUAS', 'KOMPLEN'].includes(s)) resultCounts.negatif++;
            else if (s === 'TIDAK DIANGKAT') resultCounts.tidakAngkat++;
            else if (['NOMOR SALAH', 'SALAH SAMBUNG'].includes(s)) resultCounts.nomorSalah++;
            else if (s === 'DITOLAK/REJECT') resultCounts.ditolak++;
            else resultCounts.lainnya++;

            if (x.wa_date && x.time) {
                const waDate = new Date(x.wa_date + 'T00:00:00');
                const updateDate = new Date(x.time.replace(' ', 'T') + 'Z');
                if (!isNaN(waDate) && !isNaN(updateDate)) {
                    const diffDays = Math.floor(Math.abs(updateDate - waDate) / 86400000);
                    totalResponseDays += diffDays;
                    responseCounted++;
                }
            }

            // Track tanggal kerja (dari field time = kapan staff melakukan update)
            if (x.time) {
                const updateDate = new Date(x.time.replace(' ', 'T') + 'Z');
                const dateKey = updateDate.toISOString().split('T')[0];
                dailyWork[dateKey] = (dailyWork[dateKey] || 0) + 1;
                dayOfWeekWork[updateDate.getDay()]++;
            }
        });

        const avgResponseDays = responseCounted > 0 ? Math.round(totalResponseDays / responseCounted) : 0;
        const workDays = Object.keys(dailyWork).length;
        const avgPerDay = workDays > 0 ? Math.round(followedUpItems.length / workDays) : 0;

        // Skor produktivitas
        let grade = 'Bagus';
        if (avgPerDay < 5 || avgResponseDays > 14) grade = 'Rendah';
        else if (avgPerDay < 10 || avgResponseDays > 7) grade = 'Sedang';

        ctx += `\n=== PRODUKTIVITAS STAFF FOLLOW UP (${days} HARI) ===\n`;
        ctx += `Catatan: Follow up dilakukan oleh 1 orang staff CS khusus\n\n`;
        ctx += `Total data di-follow up: ${followedUpItems.length}\n`;
        ctx += `Total data belum di-follow up: ${totalBelumFU}\n`;
        ctx += `Tingkat penyelesaian: ${completionRate}% (${totalData - totalBelumFU}/${totalData})\n`;
        ctx += `Hari aktif bekerja (dalam ${days} hari): ${workDays} hari\n`;
        ctx += `Rata-rata follow up per hari kerja: ${avgPerDay} data/hari\n`;
        ctx += `Rata-rata response time (WA Date → selesai FU): ${avgResponseDays} hari\n`;
        ctx += `Skor Produktivitas: ${grade}\n`;

        ctx += `\n--- HASIL FOLLOW UP ---\n`;
        ctx += `Puas: ${resultCounts.puas} | Biasa Saja: ${resultCounts.biasa} | Negatif (Tidak Puas/Komplen): ${resultCounts.negatif}\n`;
        ctx += `Tidak Diangkat: ${resultCounts.tidakAngkat} | Nomor Salah/Salah Sambung: ${resultCounts.nomorSalah} | Ditolak/Reject: ${resultCounts.ditolak}\n`;
        const effectiveContact = resultCounts.puas + resultCounts.biasa + resultCounts.negatif;
        const effectiveRate = followedUpItems.length > 0 ? Math.round((effectiveContact / followedUpItems.length) * 100) : 0;
        ctx += `Kontak efektif (mendapat jawaban): ${effectiveContact} (${effectiveRate}%)\n`;

        ctx += `\n--- POLA KERJA PER HARI ---\n`;
        dayNames.forEach((name, i) => {
            const bar = '█'.repeat(Math.min(dayOfWeekWork[i], 30));
            ctx += `${name}: ${dayOfWeekWork[i]} ${bar}\n`;
        });

        // Hari paling produktif & paling sedikit
        const sortedDays = Object.entries(dailyWork).sort((a, b) => b[1] - a[1]);
        if (sortedDays.length > 0) {
            ctx += `\n--- HARI PALING PRODUKTIF ---\n`;
            sortedDays.slice(0, 5).forEach(([date, count]) => {
                ctx += `${date}: ${count} data di-follow up\n`;
            });
            ctx += `\n--- HARI PALING SEDIKIT ---\n`;
            sortedDays.slice(-3).reverse().forEach(([date, count]) => {
                ctx += `${date}: ${count} data di-follow up\n`;
            });
        }

        // === REPORT PER SPV & SALES (perlu ditindak lanjuti) ===
        const spvSalesMap = {};
        itemsInRange.forEach(x => {
            const spv = x.spv || 'UNKNOWN';
            const sales = x.sales || 'UNKNOWN';
            if (!spvSalesMap[spv]) spvSalesMap[spv] = { total: 0, puas: 0, biasa: 0, negatif: 0, ditolak: 0, tidakAngkat: 0, nomorSalah: 0, sales: {} };
            spvSalesMap[spv].total++;
            const s = (x.status || '').toUpperCase();
            if (s === 'PUAS') spvSalesMap[spv].puas++;
            else if (s === 'BIASA SAJA') spvSalesMap[spv].biasa++;
            else if (['TIDAK PUAS', 'KOMPLEN'].includes(s)) spvSalesMap[spv].negatif++;
            else if (s === 'DITOLAK/REJECT') spvSalesMap[spv].ditolak++;
            else if (s === 'TIDAK DIANGKAT') spvSalesMap[spv].tidakAngkat++;
            else if (['NOMOR SALAH', 'SALAH SAMBUNG'].includes(s)) spvSalesMap[spv].nomorSalah++;
            if (!spvSalesMap[spv].sales[sales]) spvSalesMap[spv].sales[sales] = { total: 0, puas: 0, biasa: 0, negatif: 0, ditolak: 0, nomorSalah: 0, notes: [] };
            spvSalesMap[spv].sales[sales].total++;
            if (s === 'PUAS') spvSalesMap[spv].sales[sales].puas++;
            else if (s === 'BIASA SAJA') spvSalesMap[spv].sales[sales].biasa++;
            else if (['TIDAK PUAS', 'KOMPLEN'].includes(s)) spvSalesMap[spv].sales[sales].negatif++;
            else if (s === 'DITOLAK/REJECT') spvSalesMap[spv].sales[sales].ditolak++;
            else if (['NOMOR SALAH', 'SALAH SAMBUNG'].includes(s)) spvSalesMap[spv].sales[sales].nomorSalah++;
            if (x.note?.trim()) spvSalesMap[spv].sales[sales].notes.push(x.note.trim());
        });

        if (Object.keys(spvSalesMap).length > 0) {
            ctx += `\n=== REPORT PER SPV & SALES (${days} HARI) ===\n`;
            Object.entries(spvSalesMap).sort((a, b) => b[1].total - a[1].total).forEach(([spv, stat]) => {
                const puasRate = stat.total > 0 ? Math.round((stat.puas / stat.total) * 100) : 0;
                const negatifRate = stat.total > 0 ? Math.round((stat.negatif / stat.total) * 100) : 0;
                ctx += `\nSPV: ${spv} | Total: ${stat.total} | Puas: ${stat.puas} (${puasRate}%) | Biasa: ${stat.biasa} | Negatif: ${stat.negatif} (${negatifRate}%) | Ditolak: ${stat.ditolak} | No.Salah: ${stat.nomorSalah}\n`;
                Object.entries(stat.sales).sort((a, b) => b[1].total - a[1].total).forEach(([sales, sStat]) => {
                    const sPuasRate = sStat.total > 0 ? Math.round((sStat.puas / sStat.total) * 100) : 0;
                    let flag = '';
                    if (sStat.negatif > 0) flag += ' ⚠️NEGATIF';
                    if (sStat.total >= 3 && sPuasRate < 30) flag += ' 🔴LOW-PUAS';
                    if (sStat.nomorSalah >= 2) flag += ' 📞NO.SALAH';
                    ctx += `  └ ${sales} | Total: ${sStat.total} | Puas: ${sStat.puas} (${sPuasRate}%) | Biasa: ${sStat.biasa} | Negatif: ${sStat.negatif} | Ditolak: ${sStat.ditolak}${flag}\n`;
                    if (sStat.notes.length > 0) {
                        sStat.notes.slice(0, 3).forEach(n => { ctx += `    💬 "${n}"\n`; });
                    }
                });
            });

            // Sales yang perlu ditindak lanjuti
            const salesNeedAction = [];
            Object.entries(spvSalesMap).forEach(([spv, stat]) => {
                Object.entries(stat.sales).forEach(([sales, sStat]) => {
                    const reasons = [];
                    if (sStat.negatif > 0) reasons.push(`${sStat.negatif} feedback negatif`);
                    if (sStat.total >= 3 && Math.round((sStat.puas / sStat.total) * 100) < 30) reasons.push(`tingkat puas rendah (${Math.round((sStat.puas / sStat.total) * 100)}%)`);
                    if (sStat.nomorSalah >= 2) reasons.push(`${sStat.nomorSalah} nomor salah (data entry issue)`);
                    if (sStat.notes.some(n => /jelek|bingung|tidak puas|kecewa|buruk|lambat/i.test(n))) reasons.push('ada keluhan serius di feedback');
                    if (reasons.length > 0) salesNeedAction.push({ sales, spv, reasons, total: sStat.total });
                });
            });
            if (salesNeedAction.length > 0) {
                ctx += `\n--- SALES YANG PERLU DITINDAK LANJUTI ---\n`;
                salesNeedAction.sort((a, b) => b.reasons.length - a.reasons.length).forEach(s => {
                    ctx += `🚨 ${s.sales} (SPV: ${s.spv}, ${s.total} data) → ${s.reasons.join('; ')}\n`;
                });
            }
        }

        // Belum follow-up (stale data)
        const belumFU = items.filter(x => ['PKT', 'PERLU FOLLOW UP', 'SURVEY_WA'].includes(x.status));
        if (belumFU.length > 0) {
            ctx += `\n=== DATA BELUM FOLLOW UP (${belumFU.length} total) ===\n`;
            const staleItems = belumFU.filter(x => {
                if (!x.wa_date) return false;
                const wa = new Date(x.wa_date + 'T00:00:00');
                const diffDays = Math.floor(Math.abs(new Date() - wa) / 86400000);
                return diffDays > 7;
            }).sort((a, b) => new Date(a.wa_date) - new Date(b.wa_date));
            if (staleItems.length > 0) {
                ctx += `PERINGATAN: ${staleItems.length} data belum di-follow up lebih dari 7 hari!\n`;
                staleItems.slice(0, 20).forEach(x => {
                    const diffDays = Math.floor(Math.abs(new Date() - new Date(x.wa_date + 'T00:00:00')) / 86400000);
                    ctx += `⚠️ ${x.nama} | Sales:${x.sales} | SPV:${x.spv} | WA Date:${x.wa_date} | Umur:${diffDays} hari | Status:${x.status}\n`;
                });
            }
        }

        // Fetch follow-up logs (surveyupdate_record) untuk analisis pola
        const recentFollowedUp = followedUpItems.slice(0, 80);
        if (recentFollowedUp.length > 0) {
            const logPromises = recentFollowedUp.map(x =>
                fetch(`${BASE}/sales_survey.php?action=logs&unit_id=${x.id}`)
                    .then(r => r.json())
                    .then(res => ({ id: x.id, nama: x.nama, sales: x.sales, spv: x.spv, logs: res.status ? (res.data || []) : [] }))
                    .catch(() => ({ id: x.id, nama: x.nama, sales: x.sales, spv: x.spv, logs: [] }))
            );
            const allLogs = await Promise.all(logPromises);
            const itemsWithMultipleFU = allLogs.filter(x => x.logs.length > 1);
            const itemsWithNotes = allLogs.filter(x => x.logs.some(l => l.note?.trim()));

            if (itemsWithMultipleFU.length > 0 || itemsWithNotes.length > 0) {
                ctx += `\n=== ANALISIS LOG FOLLOW UP (surveyupdate_record) ===\n`;
                ctx += `Data dengan riwayat log: ${allLogs.filter(x => x.logs.length > 0).length}/${recentFollowedUp.length}\n`;
                ctx += `Data dengan multiple follow-up (>1 kali kontak): ${itemsWithMultipleFU.length}\n`;
                ctx += `Data dengan catatan/note dari follow up: ${itemsWithNotes.length}\n`;

                // Deteksi anomali: terlalu banyak follow-up (>3 kali) bisa berarti masalah
                const anomalies = itemsWithMultipleFU.filter(x => x.logs.length >= 3);
                if (anomalies.length > 0) {
                    ctx += `\n--- ANOMALI: ${anomalies.length} data di-follow up ≥ 3 kali (kemungkinan ada masalah) ---\n`;
                    anomalies.forEach(x => {
                        const statusChanges = x.logs.map(l => l.status || '?').join(' → ');
                        ctx += `${x.nama} | Sales:${x.sales} | SPV:${x.spv} | FU ${x.logs.length}x | Alur: ${statusChanges}\n`;
                    });
                }

                // Pola perubahan status
                const statusTransitions = {};
                allLogs.forEach(x => {
                    if (x.logs.length >= 2) {
                        for (let i = 0; i < x.logs.length - 1; i++) {
                            const from = x.logs[i].status || '?';
                            const to = x.logs[i + 1].status || '?';
                            const key = `${from} → ${to}`;
                            statusTransitions[key] = (statusTransitions[key] || 0) + 1;
                        }
                    }
                });
                if (Object.keys(statusTransitions).length > 0) {
                    ctx += `\n--- POLA TRANSISI STATUS ---\n`;
                    Object.entries(statusTransitions).sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([transition, count]) => {
                        ctx += `${transition}: ${count} kali\n`;
                    });
                }

                // Catatan dari follow-up logs
                const logNotes = [];
                allLogs.forEach(x => {
                    x.logs.forEach(l => {
                        if (l.note?.trim()) logNotes.push({ nama: x.nama, sales: x.sales, spv: x.spv, status: l.status, note: l.note, date: l.date });
                    });
                });
                if (logNotes.length > 0) {
                    ctx += `\n--- CATATAN DARI LOG FOLLOW UP (${logNotes.length}) ---\n`;
                    logNotes.slice(0, 20).forEach((n, i) => {
                        ctx += `${i + 1}. [${n.status}] ${n.nama} (Sales:${n.sales}): "${n.note}"\n`;
                    });
                }
            }
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
        sales_survey: `### 📋 Distribusi Kepuasan Pelanggan\n### 📈 Analisis Trend (Positif vs Negatif)\n### 👤 Produktivitas Staff Follow Up\nAnalisis skor produktivitas staff CS (Bagus/Sedang/Rendah), throughput harian, response time, tingkat kontak efektif, dan pola kerja per hari.\n### 📊 Report per SPV & Sales\nBreakdown performa per SPV dan sales di bawahnya. Sorot sales yang bermasalah (negatif tinggi, puas rendah, nomor salah banyak) dan berikan rekomendasi tindakan per individu.\n### 🚨 Sales yang Perlu Ditindak Lanjuti\nList sales yang perlu perhatian manajemen beserta alasan spesifik.\n### 🔄 Pola & Anomali Follow Up\nIdentifikasi pola transisi status, data yang di-follow up berulang kali, dan anomali yang perlu perhatian.\n### ⚠️ Data Stale & Belum Di-Follow Up\n### 💬 Insight dari Feedback Konsumen\n### ✅ Rekomendasi Strategi Peningkatan CS & Produktivitas`,
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
