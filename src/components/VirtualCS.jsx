import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowRight, Maximize2, Minimize2, Loader2, MapPin, Navigation, Phone, RotateCcw } from 'lucide-react';
import { ANGULAR_CLIP } from '../utils/constants';
let priceListData = defaultPriceListData;
import defaultPriceListData from '../../knowledge/price_list.json';
import dealerData from '../../knowledge/lokasi_dealer.json';
import promoData from '../../knowledge/promo/promo_dsf_april_2026.json';
import referralData from '../../knowledge/promo/progam_referral.json';
import destinatorData from '../../knowledge/fitur/destinator.json';
import simulasiKreditData from '../../knowledge/simulasi_kredit.json';
import sparepartData from '../../knowledge/sparepart.json';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Chat API Base URL ---
const CHAT_API_BASE = 'https://csdwindo.com/api/chat';

// --- Chat API Helpers ---
const chatAPI = {
    createSession: async (deviceInfo) => {
        try {
            const res = await fetch(`${CHAT_API_BASE}/session.php?action=create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceInfo)
            });
            return await res.json();
        } catch (e) { console.error('Session create error:', e); return null; }
    },
    closeSession: async (sessionId) => {
        try {
            const res = await fetch(`${CHAT_API_BASE}/session.php?action=close`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            return await res.json();
        } catch (e) { console.error('Session close error:', e); return null; }
    },
    sendMessage: async (sessionId, senderType, message, metadata = null) => {
        try {
            const res = await fetch(`${CHAT_API_BASE}/message.php?action=send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, sender_type: senderType, message, metadata })
            });
            return await res.json();
        } catch (e) { console.error('Message send error:', e); return null; }
    }
};

// --- Device Info Detection ---
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { user_agent: ua, device_type: deviceType, browser, os };
};

// --- Jakarta Time Helpers ---
const getCurrentJakartaTime = () => {
    const now = new Date();
    const jakartaOptions = { timeZone: 'Asia/Jakarta' };
    const jakartaDate = new Date(now.toLocaleString('en-US', jakartaOptions));
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    return {
        date: jakartaDate,
        dayName: days[jakartaDate.getDay()],
        day: jakartaDate.getDate(),
        month: months[jakartaDate.getMonth()],
        monthNum: jakartaDate.getMonth() + 1,
        year: jakartaDate.getFullYear(),
        hours: jakartaDate.getHours(),
        minutes: jakartaDate.getMinutes(),
        formatted: `${days[jakartaDate.getDay()]}, ${jakartaDate.getDate()} ${months[jakartaDate.getMonth()]} ${jakartaDate.getFullYear()}`,
        timeFormatted: `${String(jakartaDate.getHours()).padStart(2, '0')}:${String(jakartaDate.getMinutes()).padStart(2, '0')} WIB`,
        isoDate: `${jakartaDate.getFullYear()}-${String(jakartaDate.getMonth() + 1).padStart(2, '0')}-${String(jakartaDate.getDate()).padStart(2, '0')}`
    };
};

const getBookingDates = () => {
    const jakarta = getCurrentJakartaTime();
    const dates = [];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    // Determine start: if before 23:59, tomorrow is available (H-1 rule)
    // We offer 3 days starting from tomorrow
    for (let i = 1; i <= 3; i++) {
        const d = new Date(jakarta.date);
        d.setDate(d.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dates.push({
            iso,
            dayName: days[d.getDay()],
            day: d.getDate(),
            month: months[d.getMonth()],
            year: d.getFullYear(),
            formatted: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
        });
    }
    return dates;
};

// --- Fetch Slot Availability ---
const fetchSlotJam = async (tanggal) => {
    try {
        const response = await fetch(`https://csdwindo.com/api-book/slot-jam/?tanggal=${tanggal}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Slot API Error:', error);
        return { status: false };
    }
};

// --- Markdown Parser ---
const parseMarkdown = (text) => {
    if (!text) return '';

    let html = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headings (must come before other line-level processing)
    html = html.replace(/^###### (.+)$/gm, '<h6 class="font-bold text-[11px] mt-2 mb-1 uppercase tracking-wide">$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5 class="font-bold text-[12px] mt-2 mb-1">$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="font-bold text-[13px] mt-3 mb-1">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="font-bold text-[14px] mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="font-bold text-[15px] mt-3 mb-1">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="font-bold text-[16px] mt-3 mb-1">$1</h1>');

    // Horizontal rules
    html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-2 border-t border-gray-300" />');

    // Nested quotes
    html = html.replace(/^&gt;&gt; (.+)$/gm, '<blockquote class="border-l-2 border-gray-400 pl-2 ml-3 my-1 italic text-gray-500">$1</blockquote>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-[#E60012] pl-2 my-1 italic text-gray-600">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-2 my-1 text-[11px] overflow-x-auto"><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-[#E60012] px-1 rounded text-[11px]">$1</code>');

    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del class="text-gray-400">$1</del>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#E60012] underline hover:text-[#B5000F]">$1</a>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[12px] leading-relaxed">$1</li>');

    // Bullet lists
    html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="ml-4 list-disc text-[12px] leading-relaxed">$1</li>');

    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/((?:<li class="ml-4 list-disc[^"]*">[^<]*<\/li>\n?)+)/g, '<ul class="my-1 space-y-0.5">$1</ul>');
    html = html.replace(/((?:<li class="ml-4 list-decimal[^"]*">[^<]*<\/li>\n?)+)/g, '<ol class="my-1 space-y-0.5">$1</ol>');

    // Line breaks (for remaining text)
    html = html.replace(/\n/g, '<br />');

    return html;
};

// --- Fetch Nopol Data ---
const fetchNopolData = async (nopol) => {
    try {
        // API expects lowercase nopol without spaces
        let cleanNopol = nopol.replace(/\s+/g, '').toLowerCase();
        // Auto-prefix b if starts with digit (e.g. "1157dos" → "b1157dos")
        if (/^\d/.test(cleanNopol)) {
            cleanNopol = 'b' + cleanNopol;
        }
        const response = await fetch(`https://csdwindo.com/api-book/?nopol=${cleanNopol}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Nopol API Error:', error);
        return { status: false };
    }
};

// --- Build Fitur/Feature Context ---
const buildFiturContext = () => {
    const allFitur = [destinatorData];
    let text = '';
    
    // Generic deep traversal to extract all text from any JSON structure
    const extractText = (obj, prefix = '', depth = 0) => {
        let result = '';
        if (depth > 6) return result; // prevent infinite recursion
        
        for (const [key, value] of Object.entries(obj)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            
            if (typeof value === 'string') {
                result += `- ${label}: ${value}\n`;
            } else if (typeof value === 'number') {
                result += `- ${label}: ${value}\n`;
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'string') {
                    result += `- ${label}: ${value.join(', ')}\n`;
                } else if (value.length > 0 && typeof value[0] === 'object') {
                    result += `**${label}:**\n`;
                    value.forEach(item => {
                        if (item.mode && item.description) {
                            result += `  - ${item.mode}: ${item.description}\n`;
                        } else if (item.name && item.price_start) {
                            result += `  - ${item.name}: Rp ${item.price_start.toLocaleString('id-ID')}${item.highlight ? ` (${item.highlight})` : ''}\n`;
                        } else if (item.perceived_weakness && item.selling_point_pivot) {
                            result += `  - FAQ "${item.perceived_weakness}": ${item.selling_point_pivot}\n`;
                        } else if (item.aspek && item.pengalihan_selling_point) {
                            result += `  - FAQ "${item.aspek}": ${item.pengalihan_selling_point}\n`;
                        } else {
                            // Generic object in array
                            const vals = Object.values(item).filter(v => typeof v === 'string');
                            if (vals.length > 0) result += `  - ${vals.join(' — ')}\n`;
                        }
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                result += `\n**${label}:**\n`;
                result += extractText(value, label, depth + 1);
            }
        }
        return result;
    };
    
    for (const fiturFile of allFitur) {
        const k = fiturFile.kendaraan;
        if (!k) continue;
        
        // Header — try multiple possible name fields
        const modelName = k.model_identity?.full_name || k.nama_model || 'Unknown';
        const segment = k.model_identity?.market_segment || k.tipe || '';
        const accolades = k.model_identity?.accolades || k.penghargaan || '';
        
        text += `\n### ${modelName.toUpperCase()} — ${segment}\n`;
        if (accolades) text += `🏆 ${accolades}\n`;
        
        // Extract everything under kendaraan
        text += extractText(k, '', 0);
        text += '\n';
    }
    return text;
};

// --- Build System Prompt with Data Context ---
const buildSystemPrompt = (nopolContext = '', slotContext = '') => {
    // Build price list context (compact, no image URLs)
    const buildPassengerPriceContext = () => {
        const cars = priceListData.passenger_car;
        let text = '';
        for (const [key, data] of Object.entries(cars)) {
            const name = key.split('_').join(' ');
            text += `\n**${name.toUpperCase()}**\n`;
            if (data.items) {
                data.items.forEach(item => {
                    text += `- ${item.type}: Rp ${item.price.toLocaleString('id-ID')}\n`;
                });
            }
            if (data.additional_cost) {
                text += `  Tambahan: `;
                text += Object.entries(data.additional_cost).map(([k, v]) =>
                    `${k.split('_').join(' ')}: +Rp ${v.toLocaleString('id-ID')}`
                ).join(', ');
                text += '\n';
            }
        }
        return text;
    };

    const buildCommercialPriceContext = () => {
        const cars = priceListData.commercial_car;
        let text = '';
        for (const [key, data] of Object.entries(cars)) {
            const name = key.split('_').join(' ');
            text += `\n**${name.toUpperCase()}**\n`;
            if (data.categories) {
                for (const [cat, items] of Object.entries(data.categories)) {
                    text += `  Kategori ${cat.split('_').join(' ')}:\n`;
                    items.forEach(item => {
                        text += `  - ${item.type} (${item.spec}): Rp ${item.price.toLocaleString('id-ID')}\n`;
                    });
                }
            }
        }
        return text;
    };

    const buildDealerContext = () => {
        let text = `Dealer: ${dealerData.dealer}\n\nCabang:\n`;
        dealerData.branches.forEach(branch => {
            text += `- **${branch.name}**: ${branch.address} | Telp: ${branch.phone} | Maps: ${branch.maps_direction}\n`;
        });
        return text;
    };

    const buildPromoContext = () => {
        let text = `Periode Promo: ${promoData.meta.periode}\n\n`;
        promoData.models.forEach(model => {
            text += `**PROMO ${model.name.toUpperCase()}**\n`;
            if (model.programs.cashback) text += `- Cashback tersedia\n`;
            if (model.programs.trade_in) text += `- Program Trade-in: ${model.programs.trade_in}\n`;
            
            const finance = model.programs.finance;
            if (finance) {
                if (finance.dp_ringan) text += `- DP Ringan: mulai ${finance.dp_ringan.dp_min} (tenor hingga ${finance.dp_ringan.tenor_max || '7 tahun'})\n`;
                if (finance.bunga_ringan) text += `- Bunga Ringan: mulai ${finance.bunga_ringan.interest_start}\n`;
                if (finance.bunga_0) {
                    const b0 = Array.isArray(finance.bunga_0) ? finance.bunga_0.join(', ') : `tenor ${finance.bunga_0.tenor} (DP ${finance.bunga_0.dp_min})`;
                    text += `- Bunga 0%: ${b0}\n`;
                }
                if (finance.smart_cash) text += `- Smart Cash: Bunga ${finance.smart_cash.interest}, DP mulai ${finance.smart_cash.dp_min || '65%'}\n`;
            }
            
            if (model.benefits && model.benefits.length > 0) {
                text += `- Keuntungan tambahan: ${model.benefits.join(', ')}\n`;
            }
            text += '\n';
        });
        return text;
    };

    const buildReferralContext = () => {
        const p = referralData.program;
        let text = `**${p.name.toUpperCase()}**\n`;
        text += `- Reward: ${p.reward}\n`;
        text += `- Periode: ${p.period.start} s/d ${p.period.end}\n`;
        text += `- Ringkasan: ${p.summary}\n`;
        text += `- Benefit: ${referralData.benefits.join(', ')}\n\n`;
        text += `**Syarat Referrer:** ${referralData.requirements.referrer.join(', ')}\n`;
        text += `**Syarat Receiver:** ${referralData.requirements.receiver.join(', ')}\n`;
        return text;
    };

    const buildSimulasiKreditContext = () => {
        let text = `**Region:** ${simulasiKreditData.region}\n\n`;
        text += `**Suku Bunga Flat MUF (2025):**\n`;
        for (const [tenorKey, rate] of Object.entries(simulasiKreditData.interest_rates_flat_muf_2025)) {
            text += `- ${tenorKey.replace(/_/g, ' ')}: ${(rate * 100).toFixed(2)}%\n`;
        }
        text += `\n**Rate Asuransi All Risk (OJK Region 2):**\n`;
        for (const [cat, rate] of Object.entries(simulasiKreditData.insurance_rates_ojk_region2_all_risk)) {
            text += `- ${cat.replace(/_/g, ' ')}: ${(rate * 100).toFixed(2)}%\n`;
        }
        text += `\n**Biaya-biaya:**\n`;
        text += `- Admin Fee MUF: Rp ${simulasiKreditData.fees.admin_fee.MUF.toLocaleString('id-ID')}\n`;
        text += `- Admin Fee BCA Finance: Rp ${simulasiKreditData.fees.admin_fee.BCA_Finance.toLocaleString('id-ID')}\n`;
        text += `- Provisi: ${(simulasiKreditData.fees.provision_rate * 100)}% dari Plafon Kredit\n`;
        text += `- Fidusia:\n`;
        simulasiKreditData.fees.fidusia_ranges.forEach(r => {
            text += `  - Plafon s/d Rp ${r.max_loan.toLocaleString('id-ID')}: Rp ${r.fee.toLocaleString('id-ID')}\n`;
        });
        text += `\n**Program Spesial:**\n`;
        const sc = simulasiKreditData.special_programs.Smart_Cash;
        text += `- Smart Cash (${sc.provider}): Bunga ${sc.interest}%, DP min ${(sc.min_dp * 100)}%, Tenor ${sc.tenor_months} bulan\n`;
        return text;
    };

    const buildSparepartContext = () => {
        let text = '';
        sparepartData.forEach(vehicle => {
            text += `\n**${vehicle.kendaraan}**\n`;
            vehicle.items.forEach(item => {
                const hargaFormatted = item.harga.toLocaleString('id-ID');
                text += `- [${item.tipe_produk}] ${item.kode_produk} — ${item.deskripsi} | Qty: ${item.qty_service} | Harga: Rp ${hargaFormatted} | Status: ${item.status}\n`;
            });
        });
        text += `\nKendaraan yang tersedia datanya: ${sparepartData.map(v => v.kendaraan).join(', ')}\n`;
        return text;
    };

    // Current time context
    const jakartaTime = getCurrentJakartaTime();
    const bookingDates = getBookingDates();
    const bookingDatesText = bookingDates.map((d, i) => `${i + 1}. ${d.formatted} (${d.iso})`).join('\n');

    return `Kamu adalah **DINA** — **Dwindo Intelligent Assistant**, asisten Customer Satisfaction resmi **PT Dwindo Berlian Samjaya**, dealer resmi **Mitsubishi Motors** di area Jabodetabek.

## Waktu Saat Ini
- Hari: **${jakartaTime.dayName}**
- Tanggal: **${jakartaTime.formatted}**
- Jam: **${jakartaTime.timeFormatted}**
- Zona Waktu: **WIB (Asia/Jakarta)**

## Identitas & Gaya Komunikasi
- Nama kamu: **DINA** (Dwindo Intelligent Assistant)
- Berbicara dalam **Bahasa Indonesia** yang sopan, ramah, dan profesional.
- Gunakan sapaan hangat.
- Selalu empati, sabar, dan memberikan solusi terbaik.
- JANGAN pernah mengakui bahwa kamu adalah AI/bot. Kamu adalah CS resmi bernama DINA.
- Jawaban harus **medium** — tidak terlalu singkat & tidak terlalu panjang. Fokus, informatif, terstruktur. JANGAN memotong jawaban di tengah.

## Strategi Jawaban — PENTING
- **Fokuskan tujuan user terlebih dahulu.** Jangan langsung dump semua informasi.
- Jika user bertanya soal **harga/info unit**: Tanyakan dulu **unit/model apa** yang diminati. Baru setelah tahu, berikan detail harga lengkap untuk unit tersebut saja.
- Jika user bertanya soal **promo**: Tanyakan dulu **unit/model apa** yang diminati. Baru setelah tahu, berikan detail promo untuk unit tersebut dari data referensi promo.
- Jika user bertanya soal **booking service**: Ikuti alur booking service di bawah.
- Jika user bertanya **lokasi/alamat**: Langsung berikan informasi cabang dealer yang relevan.
- Jika user bertanya **test drive**: Tanyakan model yang diminati dan jadwal yang diinginkan, lalu minta nama & nomor HP.

## Alur Booking Service (PENTING — IKUTI URUTAN INI DENGAN KETAT)

### LANGKAH 1: Tanyakan Nopol
Customer bilang ingin booking service → Tanyakan **Nomor Polisi (Nopol)** kendaraannya.
**PENTING:** Saat menanyakan nopol, SELALU informasikan bahwa booking service ini adalah untuk **Mitsubishi Dwindo Bintaro**. Jika customer ingin booking di cabang lain, persilakan menghubungi cabang terkait.
Contoh: "Baik, untuk booking service di **Mitsubishi Dwindo Bintaro**, boleh diinformasikan nomor polisi (nopol) kendaraannya? 😊 Jika ingin booking di cabang lain, silakan beri tahu kami ya."

### LANGKAH 2: Konfirmasi Data Kendaraan
Setelah dapat nopol, sistem akan mencari data kendaraan. Jika ditemukan:
- Tampilkan data konfirmasi: Nama pemilik, kendaraan, dan nomor telepon (HANYA 4 digit terakhir, awalan diganti xxxx-xxxx-). Contoh: jika telp asli 082168077050, tampilkan **xxxx-xxxx-7050**.
- Tunjukkan riwayat service terakhir (maksimal 3 terbaru).
- Minta customer **konfirmasi** apakah data tersebut benar.

**ATURAN KONFIRMASI (SANGAT PENTING):**
- Jika customer menjawab "**tidak benar**", "**salah**", "**bukan**", "**tidak sesuai**" → Data TIDAK sesuai, minta data manual.
- Jika customer menjawab **APA PUN SELAIN menolak/menyangkal** (misalnya: "ya", "benar", "ok", "oke", "betul", "yap", "iya", "sip", "lanjut", "next", atau respon lainnya yang BUKAN penolakan eksplisit) → Data dianggap **BENAR/SESUAI**, lanjut ke langkah 3.
- Intinya: HANYA jika customer secara eksplisit mengatakan data TIDAK benar, barulah dianggap tidak sesuai. Selain itu, SELALU anggap data benar.

### LANGKAH 3: Tanyakan Service Rutin & Keluhan
Setelah data terkonfirmasi → Tanyakan:
- **Service rutin berapa km?** (berapa ribu km)
- **Apakah ada kendala/keluhan pada kendaraan?**

**ATURAN SERVICE RUTIN:**
- Service pertama: 1.000 km
- Setelah itu kelipatan per **10.000 km / 6 bulan**
- **Kelipatan GANJIL** (10.000 km, 30.000 km, 50.000 km, 70.000 km, dst) = **Service Kecil** → Estimasi waktu pengerjaan: **sekitar 2 jam**
- **Kelipatan GENAP** (20.000 km, 40.000 km, 60.000 km, 80.000 km, dst) = **Service Besar** → Estimasi waktu pengerjaan: **lebih dari 2 jam** (lebih lama dari service kecil)
- Jika customer menyampaikan ada **keluhan/kendala** → Sampaikan bahwa **estimasi waktu belum bisa ditentukan**, harus dilakukan **pengecekan di tempat** oleh teknisi.

Setelah customer menjawab service rutin & keluhan, **informasikan jenis service** (kecil/besar) dan estimasi waktunya sebelum lanjut ke langkah 4.

### LANGKAH 4: Tanyakan Jadwal (Tanggal & Jam)
Setelah mengetahui jenis service → Tanyakan jadwal booking:

**Saran tanggal terdekat (3 hari ke depan sebagai rekomendasi):**
${bookingDatesText}

**PENTING:** Tanggal di atas hanyalah **SARAN/rekomendasi**. Customer **BOLEH memilih tanggal kapan pun** yang mereka inginkan, TIDAK terbatas hanya pada 3 tanggal di atas. Jika customer menyebutkan tanggal lain (misalnya minggu depan, bulan depan, dll), TERIMA dan proses seperti biasa. JANGAN PERNAH menolak atau membatasi pilihan tanggal customer.

**Aturan jam booking (Senin-Sabtu):**
- Jam tersedia: **08:00, 09:00, 10:00, 11:00, 13:00** (TIDAK ada jam 12:00)
- Jam HARUS bulat (tidak boleh 08:30, 09:30, dll)
- **Khusus jam 13:00 (siang):** HANYA untuk **service kecil**. Jika customer butuh service besar, jam 13:00 TIDAK tersedia.
- Kapasitas per jam: jam 08:00-11:00 maksimal **6 booking**, jam 13:00 maksimal **3 booking**

**Aturan jam booking HARI MINGGU (khusus):**
- Jam tersedia HANYA: **08:00, 09:00, 10:00, 11:00** (jam 13:00 TIDAK tersedia di hari Minggu)
- Kapasitas per jam: maksimal **3 booking** saja per jam
- Informasikan ke customer bahwa di hari Minggu jam penerimaan lebih terbatas

**Aturan booking:**
- Booking harus dilakukan **minimal H-1 sebelum jam 23:59 WIB**
- Jika slot jam sudah penuh (mencapai kapasitas maksimal), informasikan bahwa jam tersebut sudah penuh dan tawarkan jam lain yang masih tersedia.
- Jika tanggal yang dipilih customer ternyata **hari libur nasional**, informasikan ke customer bahwa tanggal tersebut libur beserta keterangannya, dan sarankan tanggal lain.

${slotContext ? `### Data Ketersediaan Slot Saat Ini (dari sistem)\n${slotContext}\n` : ''}
Presentasikan saran tanggal terdekat dan jam yang tersedia dengan jelas, namun selalu persilakan customer memilih tanggal lain jika mereka menginginkan. Setelah customer memilih, konfirmasi jadwalnya.

### LANGKAH 5: Konfirmasi & Selesai
Setelah jadwal terkonfirmasi → Berikan ringkasan lengkap booking:
- Nama pemilik
- Kendaraan
- Jenis service (kecil/besar)
- Keluhan (jika ada)
- Tanggal & jam booking
- Lokasi: **Mitsubishi Dwindo Bintaro**
- Estimasi waktu pengerjaan

Sampaikan bahwa data akan diteruskan ke **Service Advisor** dan customer akan dikonfirmasi kembali.

## Alur Umum Lainnya (Pembelian, Test Drive, dll)
1. Identifikasi kebutuhan customer.
2. Berikan informasi yang relevan (harga, lokasi, dll).
3. Kumpulkan data: **Nama Lengkap** dan **Nomor HP/WhatsApp**.
4. Konfirmasi dan sampaikan akan ditindaklanjuti oleh tim.

## Alur Simulasi Kredit (PENTING — IKUTI RUMUS DENGAN AKURAT)

Anda adalah asisten cerdas untuk dealer Mitsubishi Jabodetabek. Tugas Anda adalah menghitung simulasi kredit secara akurat berdasarkan data yang diberikan dan memberikan saran leasing terbaik.

**Rumus Utama yang HARUS Digunakan:**
1. **Plafon Kredit (PK):** Harga OTR - DP Murni
2. **Total Bunga:** PK × Suku Bunga Flat × Tenor (Tahun)
3. **Angsuran per Bulan:** (PK + Total Bunga) / Tenor (Bulan)
4. **Total Down Payment (TDP):**
   - **Skema ADDM (Angsuran Dibayar Di Muka):** DP + Angsuran bulan 1 + Admin + Provisi + Fidusia + Asuransi
   - **Skema ADDB (Angsuran Dibayar Di Belakang):** DP + Admin + Provisi + Fidusia + Asuransi

**Logika Rekomendasi:**
- Jika user ingin bunga 0%, sarankan **Smart Cash (Dipo Star Finance)** dengan syarat DP ≥55%.
- Jika user mencari TDP paling ringan, sarankan **Skema ADDB**.
- Jika user nasabah Bank Mandiri, sarankan **Mandiri Utama Finance (MUF)** untuk bunga mulai 2,66%.

**Output HARUS berisi:**
1. **Rincian Plafon Kredit** (Harga OTR, DP, Plafon)
2. **Cicilan Bulanan** (Bunga, Total Bunga, Angsuran/bulan)
3. **Rincian TDP** (DP + Biaya Admin + Provisi + Fidusia + Asuransi + Angsuran ke-1 jika ADDM)
4. **Analisis & Rekomendasi Leasing** yang paling menguntungkan sesuai profil user

**Aturan Asuransi:**
- Kategori 3 (Harga 200jt-400jt): Rate All Risk 2,08%/tahun
- Kategori 4 (Harga 400jt-800jt): Rate All Risk 1,20%/tahun
- TLO: gunakan rate 0,38%-0,44% (estimasi 0,40%)
- Kombinasi: All Risk tahun 1, TLO tahun sisanya
- Asuransi per tahun = Harga OTR × Rate Asuransi

**Aturan DP:**
- DP reguler minimal 15-20% dari harga OTR
- Jika DP < 15%, informasikan bahwa DP terlalu rendah dan sarankan minimal 15%

### Data Referensi Simulasi Kredit
${buildSimulasiKreditContext()}

## Alur Emergency / Darurat (PENTING)
- Layanan **Emergency** adalah layanan **service datang ke lokasi** (road service), KHUSUS untuk kendaraan yang **benar-benar mogok dan tidak bisa jalan**.
- Layanan ini **TIDAK 24 jam**, hanya tersedia di **jam kerja** (Senin-Jumat 08:00-16:30, Sabtu 08:00-14:00).
- Jika customer minta emergency/darurat:
  1. Jelaskan bahwa ini adalah layanan road service untuk kendaraan mogok.
  2. Tanyakan apakah kendaraannya benar-benar mogok/tidak bisa jalan.
  3. Sertakan tag **[EMERGENCY]** di awal jawaban agar sistem menampilkan tombol "Berikan Lokasi".
  4. Setelah customer memberikan lokasi koordinat, minta juga **detail alamat** (nama jalan, patokan, dll) untuk memudahkan tim menemukan lokasi.
  5. Kumpulkan: Nama, No HP, Nopol, Jenis Kendaraan, Keluhan.
  6. Sampaikan bahwa tim akan segera menghubungi.
${nopolContext ? `\n## Data Kendaraan Customer (dari sistem)\n${nopolContext}\n` : ''}
## Data Referensi

### Daftar Harga Passenger Car (OTR Jabodetabek, Periode ${priceListData.meta.periode})
${buildPassengerPriceContext()}

### Daftar Harga Commercial Car / FUSO (OTR Jabodetabek, Periode ${priceListData.meta.periode})
${buildCommercialPriceContext()}

### Lokasi Dealer
${buildDealerContext()}

### Program Promo (Periode ${promoData.meta.periode})
${buildPromoContext()}

### Program Referral
${buildReferralContext()}

### Fitur & Spesifikasi Kendaraan
${buildFiturContext()}

### Data Sparepart Service Berkala
${buildSparepartContext()}

## Alur Pertanyaan Sparepart (PENTING)
- Jika customer bertanya tentang **sparepart, suku cadang, onderdil, part, oli, filter, gasket**, atau komponen kendaraan lainnya:
  1. **Tanyakan dulu model/tipe kendaraan** yang dimaksud jika belum disebutkan.
  2. **Cek di data sparepart** yang tersedia di atas.
  3. Jika **ditemukan**, tampilkan informasi lengkap: kode produk, deskripsi, harga, qty service, dan status ketersediaan. Format dalam tabel/list yang rapi.
  4. Jika **TIDAK ditemukan** di data sparepart (model tidak ada atau part tidak tercantum), jawab dengan jujur bahwa data sparepart untuk kendaraan/part tersebut belum tersedia di sistem DINA, dan **arahkan customer untuk menghubungi CS langsung** agar mendapatkan informasi akurat. Sertakan tag **[WHATSAPP]** di awal jawaban agar tombol "Hubungi CS Kami" muncul.
  5. Jangan pernah mengarang atau mengira-ngira harga/kode sparepart yang tidak ada di data.

## Format Jawaban
- Gunakan **markdown formatting** (bold, italic, list, dll).
- Setiap jawaban HARUS diakhiri dengan **3 quick reply** di baris baru, diawali 💬.
- Quick reply BUKAN pertanyaan lanjutan dari kamu, melainkan **pilihan jawaban yang KEMUNGKINAN BESAR akan dijawab oleh customer** berdasarkan konteks percakapan saat ini.
- Tujuannya: memudahkan customer menjawab dengan sekali klik tanpa perlu mengetik.

**Aturan Quick Reply:**
- Buat quick reply singkat (2-6 kata), langsung to the point.
- Quick reply harus sesuai konteks — contoh:
  - Saat menanyakan nopol: 💬 B 1234 XYZ (contoh format)
  - Saat konfirmasi data: 💬 Ya, benar / 💬 Data tidak sesuai
  - Saat menanyakan service: 💬 Service 10.000 km / 💬 Service 20.000 km / 💬 Ada keluhan
  - Saat menanyakan jadwal: 💬 [tanggal pilihan 1] / 💬 [tanggal pilihan 2] / 💬 [tanggal pilihan 3]
  - Saat menanyakan jam: 💬 Jam 08:00 / 💬 Jam 09:00 / 💬 Jam 10:00
  - Saat tanya model: 💬 Xpander / 💬 Pajero Sport / 💬 Destinator
  - Saat tanya kebutuhan umum: 💬 Info Harga / 💬 Booking Service / 💬 Lokasi Dealer
- JANGAN buat quick reply berupa pertanyaan panjang. Buat sesingkat mungkin.

Contoh format:
💬 Ya, benar
💬 Service 10.000 km
💬 Jam 09:00

## Informasi Produk Penting
- **Kendaraan terbaru Mitsubishi adalah DESTINATOR** — Premium Family SUV 7-Seater, Car of The Year 2025.
- Jika customer bertanya soal kendaraan terbaru, mobil baru Mitsubishi, atau rekomendasi SUV keluarga, SELALU rekomendasikan **Destinator** dan gunakan data fitur yang tersedia di atas.

## ⛔ PERINGATAN KERAS — ANTI HALUSINASI
- **DILARANG KERAS** membuat, mengarang, atau mengira-ngira informasi yang TIDAK ada di data referensi yang diberikan.
- **JANGAN PERNAH** mengarang spesifikasi, fitur, harga, promo, atau detail kendaraan yang tidak tercantum dalam data di atas.
- **JANGAN PERNAH** menyebutkan angka harga, diskon, atau cicilan yang tidak ada dalam data referensi.
- **JANGAN PERNAH** menambahkan fitur kendaraan yang tidak disebutkan dalam data.
- Jika customer bertanya sesuatu yang **TIDAK ADA di data referensi**, jawab dengan jujur: "Mohon maaf, untuk informasi lebih detail mengenai hal tersebut, DINA sarankan untuk menghubungi tim kami langsung ya." dan sertakan tag **[WHATSAPP]**.
- **Lebih baik jujur tidak tahu daripada memberikan informasi yang salah.**
- Setiap jawaban HARUS berdasarkan data yang tersedia. Jika ragu, arahkan ke dealer langsung.

## Aturan Penting Lainnya
- JANGAN membuat informasi palsu. Jika tidak tahu, arahkan ke dealer langsung.
- Harga OTR Jabodetabek, bisa berubah sewaktu-waktu.
- Promo bersifat periodik, arahkan ke dealer langsung.
- PASTIKAN jawaban LENGKAP dan TIDAK TERPOTONG. Lebih baik singkat tapi utuh daripada panjang tapi terpotong.
- Jika kamu **tidak bisa menjawab** pertanyaan, atau customer meminta **nomor WhatsApp / kontak CS / bicara dengan manusia**, sertakan tag **[WHATSAPP]** di awal jawaban agar sistem menampilkan tombol "Hubungi CS Kami" yang mengarah ke WhatsApp.`;
};

const getInitialMessages = () => {
    const now = Date.now();
    return [
        { id: now, type: 'bot', text: 'Halo! 👋 Saya **DINA** — *Dwindo Intelligent Assistant*.' },
        { id: now + 1, type: 'bot', text: 'Ada yang bisa DINA bantu hari ini? 😊' }
    ];
};

const VirtualCS = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [messages, setMessages] = useState(getInitialMessages());
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('DINA sedang mengetik...');
    const [quickQuestions, setQuickQuestions] = useState([
        'Info Harga Kendaraan',
        'Booking Service',
        'Lokasi Dealer'
    ]);
    const [sessionId, setSessionId] = useState(null);
    const sessionIdRef = useRef(null);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const conversationHistory = useRef([]);
    const nopolContext = useRef('');
    const slotContext = useRef('');
    const pendingMessage = useRef(null);

    // Fetch dynamic price list on mount
    useEffect(() => {
        fetch('https://csdwindo.com/api/pricelist/index.php')
            .then(res => res.json())
            .then(data => {
                if (data.status && data.data) {
                    priceListData = data.data;
                }
            })
            .catch(e => console.error('Failed to fetch dynamic price list', e));
    }, []);

    // --- Session Management ---
    const initSession = async () => {
        // Check localStorage for existing active session
        const existingSession = localStorage.getItem('dina_active_session');
        if (existingSession) {
            setSessionId(existingSession);
            sessionIdRef.current = existingSession;
            // Fetch history from API to restore chat on refresh
            try {
                const res = await fetch(`${CHAT_API_BASE}/message.php?action=history&session_id=${existingSession}`);
                const data = await res.json();
                if (data.status && data.data?.messages?.length > 0) {
                    const loadedMessages = [];
                    const loadedHistory = [];
                    
                    let lastBotQuestions = null;
                    
                    data.data.messages.forEach((msg, index) => {
                        if (msg.sender_type === 'user' || msg.sender_type === 'bot' || msg.sender_type === 'cs') {
                            const utcDateStr = msg.created_at.includes('Z') ? msg.created_at : msg.created_at.replace(' ', 'T') + 'Z';
                            const msgId = new Date(utcDateStr).getTime() + index; // + index to ensure unique IDs if messages have same timestamp
                            
                            let finalText = msg.message;
                            let isEmergency = false;
                            let showWhatsApp = false;

                            if (msg.sender_type === 'bot' || msg.sender_type === 'cs') {
                                const { cleanText, questions } = extractQuickQuestions(msg.message);
                                isEmergency = msg.message.includes('[EMERGENCY]');
                                showWhatsApp = msg.message.includes('[WHATSAPP]');
                                finalText = cleanText.replace(/\[EMERGENCY\]/g, '').replace(/\[WHATSAPP\]/g, '').trim();
                                
                                if (questions && questions.length > 0) {
                                    lastBotQuestions = questions;
                                }
                            }
                            
                            loadedMessages.push({
                                id: msgId,
                                type: msg.sender_type === 'cs' ? 'bot' : msg.sender_type,
                                text: finalText,
                                isEmergency,
                                showWhatsApp
                            });
                            
                            loadedHistory.push({
                                role: msg.sender_type === 'user' ? 'user' : 'assistant',
                                content: msg.message
                            });
                        }
                    });
                    
                    if (loadedMessages.length > 0) {
                        setMessages(loadedMessages);
                        conversationHistory.current = loadedHistory;
                        if (lastBotQuestions) {
                            setQuickQuestions(lastBotQuestions);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to restore session history', err);
            }
            return existingSession;
        }
        // No existing session — don't create yet, wait until user sends first message
        return null;
    };

    // Create session on demand (lazy — only when user sends first message)
    const ensureSession = async () => {
        const existing = sessionIdRef.current || localStorage.getItem('dina_active_session');
        if (existing) {
            sessionIdRef.current = existing;
            return existing;
        }

        const deviceInfo = getDeviceInfo();
        const result = await chatAPI.createSession(deviceInfo);
        if (result?.status && result.data?.session_id) {
            const newId = result.data.session_id;
            localStorage.setItem('dina_active_session', newId);
            setSessionId(newId);
            sessionIdRef.current = newId;
            return newId;
        }
        return null;
    };

    // Initialize session on first chat open
    useEffect(() => {
        if (isOpen && !sessionId) {
            initSession();
        }
    }, [isOpen]);

    // Save message to backend (fire-and-forget)
    const saveMessageToBackend = (senderType, message, metadata = null) => {
        const sid = sessionIdRef.current || sessionId || localStorage.getItem('dina_active_session');
        if (!sid) return;
        chatAPI.sendMessage(sid, senderType, message, metadata).catch(() => {});
    };

    // Clear chat & reset (no new session created until user sends message)
    const handleClearChat = async () => {
        if (isLoading) return;
        const currentSession = sessionId || localStorage.getItem('dina_active_session');
        
        // Close current session
        if (currentSession) {
            chatAPI.closeSession(currentSession);
            // Save to closed sessions list
            const closedSessions = JSON.parse(localStorage.getItem('dina_closed_sessions') || '[]');
            if (!closedSessions.includes(currentSession)) {
                closedSessions.unshift(currentSession);
                localStorage.setItem('dina_closed_sessions', JSON.stringify(closedSessions.slice(0, 50)));
            }
        }

        // Reset state — no new session yet
        setMessages(getInitialMessages());
        setQuickQuestions(['Info Harga Kendaraan', 'Booking Service', 'Lokasi Dealer']);
        conversationHistory.current = [];
        nopolContext.current = '';
        slotContext.current = '';
        localStorage.removeItem('dina_active_session');
        setSessionId(null);
        sessionIdRef.current = null;
    };

    // Rotating loading status messages
    const loadingMessages = [
        'DINA sedang mengetik...',
        'Sedang membaca database...',
        'Mencari data akurat...',
        'Memproses informasi...',
        'Menyiapkan jawaban terbaik...',
        'Mengecek data terbaru...',
        'Sedang menganalisis...',
        'Memverifikasi informasi...'
    ];

    useEffect(() => {
        if (!isLoading) {
            setLoadingStatus('DINA sedang mengetik...');
            return;
        }
        let index = 0;
        setLoadingStatus(loadingMessages[0]);
        const interval = setInterval(() => {
            index = (index + 1) % loadingMessages.length;
            setLoadingStatus(loadingMessages[index]);
        }, 2000);
        return () => clearInterval(interval);
    }, [isLoading]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isFullscreen]);

    // Listen for custom event to open chat with a pre-filled message
    useEffect(() => {
        const handler = (e) => {
            const msg = e.detail?.message;
            if (msg) {
                pendingMessage.current = msg;
                setIsOpen(true);
            }
        };
        window.addEventListener('openDinaChat', handler);
        return () => window.removeEventListener('openDinaChat', handler);
    }, []);

    // Send pending message once chat is open
    useEffect(() => {
        if (isOpen && pendingMessage.current) {
            const msg = pendingMessage.current;
            pendingMessage.current = null;
            // Small delay to let chat render first
            setTimeout(() => handleSend(msg), 300);
        }
    }, [isOpen]);

    // Prevent body scroll when chat is fullscreen (either explicit on desktop or implicit on mobile)
    useEffect(() => {
        if (isOpen && (isFullscreen || window.innerWidth < 768)) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isFullscreen]);

    // Extract quick questions from response text
    const extractQuickQuestions = (text) => {
        const lines = text.split('\n');
        const questions = [];
        const cleanedLines = [];

        for (const line of lines) {
            const match = line.match(/^💬\s*(.+)/);
            if (match) {
                questions.push(match[1].trim());
            } else {
                cleanedLines.push(line);
            }
        }

        return {
            cleanText: cleanedLines.join('\n').trim(),
            questions: questions.length > 0 ? questions : quickQuestions
        };
    };

    // Extract nopol pattern from user text. Returns cleaned nopol string or null.
    const extractNopol = (text) => {
        const clean = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Pattern 1: Full plate — 1-2 letters + 1-4 digits + 0-3 letters (e.g. B1157DOS)
        const fullMatch = clean.match(/^([A-Z]{1,2})(\d{1,4})([A-Z]{0,3})$/);
        if (fullMatch) return clean;

        // Pattern 2: No prefix letter — digits + 1-3 letters (e.g. 1157DOS → auto B)
        const noPrefix = clean.match(/^(\d{1,4})([A-Z]{1,3})$/);
        if (noPrefix) return 'B' + clean;

        // Pattern 3: Try to find nopol inside a longer sentence
        // e.g. "nopol saya B1157DOS" or "plat nomor 1157dos"
        const embedded = text.toUpperCase().replace(/\s+/g, ' ').match(/\b([A-Z]{1,2}\d{1,4}[A-Z]{0,3})\b/);
        if (embedded) return embedded[1];

        // Pattern 4: Embedded digits+letters without prefix
        const embeddedNoPrefix = text.toUpperCase().replace(/\s+/g, ' ').match(/\b(\d{1,4}[A-Z]{1,3})\b/);
        if (embeddedNoPrefix) return 'B' + embeddedNoPrefix[1];

        // Pattern 5: User sends with spaces like "B 1157 DOS"
        const spaced = text.toUpperCase().match(/([A-Z]{1,2})\s*(\d{1,4})\s*([A-Z]{0,3})/);
        if (spaced && spaced[2]) return (spaced[1] || 'B') + spaced[2] + (spaced[3] || '');

        return null;
    };

    // Check if conversation is in booking service context
    const isBookingContext = () => {
        const allMessages = conversationHistory.current.slice(-8);
        const keywords = ['booking', 'service', 'servis', 'nopol', 'nomor polisi', 'plat nomor', 'plat', 'kendaraan', 'mobil', 'polisi'];
        return allMessages.some(m =>
            keywords.some(kw => m.content.toLowerCase().includes(kw))
        );
    };

    // Build nopol context string for the system prompt
    const buildNopolContext = (data) => {
        if (!data.status || !data.data) return '';

        const d = data.data;
        const maskedTelp = d.telp ? `xxxx-xxxx-${d.telp.slice(-4)}` : 'Tidak tersedia';

        let ctx = `**Status:** Data ditemukan ✅\n`;
        ctx += `**Nama:** ${d.nama}\n`;
        ctx += `**Kendaraan:** ${d.kendaraan}\n`;
        ctx += `**Telp (masked):** ${maskedTelp}\n`;

        if (d.riwayat && d.riwayat.length > 0) {
            ctx += `\n**Riwayat Service (${d.riwayat.length} record, terbaru 3):**\n`;
            d.riwayat.slice(0, 3).forEach((r, i) => {
                ctx += `${i + 1}. Tanggal: ${r.tanggal} ${r.jam} | Jenis: ${r.jenis}${r.keluhan ? ` | Keluhan: ${r.keluhan}` : ''}\n`;
            });
        }

        ctx += `\nINSTRUKSI: Tampilkan data ini ke customer untuk konfirmasi. Untuk nomor telepon, tampilkan versi MASKED saja (xxxx-xxxx-${d.telp.slice(-4)}). JANGAN tampilkan nomor telepon lengkap.`;

        return ctx;
    };

    // Extract date pattern from user text for slot checking
    const extractDateFromText = (text) => {
        const clean = text.toLowerCase();
        const bookingDates = getBookingDates();
        
        // Check for ISO date pattern (2026-04-25)
        const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) return isoMatch[1];
        
        // Check for DD/MM/YYYY or DD-MM-YYYY
        const dmyMatch = text.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (dmyMatch) {
            return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}`;
        }

        // Check for day numbers matching booking dates (suggested dates)
        for (const d of bookingDates) {
            const dayStr = String(d.day);
            const dayName = d.dayName.toLowerCase();
            if (clean.includes(`tanggal ${dayStr}`) || clean.includes(`tgl ${dayStr}`) || clean.includes(dayName)) {
                return d.iso;
            }
        }

        // Check for arbitrary "tanggal X" or "tgl X" beyond the 3 suggested dates
        const tanggalMatch = clean.match(/(?:tanggal|tgl)\s+(\d{1,2})/);
        if (tanggalMatch && isBookingContext()) {
            const dayNum = parseInt(tanggalMatch[1]);
            const jakarta = getCurrentJakartaTime();
            // Assume current month/year if day is >= today, otherwise next month
            let targetMonth = jakarta.monthNum;
            let targetYear = jakarta.year;
            if (dayNum < jakarta.day) {
                targetMonth += 1;
                if (targetMonth > 12) { targetMonth = 1; targetYear += 1; }
            }
            return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        }

        // Check for "besok"/"besuk" → tomorrow
        if (clean.includes('besok') || clean.includes('besuk')) {
            return bookingDates[0]?.iso || null;
        }
        // Check for "lusa" → day after tomorrow
        if (clean.includes('lusa')) {
            return bookingDates[1]?.iso || null;
        }

        // Check for option number "1", "2", "3" or "pilihan 1" etc
        const optMatch = clean.match(/(?:pilihan|opsi|nomor|no\.?)?\s*([1-3])/);
        if (optMatch && isBookingContext()) {
            const idx = parseInt(optMatch[1]) - 1;
            if (bookingDates[idx]) return bookingDates[idx].iso;
        }

        return null;
    };

    // Build slot context string for the system prompt
    const buildSlotContext = (slotData, targetDate) => {
        if (!slotData.status) return '';

        // Detect if target date is a Sunday
        const targetDateObj = new Date(targetDate + 'T00:00:00');
        const isSunday = targetDateObj.getDay() === 0;

        // Sunday: only 08:00-11:00, max 3 per hour. Other days: normal capacity.
        const maxPerHour = isSunday
            ? { '08:00': 3, '09:00': 3, '10:00': 3, '11:00': 3 }
            : { '08:00': 6, '09:00': 6, '10:00': 6, '11:00': 6, '13:00': 3 };
        
        let ctx = `**Ketersediaan Slot untuk ${slotData.hari}, ${slotData.tanggal}:**\n`;
        ctx += `Total booking hari ini: ${slotData.total_booking}\n\n`;
        
        const jamEntries = slotData.jam || {};
        const availableSlots = [];
        const fullSlots = [];

        for (const [jam, count] of Object.entries(jamEntries)) {
            // Skip jam 12:00 and 14:00 (not offered)
            if (jam === '12:00' || jam === '14:00') continue;
            
            const max = maxPerHour[jam] || 6;
            const remaining = max - count;
            
            if (remaining > 0) {
                availableSlots.push({ jam, remaining, count, max });
                ctx += `- Jam **${jam}**: ${remaining} slot tersisa (${count}/${max} terisi)\n`;
            } else {
                fullSlots.push(jam);
                ctx += `- Jam **${jam}**: **PENUH** (${count}/${max})\n`;
            }
        }

        if (fullSlots.length > 0) {
            ctx += `\n⚠️ Jam yang sudah PENUH: ${fullSlots.join(', ')}\n`;
        }
        if (availableSlots.length === 0) {
            ctx += `\n❌ SEMUA SLOT untuk tanggal ini sudah PENUH. Sarankan tanggal lain.\n`;
        }

        ctx += `\nINSTRUKSI: Tawarkan HANYA jam yang masih tersedia (remaining > 0). Jangan tawarkan jam yang sudah PENUH. Ingat jam 13:00 HANYA untuk service kecil.`;

        return ctx;
    };

    const handleSend = async (text = inputValue) => {
        if (!text.trim() || isLoading) return;

        // Ensure we have a session (create lazily on first message)
        if (!sessionIdRef.current && !localStorage.getItem('dina_active_session')) {
            const newSid = await ensureSession();
            console.log('[DINA] Session created:', newSid);
        }

        const userMsg = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        // Save user message to backend
        console.log('[DINA] Saving user msg, sessionRef:', sessionIdRef.current, 'localStorage:', localStorage.getItem('dina_active_session'));
        saveMessageToBackend('user', text);

        // Add to conversation history
        conversationHistory.current.push({ role: 'user', content: text });

        // Check if user sent a nopol in booking context
        const detectedNopol = extractNopol(text);
        if (detectedNopol && isBookingContext()) {
            try {
                const nopolData = await fetchNopolData(detectedNopol);
                if (nopolData.status && nopolData.data) {
                    nopolContext.current = buildNopolContext(nopolData);
                    // Add system context as an assistant-invisible note
                    conversationHistory.current.push({
                        role: 'system',
                        content: `[SISTEM] Data nopol berhasil ditemukan. Berikut datanya:\n${nopolContext.current}`
                    });
                } else {
                    conversationHistory.current.push({
                        role: 'system',
                        content: `[SISTEM] Data nopol "${text}" TIDAK ditemukan di sistem. Informasikan ke customer bahwa datanya belum terdaftar, dan minta customer untuk memberikan: Nama Lengkap, Model Kendaraan, dan Nomor HP secara manual.`
                    });
                }
            } catch (err) {
                console.error('Nopol fetch error:', err);
            }
        }

        // Check if user mentioned a date in booking context — fetch slot availability
        if (isBookingContext()) {
            const detectedDate = extractDateFromText(text);
            if (detectedDate) {
                try {
                    const slotData = await fetchSlotJam(detectedDate);
                    if (slotData.status) {
                        const ctx = buildSlotContext(slotData, detectedDate);
                        slotContext.current = ctx;
                        conversationHistory.current.push({
                            role: 'system',
                            content: `[SISTEM] Data ketersediaan slot booking untuk tanggal ${detectedDate}:\n${ctx}`
                        });
                    } else if (slotData.keterangan_libur) {
                        // Holiday detected
                        conversationHistory.current.push({
                            role: 'system',
                            content: `[SISTEM] Tanggal ${slotData.tanggal || detectedDate} adalah HARI LIBUR: **${slotData.keterangan_libur}**. Bengkel TIDAK beroperasi pada tanggal tersebut. Informasikan ke customer bahwa tanggal tersebut libur (sebutkan keterangan liburnya: "${slotData.keterangan_libur}"), dan sarankan untuk memilih tanggal lain.`
                        });
                    } else {
                        conversationHistory.current.push({
                            role: 'system',
                            content: `[SISTEM] Tidak dapat mengambil data slot untuk tanggal ${detectedDate}. Informasikan ke customer bahwa sistem sedang gangguan dan minta untuk mencoba lagi.`
                        });
                    }
                } catch (err) {
                    console.error('Slot fetch error:', err);
                }
            }
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'DINA - Dwindo Intelligent Assistant'
                },
                body: JSON.stringify({
                    model: import.meta.env.VITE_OPENROUTER_MODEL,
                    messages: [
                        { role: 'system', content: buildSystemPrompt(nopolContext.current, slotContext.current) },
                        ...conversationHistory.current
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]?.message?.content) {
                const rawText = data.choices[0].message.content;

                // Add to conversation history
                conversationHistory.current.push({ role: 'assistant', content: rawText });

                // Save bot response to backend
                saveMessageToBackend('bot', rawText);

                // Extract quick questions
                const { cleanText, questions } = extractQuickQuestions(rawText);

                // Detect emergency tag
                const isEmergency = rawText.includes('[EMERGENCY]');
                const showWhatsApp = rawText.includes('[WHATSAPP]');
                const finalText = cleanText.replace(/\[EMERGENCY\]/g, '').replace(/\[WHATSAPP\]/g, '').trim();

                setQuickQuestions(questions);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: finalText,
                    showLocationButton: isEmergency,
                    showWhatsAppButton: showWhatsApp
                }]);
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('API Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Mohon maaf, DINA sedang mengalami gangguan teknis. Silakan hubungi kami langsung melalui WhatsApp atau kunjungi **Dwindo Bintaro**.',
                showWhatsAppButton: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle location sharing for emergency
    const handleShareLocation = (msgId) => {
        if (!navigator.geolocation) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'bot',
                text: 'Mohon maaf, browser Anda tidak mendukung fitur lokasi. Silakan kirimkan alamat lengkap Anda secara manual.'
            }]);
            return;
        }

        // Update button state
        setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, locationLoading: true } : m
        ));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Remove location button from original message
                setMessages(prev => prev.map(m =>
                    m.id === msgId ? { ...m, showLocationButton: false, locationLoading: false } : m
                ));

                // Add map message
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'location',
                    lat: latitude,
                    lng: longitude
                }]);

                // Send coordinates to conversation
                const locationText = `Lokasi saya: ${latitude}, ${longitude}`;
                conversationHistory.current.push({ role: 'user', content: locationText });
                conversationHistory.current.push({
                    role: 'system',
                    content: `[SISTEM] Customer telah membagikan lokasi GPS: Lat ${latitude}, Lng ${longitude}. Google Maps: https://www.google.com/maps?q=${latitude},${longitude}. MINTA customer untuk memberikan DETAIL ALAMAT (nama jalan, patokan, RT/RW) untuk memudahkan tim menemukan lokasi.`
                });

                // Auto-ask for address detail
                handleSend(`Saya sudah share lokasi saya di koordinat ${latitude}, ${longitude}`);
            },
            (error) => {
                setMessages(prev => prev.map(m =>
                    m.id === msgId ? { ...m, locationLoading: false } : m
                ));
                let errMsg = 'Tidak dapat mengakses lokasi.';
                if (error.code === 1) errMsg = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser Anda, lalu coba lagi.';
                if (error.code === 2) errMsg = 'Lokasi tidak tersedia saat ini.';
                if (error.code === 3) errMsg = 'Waktu permintaan lokasi habis.';
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'bot',
                    text: `⚠️ ${errMsg} Silakan kirimkan alamat lengkap Anda secara manual.`
                }]);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    // Leaflet map component
    const LocationMap = ({ lat, lng }) => {
        const mapRef = useRef(null);
        const mapInstanceRef = useRef(null);

        useEffect(() => {
            if (!mapRef.current || mapInstanceRef.current) return;

            const map = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false
            }).setView([lat, lng], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            // Custom red marker
            const icon = L.divIcon({
                html: `<div style="width:24px;height:24px;background:#E60012;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                className: ''
            });

            L.marker([lat, lng], { icon }).addTo(map);
            mapInstanceRef.current = map;

            return () => { map.remove(); mapInstanceRef.current = null; };
        }, [lat, lng]);

        return (
            <div className="flex justify-start">
                <div className="max-w-[85%] bg-white border border-[#E5E5E5] overflow-hidden" style={{ borderRadius: '0 12px 12px 12px' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '180px' }} />
                    <div className="p-2 flex items-center justify-between gap-2 border-t border-[#E5E5E5]">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <MapPin size={12} className="text-[#E60012]" />
                            <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#E60012] hover:underline flex items-center gap-1"
                        >
                            <Navigation size={10} /> Buka Maps
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-white flex flex-col overflow-hidden ${isFullscreen
                            ? 'fixed inset-0 w-full h-full z-[100]'
                            : 'fixed inset-0 w-full h-full z-[100] md:static md:w-[400px] md:h-[500px] md:mb-4 md:z-auto md:shadow-2xl md:border md:border-[#E5E5E5]'
                            }`}
                    >
                        {/* Header */}
                        <div className="bg-[#111111] p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#E60012] flex items-center justify-center" style={{ clipPath: ANGULAR_CLIP }}>
                                    <MessageSquare size={16} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-[14px] tracking-widest uppercase">DINA</h3>
                                    <p className="text-[10px] text-gray-400">Dwindo Intelligent Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleClearChat}
                                    disabled={isLoading}
                                    title="Bersihkan Chat"
                                    className="text-white hover:text-[#E60012] transition-colors disabled:opacity-30"
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="hidden md:block text-white hover:text-[#E60012] transition-colors">
                                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#E60012] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F5]">
                            {messages.map((msg) => {
                                // Location map message
                                if (msg.type === 'location') {
                                    return <LocationMap key={msg.id} lat={msg.lat} lng={msg.lng} />;
                                }

                                return (
                                    <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`max-w-[80%] p-3 text-[13px] leading-relaxed ${msg.type === 'user'
                                                ? 'bg-[#111111] text-white'
                                                : 'bg-white text-[#444444] border border-[#E5E5E5]'
                                                }`}
                                            style={{ borderRadius: msg.type === 'user' ? '12px 12px 0 12px' : '0 12px 12px 12px' }}
                                        >
                                            {msg.type === 'bot' ? (
                                                <div
                                                    className="prose-sm prose-neutral [&_strong]:font-bold [&_em]:italic [&_a]:text-[#E60012] [&_a]:underline [&_hr]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#E60012] [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-[11px] [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:text-[12px]"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                                                />
                                            ) : (
                                                msg.text
                                            )}
                                        </div>

                                        <div className="text-[10px] text-gray-400 mt-1 px-1">
                                            {new Date(msg.id).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </div>

                                        {/* Emergency Location Button */}
                                        {msg.showLocationButton && (
                                            <button
                                                onClick={() => handleShareLocation(msg.id)}
                                                disabled={msg.locationLoading}
                                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#E60012] text-white text-[11px] font-display font-bold uppercase tracking-wider hover:bg-[#B5000F] transition-colors disabled:opacity-60"
                                                style={{ clipPath: ANGULAR_CLIP }}
                                            >
                                                {msg.locationLoading ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Mengakses Lokasi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin size={14} />
                                                        Berikan Lokasi Saya
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* WhatsApp CS Button */}
                                        {msg.showWhatsAppButton && (
                                            <a
                                                href="https://wa.me/6287782788383?text=Halo%20Dwindo%2C%20saya%20butuh%20bantuan"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-[11px] font-display font-bold uppercase tracking-wider hover:bg-[#1da851] transition-colors"
                                                style={{ clipPath: ANGULAR_CLIP }}
                                            >
                                                <Phone size={14} />
                                                Hubungi CS Kami
                                            </a>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Typing indicator with rotating status */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-[#E5E5E5] p-3 flex items-center gap-2" style={{ borderRadius: '0 12px 12px 12px' }}>
                                        <Loader2 size={14} className="animate-spin text-[#E60012]" />
                                        <span className="text-[12px] text-gray-400 italic transition-opacity duration-300" key={loadingStatus}>{loadingStatus}</span>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <div className="p-2 flex gap-2 overflow-x-auto bg-white border-t border-[#E5E5E5] scrollbar-hide">
                            {quickQuestions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(action)}
                                    disabled={isLoading}
                                    className="whitespace-nowrap px-3 py-1 bg-[#F5F5F5] border border-[#E5E5E5] text-[10px] font-display font-bold uppercase tracking-wider text-[#444444] hover:border-[#E60012] hover:text-[#E60012] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-[#E5E5E5] flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik pesan Anda..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent text-[16px] md:text-[13px] outline-none focus:border-[#E60012] transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !inputValue.trim()}
                                className="text-[#E60012] hover:text-[#B5000F] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                id="chat-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 bg-[#E60012] shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 ${isOpen && (isFullscreen || window.innerWidth < 768) ? 'hidden md:flex md:hidden' : ''}`}
                style={{ clipPath: ANGULAR_CLIP }}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

export default VirtualCS;
