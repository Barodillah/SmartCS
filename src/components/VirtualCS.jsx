import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowRight, Maximize2, Minimize2, Loader2, MapPin, Navigation, Phone, RotateCcw, Calculator, Check } from 'lucide-react';
import { ANGULAR_CLIP } from '../utils/constants';
import { parseChatMarkdown } from '../utils/markdownParser';
let priceListData = defaultPriceListData;
let aiArticleData = [];
import defaultPriceListData from '../../knowledge/price_list.json';
import dealerData from '../../knowledge/lokasi_dealer.json';
import promoData from '../../knowledge/promo/promo_dsf_april_2026.json';
import referralData from '../../knowledge/promo/progam_referral.json';
import destinatorData from '../../knowledge/fitur/destinator.json';
import simulasiKreditData from '../../knowledge/simulasi_kredit.json';
import sparepartData from '../../knowledge/sparepart.json';
import perawatanBerkalaData from '../../knowledge/mitsubishi_perawatan_berkala.json';
import aksesorisData from '../../knowledge/aksesoris.json';
import extendedSmartPackageData from '../../knowledge/extended_smart_package.json';
import softSellingData from '../../knowledge/soft_selling_additional_services.json';
import SimulasiKreditModal from './SimulasiKreditModal';
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
    },
    saveLead: async (leadData) => {
        try {
            const res = await fetch(`${CHAT_API_BASE}/lead.php?action=create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            return await res.json();
        } catch (e) { console.error('Lead save error:', e); return null; }
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


// --- Fetch AI Articles ---
const fetchAiArticles = async (keyword = '') => {
    try {
        const url = `https://csdwindo.com/api/artikel/ai_list.php${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status && data.data) {
            aiArticleData = data.data;
            return data.data;
        }
    } catch (e) {
        console.error('Failed to fetch ai article list', e);
    }
    return [];
};

// --- Keyword Generator for Articles ---
const generateKeyword = (text) => {
    if (!text) return '';
    
    const stopWords = ['saya', 'mau', 'ingin', 'tanya', 'ada', 'apa', 'bagaimana', 'kenapa', 'dimana', 'kapan', 'siapa', 'berapa', 'yang', 'dengan', 'untuk', 'dari', 'pada', 'adalah', 'itu', 'ini', 'bisa', 'tolong', 'bantu', 'kasih', 'terima', 'mohon', 'info', 'dong', 'ya', 'kah', 'lebih', 'paling', 'sangat', 'sekali'];
    
    const clean = text.toLowerCase().replace(/[^\w\s]/gi, ' ').trim();
    const words = clean.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

    if (words.length === 0) return '';

    const selectedKeywords = [];

    // 1. Models (Max 1)
    const models = ['xpander', 'pajero', 'xforce', 'triton', 'destinator', 'l300', 'fuso', 'colt', 'canter'];
    const foundModel = words.find(w => models.includes(w));
    if (foundModel) selectedKeywords.push(foundModel);

    // 2. Categories/Services (Max 1-2)
    const categories = ['promo', 'harga', 'service', 'servis', 'bengkel', 'lokasi', 'alamat', 'kredit', 'cicilan', 'dp', 'test drive', 'emergency', 'darurat', 'sparepart', 'onderdil', 'aksesoris', 'oli', 'ban', 'mesin', 'aki', 'rem', 'bunga', 'tenor', 'asuransi'];
    const foundCategories = words.filter(w => categories.includes(w) && !selectedKeywords.includes(w));
    
    // Add up to 2 categories
    foundCategories.slice(0, 2).forEach(c => selectedKeywords.push(c));

    // 3. Fill up with longest remaining words if still less than 3
    if (selectedKeywords.length < 3) {
        const remaining = words
            .filter(w => !selectedKeywords.includes(w))
            .sort((a, b) => b.length - a.length);
        
        while (selectedKeywords.length < 3 && remaining.length > 0) {
            selectedKeywords.push(remaining.shift());
        }
    }

    return selectedKeywords.slice(0, 3).join(' ');
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
    // Build price list context
    const buildPassengerPriceContext = () => {
        const cars = priceListData.passenger_car;
        let text = '';
        for (const [key, data] of Object.entries(cars)) {
            const name = key.split('_').join(' ');
            text += `\n**${name.toUpperCase()}**\n`;
            if (data.image) text += `[GAMBAR: ${data.image}]\n`;
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
            if (data.image) text += `[GAMBAR: ${data.image}]\n`;
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
        let text = `**Region:** ${simulasiKreditData.metadata.region} (${simulasiKreditData.metadata.last_updated})\n\n`;

        text += `**Data OTR Tangerang (Referensi):**\n`;
        if (simulasiKreditData.mitsubishi_models_otr_tangerang) {
            for (const [model, variants] of Object.entries(simulasiKreditData.mitsubishi_models_otr_tangerang)) {
                text += `- ${model.replace(/_/g, ' ')}:\n`;
                for (const [vName, price] of Object.entries(variants)) {
                    if (typeof price === 'number') {
                        text += `  • ${vName.replace(/_/g, ' ')}: Rp ${price.toLocaleString('id-ID')}\n`;
                    }
                }
            }
        } else {
            text += `(Lihat harga OTR dari referensi Daftar Harga Passenger Car)\n`;
        }

        text += `\n**Pilihan Leasing & Suku Bunga:**\n`;
        for (const [provider, data] of Object.entries(simulasiKreditData.leasing_providers)) {
            const pName = provider.replace(/_/g, ' ');
            text += `- **${pName}**${data.is_captive ? ' (Captive Finance)' : ''}:\n`;

            if (data.programs) {
                data.programs.forEach(prog => {
                    text += `  • Program: ${prog.name}\n`;
                    if (prog.interest_rate !== undefined) text += `    - Bunga: ${(prog.interest_rate * 100).toFixed(2)}%\n`;
                    if (prog.interest_rates_flat) {
                        text += `    - Suku Bunga Flat:\n`;
                        for (const [tenor, rate] of Object.entries(prog.interest_rates_flat)) {
                            text += `      - ${tenor.replace('_', ' ')}: ${(rate * 100).toFixed(2)}%\n`;
                        }
                    }
                    text += `    - Syarat: ${prog.structure || `Min DP ${(prog.min_dp * 100)}%`}\n`;
                });
            }

            if (data.interest_rates_flat_2025) {
                text += `  • Suku Bunga Flat (2025):\n`;
                for (const [tenor, rate] of Object.entries(data.interest_rates_flat_2025)) {
                    text += `    - ${tenor.replace('_', ' ')}: ${(rate * 100).toFixed(2)}%\n`;
                }
            }

            if (data.admin_fee) {
                text += `  • Admin Fee: Rp ${data.admin_fee.toLocaleString('id-ID')}\n`;
            }
        }

        const gf = simulasiKreditData.global_fees_and_insurance;
        text += `\n**Global Fees & Asuransi:**\n`;
        text += `- Provisi: ${(gf.provision_rate * 100)}% dari Plafon Kredit\n`;
        text += `- Asuransi All Risk (Region 2):\n`;
        for (const [cat, rate] of Object.entries(gf.insurance_all_risk_region2)) {
            text += `  • ${cat.replace(/_/g, ' ')}: ${(rate * 100).toFixed(2)}%\n`;
        }
        text += `- Fidusia:\n`;
        gf.fidusia_ranges.forEach(r => {
            text += `  • Plafon s/d Rp ${r.max_loan.toLocaleString('id-ID')}: Rp ${r.fee.toLocaleString('id-ID')}\n`;
        });

        return text;
    };

    const buildSparepartContext = () => {
        let text = '';
        const meta = sparepartData.metadata;
        text += `**${meta.judul}**\n`;
        text += `${meta.keterangan}\n`;
        text += `**Catatan:**\n`;
        meta.catatan_penting.forEach(c => {
            text += `- ${c}\n`;
        });
        text += `\n**Daftar Spare Part (${meta.total_unique_part} part):**\n`;
        sparepartData.spare_parts.forEach(part => {
            const hargaFormatted = part.harga_satuan.toLocaleString('id-ID');
            text += `- [${part.kategori}] ${part.nomor_part} — ${part.nama} | Harga: Rp ${hargaFormatted} | Untuk: ${part.digunakan_pada.join(', ')} | Status: ${part.status}\n`;
        });
        text += `\nModel referensi: ${meta.model_referensi.join(', ')}\n`;
        return text;
    };

    const buildAksesorisContext = () => {
        let text = '';
        const accessories = aksesorisData.mitsubishi_accessories;
        const modelList = [];

        for (const [modelKey, categories] of Object.entries(accessories)) {
            const modelName = modelKey.replace(/_/g, ' ');
            modelList.push(modelName);
            text += `\n**${modelName.toUpperCase()}**\n`;

            // Build a lookup map for individual prices in this model
            const individualPrices = {};
            if (categories.exterior) {
                categories.exterior.forEach(i => individualPrices[i.item] = i.price);
            }
            if (categories.interior) {
                categories.interior.forEach(i => individualPrices[i.item] = i.price);
            }

            for (const [category, items] of Object.entries(categories)) {
                const catLabel = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                text += `*${catLabel}:*\n`;
                items.forEach(item => {
                    let itemText = `- ${item.item}: Rp ${item.price.toLocaleString('id-ID')}`;
                    if (item.img) itemText += ` | [GAMBAR: ${item.img}]`;

                    if (item.include && item.include.length > 0) {
                        let totalSatuan = 0;
                        const includeDetails = item.include.map(inc => {
                            const price = individualPrices[inc] || 0;
                            totalSatuan += price;
                            return `${inc} (Rp ${price.toLocaleString('id-ID')})`;
                        });

                        itemText += `\n  - Item Termasuk: ${includeDetails.join(', ')}`;
                        if (totalSatuan > 0) {
                            const hemat = totalSatuan - item.price;
                            itemText += `\n  - Total Harga Satuan: Rp ${totalSatuan.toLocaleString('id-ID')} (Lebih hemat Rp ${hemat.toLocaleString('id-ID')} jika beli paket)`;
                        }
                    }
                    text += itemText + '\n';
                });
            }
        }

        text += `\nModel yang tersedia data aksesorisnya: ${modelList.join(', ')}\n`;
        return text;
    };

    const buildExtendedSmartPackageContext = () => {
        let text = '';
        const esp = extendedSmartPackageData.extended_smart_package;

        text += `**Keuntungan Perpanjangan Smart Paket Service:**\n`;
        text += `- Hemat biaya: ${esp.benefits.cost_saving}\n`;
        esp.benefits.free_services.forEach(s => {
            text += `- ${s}\n`;
        });
        text += `**Benefit Tambahan:**\n`;
        esp.benefits.additional_benefits.forEach(b => {
            text += `- ${b}\n`;
        });

        // Xpander Series
        const xp = esp.xpander_series;
        text += `\n**Xpander Series** (berlaku untuk: ${xp.include_car_variant.join(', ')})\n`;
        text += `Berlaku efektif: ${xp.effective_date}\n`;
        text += `Harga (termasuk PPN):\n`;
        xp.prices_including_vat.forEach(p => {
            text += `- Paket ${p.type}: Rp ${p.after.toLocaleString('id-ID')}\n`;
        });

        // Pajero Sport
        const ps = esp.pajero_sport;
        text += `\n**Pajero Sport**\n`;
        text += `Berlaku efektif: ${ps.effective_date}\n`;
        text += `Harga (termasuk PPN):\n`;
        ps.prices_including_vat.forEach(p => {
            text += `- Paket ${p.type}: Rp ${p.price.toLocaleString('id-ID')}\n`;
        });

        text += `\nKeterangan tipe paket: 2XPM = 2x perawatan major, 4XPM = 4x perawatan major, 6XPM = 6x perawatan major\n`;

        return text;
    };

    const buildSoftSellingACContext = () => {
        let text = '';
        const ss = softSellingData;

        text += `**Kategori:** ${ss.category}\n`;
        text += `**Interval Service AC Berkala:** ${ss.soft_selling.routine_service.interval}\n\n`;

        text += `**Pentingnya Service AC:**\n`;
        ss.knowledge.importance_of_ac_service.forEach(s => { text += `- ${s}\n`; });

        text += `\n**Dampak AC Tanpa Service:**\n`;
        for (const [part, effects] of Object.entries(ss.knowledge.ac_without_service_effect)) {
            text += `- *${part}:* ${effects.join('; ')}\n`;
        }

        text += `\n**Soft Selling Messages:**\n`;
        for (const [key, val] of Object.entries(ss.soft_selling)) {
            text += `- ${key}: ${val.message}${val.interval ? ` (Interval: ${val.interval})` : ''}\n`;
        }

        text += `\n**Harga Paket Service AC Berkala:**\n`;
        ss.pricing.paket_berkala.forEach(p => {
            text += `- ${p.name}: Tipe A Rp ${p.A.toLocaleString('id-ID')} / Tipe B Rp ${p.B.toLocaleString('id-ID')}\n`;
        });

        text += `\n**Harga Service AC Lainnya:**\n`;
        ss.pricing.service.forEach(p => {
            text += `- ${p.name}: Tipe A Rp ${p.A.toLocaleString('id-ID')} / Tipe B Rp ${p.B.toLocaleString('id-ID')}\n`;
        });

        text += `\n**General Check AC meliputi:** ${ss.general_check.join(', ')}\n`;
        return text;
    };

    const buildPerawatanBerkalaContext = () => {
        let text = '';

        // Kebijakan free service
        const kebijakan = perawatanBerkalaData.kebijakan_free_service;
        text += `**Program Free Service MMKSI:**\n`;
        text += `- Cakupan: Service ${kebijakan.cakupan_km.map(k => k.toLocaleString('id-ID') + ' km').join(', ')} — ${kebijakan.keterangan_cakupan}\n`;
        text += `- Batas waktu: ${kebijakan.batas_waktu.durasi} sejak ${kebijakan.batas_waktu.acuan}\n`;
        text += `- ${kebijakan.batas_waktu.keterangan}\n`;
        text += `**Catatan Penting:**\n`;
        kebijakan.catatan_penting.forEach(c => {
            text += `- ${c}\n`;
        });
        text += `\n`;

        // Per kendaraan
        const kendaraanMap = perawatanBerkalaData.kendaraan;
        for (const [key, vehicle] of Object.entries(kendaraanMap)) {
            text += `\n### ${vehicle.nama_lengkap}\n`;

            // Interval antara (khusus CR45)
            if (vehicle.perawatan_interval_antara) {
                const ia = vehicle.perawatan_interval_antara;
                text += `**Servis Interval Antara** (KM ${ia.km_berlaku.map(k => k.toLocaleString('id-ID')).join(', ')}): Jasa Rp ${ia.jasa.toLocaleString('id-ID')} | Grand Total: Rp ${ia.grand_total.toLocaleString('id-ID')}\n`;
                text += `  Spare part: ${ia.spare_part.map(sp => sp.nama + ' x' + sp.qty).join(', ')}\n`;
            }

            // Per KM service
            for (const [kmKey, service] of Object.entries(vehicle.perawatan)) {
                const kmFormatted = Number(kmKey).toLocaleString('id-ID');
                const freeLabel = service.status_free_service ? '✅ FREE SERVICE' : '💰 BERBAYAR';
                text += `\n**Service ${kmFormatted} km** — ${freeLabel}\n`;
                text += `- Biaya Jasa: Rp ${service.jasa.toLocaleString('id-ID')}\n`;
                text += `- Spare Part yang diganti:\n`;
                service.spare_part.forEach(sp => {
                    text += `  • ${sp.nama} (${sp.nomor_part}) — Qty: ${sp.qty} — Rp ${sp.total.toLocaleString('id-ID')}\n`;
                });
                text += `- Subtotal Spare Part: Rp ${service.subtotal_spare_part.toLocaleString('id-ID')}\n`;
                text += `- PPN 10%: Rp ${service.ppn_10_persen.toLocaleString('id-ID')}\n`;
                text += `- **Grand Total: Rp ${service.grand_total.toLocaleString('id-ID')}**\n`;
            }
        }

        // Ringkasan biaya
        text += `\n### Ringkasan Estimasi Biaya Per Model\n`;
        for (const [modelKey, intervals] of Object.entries(perawatanBerkalaData.ringkasan_biaya)) {
            const modelName = kendaraanMap[modelKey]?.nama_lengkap || modelKey;
            text += `\n**${modelName}:**\n`;
            for (const [km, info] of Object.entries(intervals)) {
                if (km === 'interval_antara_5K_15K_dst') {
                    text += `- Interval antara (5K, 15K, dst): Rp ${info.grand_total.toLocaleString('id-ID')} — ${info.free_service ? 'FREE' : 'Berbayar'}\n`;
                } else {
                    text += `- ${Number(km).toLocaleString('id-ID')} km: Rp ${info.grand_total.toLocaleString('id-ID')} — ${info.free_service ? 'FREE' : 'Berbayar'}\n`;
                }
            }
        }

        return text;
    };

    const buildAiArticleContext = () => {
        if (!aiArticleData || aiArticleData.length === 0) return '';
        let text = `\n### Berita & Artikel Terbaru (Gunakan Jika Perlu Referensi Artikel)\n`;
        aiArticleData.forEach(item => {
            text += `- [ARTICLE:${item.slug}] ${item.title}: ${item.subtitle || ''} (Tags: ${item.tags || 'Tidak ada tag'})\n`;
        });
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
- Jika user bertanya soal **biaya service, estimasi service, perawatan berkala, apa saja yang dikerjakan saat service, service berapa km**: INI BUKAN BOOKING. Ini adalah pertanyaan informasi. Jawab langsung dari **Data Perawatan Berkala** di bawah. JANGAN menanyakan nopol. JANGAN masuk ke alur booking.
- Jika user secara eksplisit ingin **booking service / daftar service / jadwalkan service / buat janji service**: BARU ikuti alur booking service di bawah (yang meminta nopol).
- **BEDAKAN DENGAN JELAS:** "tanya biaya service" ≠ "booking service". "Mau tahu service 60.000 km" ≠ "mau booking service". Hanya jika customer menyatakan ingin **menjadwalkan/mendaftar/booking**, barulah masuk alur booking.
- Jika user bertanya **lokasi/alamat**: Langsung berikan informasi cabang dealer yang relevan.
- Jika user bertanya **test drive**: Tanyakan model yang diminati dan jadwal yang diinginkan, lalu minta nama & nomor HP.

## Alur Booking Service (PENTING — IKUTI URUTAN INI DENGAN KETAT)
**PERHATIAN:** Alur ini HANYA diikuti jika customer secara EKSPLISIT ingin **booking / daftar / jadwalkan service** (membuat janji service). Jika customer hanya bertanya **biaya service, estimasi service, apa yang dikerjakan saat service**, itu BUKAN booking — jawab langsung dari data perawatan berkala tanpa menanyakan nopol.

Keyword yang menandakan BOOKING: "booking service", "daftar service", "jadwalkan service", "buat janji service", "mau service", "mau servis".
Keyword yang menandakan TANYA INFO (BUKAN BOOKING): "biaya service", "estimasi service", "berapa harga service", "apa saja yang dikerjakan", "perawatan berkala", "tanya service", "info service".

### LANGKAH 1: Tanyakan Nopol
Customer bilang ingin booking service → Tanyakan **Nomor Polisi (Nopol)** kendaraannya.
**PENTING:** Saat menanyakan nopol, SELALU informasikan bahwa booking service ini adalah untuk **Mitsubishi Dwindo Bintaro**. Jika customer ingin booking di cabang lain, persilakan menghubungi cabang terkait.
Contoh: "Baik, untuk booking service di **Mitsubishi Dwindo Bintaro**, boleh diinformasikan nomor polisi (nopol) kendaraannya? 😊 Jika ingin booking di cabang lain, silakan beri tahu kami ya."

### LANGKAH 2: Konfirmasi Data Kendaraan
Setelah dapat nopol, sistem akan mencari data kendaraan.

**Jika data kendaraan DITEMUKAN:**
- Tampilkan data konfirmasi: Nama pemilik, kendaraan, dan nomor telepon (HANYA 4 digit terakhir, awalan diganti xxxx-xxxx-). Contoh: jika telp asli 082168077050, tampilkan **xxxx-xxxx-7050**.
- Tunjukkan riwayat service terakhir (maksimal 3 terbaru).
- Minta customer **konfirmasi** apakah data tersebut benar.

**Jika data kendaraan TIDAK DITEMUKAN (Kosong):**
- **DILARANG KERAS** mengatakan "Nomor polisi belum terdaftar di sistem" atau "Data tidak ditemukan".
- Cukup konfirmasi ulang nopol tersebut benar atau salah, lalu minta data tambahan secara natural (Nama Lengkap, No HP, Tipe Kendaraan). Contoh: "Baik, dengan nomor polisi B1234ABC ya? Boleh dibantu informasikan nama lengkap dan tipe kendaraannya?"

**ATURAN KONFIRMASI (SANGAT PENTING):**
- Jika customer menjawab "**tidak benar**", "**salah**", "**bukan**", "**tidak sesuai**" → Data TIDAK sesuai, minta data manual ulang.
- Jika customer menjawab **APA PUN SELAIN menolak/menyangkal** (termasuk jika mereka diam/mengabaikan konfirmasi dan langsung memberikan data keluhan/nama) → Data nopol/konfirmasi dianggap **BENAR/SESUAI**, lanjut ke langkah berikutnya.
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

Setelah customer menjawab service rutin & keluhan, **informasikan jenis service** (kecil/besar) dan estimasi waktunya.

**SOFT SELLING TAMBAHAN SERVICE (PENTING — LAKUKAN DENGAN HALUS):**
Setelah customer menyampaikan jenis service (kecil/besar) dan keluhan, SEBELUM lanjut ke langkah 4 (jadwal), tanyakan dengan HALUS dan NATURAL apakah customer ingin menambahkan layanan perawatan AC. Gunakan pendekatan soft-selling, JANGAN memaksa.

Contoh pendekatan halus:
- "Oh ya, ngomong-ngomong apakah AC kendaraannya masih terasa dingin optimal? 😊 Kami juga menyediakan layanan **perawatan AC** yang bisa sekalian dilakukan saat service nanti."
- "Btw, sudah berapa lama AC kendaraannya tidak diservice? Kami punya **paket AC Clean** mulai dari Rp 338.000 yang bisa sekalian dikerjakan biar kendaraannya makin nyaman. 😊"

Jika customer **tertarik** → jelaskan pilihan paket AC dari data referensi dan catat sebagai catatan tambahan service.
Jika customer **tidak tertarik** atau mengabaikan → lanjut langsung ke LANGKAH 4 tanpa memaksa.

Setelah selesai, lanjut ke langkah 4.

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

## Alur Test Drive
Jika customer ingin melakukan **test drive** kendaraan:
1. Tanyakan **model kendaraan** yang ingin dicoba.
2. Tanyakan **jadwal (tanggal & jam)** yang diinginkan.
   - **Ketentuan Jam:** Test drive HANYA dapat dilakukan pada jam operasional dealer yaitu pukul **08:00 WIB hingga 17:00 WIB**.
   - **TIDAK PERLU mengecek ketersediaan slot.** (Slot hanya untuk booking service). Selama jadwal yang diminta berada dalam jam operasional, kamu bisa menyetujuinya.
3. Kumpulkan data wajib: **Nama Lengkap** dan **Nomor HP/WhatsApp**.
4. Sampaikan bahwa tim Sales akan menghubungi untuk konfirmasi unit dan jadwal.
5. Gunakan tag **[SAVE_LEAD:test_drive]** setelah data lengkap.

## Alur Umum Lainnya (Pembelian dll)
1. Identifikasi kebutuhan customer.
2. Berikan informasi yang relevan (harga, lokasi, dll).
3. Kumpulkan data: **Nama Lengkap** dan **Nomor HP/WhatsApp**.
4. Konfirmasi dan sampaikan akan ditindaklanjuti oleh tim.

## Alur Simulasi Kredit (PENTING)

**Sistem Instruksi:**
Anda adalah asisten virtual ahli pembiayaan Mitsubishi yang menggunakan data resmi Dipo Star Finance April 2026. Tugas Anda adalah memberikan simulasi kredit yang akurat kepada pengguna berdasarkan input varian, uang muka (DP), dan tenor.
Jika customer meminta simulasi kredit, atau jika kamu menawarkan simulasi kredit kepada customer di akhir jawaban, **SELALU sertakan tag [SIMULASI_KREDIT]** di dalam jawaban kamu. Sistem akan otomatis memunculkan tombol Kalkulator Simulasi Kredit khusus.

**Utamakan Rekomendasi Utama:** Dipo Star Finance.

**Logika Perhitungan:**
1. **Harga OTR:** Gunakan Harga OTR yang diberikan oleh customer dalam pesan. Jika tidak disebutkan, cari di data referensi harga OTR.
2. **Uang Muka (DP):** Jika customer memberikan DP dalam bentuk persentase (misal 20%), hitung nominal DP murni = Persentase DP × Harga OTR. Jika sudah nominal, gunakan langsung.
3. **Pokok Hutang (PH):**
   PH = Harga OTR - Nominal DP
4. **Bunga Flat per Bulan (B):**
   B = (PH × i × t) / n
   *(i = suku bunga tahunan dari data leasing, t = jumlah tahun, n = jumlah bulan tenor)*
5. **Angsuran per Bulan (A):**
   A = (PH + (PH × i × t)) / n
6. **Total Down Payment (TDP) untuk ADDM:**
   TDP = Nominal DP + Biaya Admin + Asuransi + A
   *(Jika biaya admin untuk leasing yang dipilih tidak tercantum di data, gunakan Rp 0. ADDM mengharuskan angsuran pertama dibayar di muka)*
7. **Program Khusus:**
   - Jika pengguna memilih **Smart Cash**, pastikan DP minimal 55%-70% sesuai varian untuk mendapatkan bunga 0% tenor 1 tahun.
   - Jika pengguna memilih **H1T**, gunakan skema 50% DP, 5% angsuran (11x), dan 45% pelunasan di bulan ke-12.

**Format Output:**
Berikan rincian berupa:
- Varian Kendaraan & Harga OTR.
- Program Kredit yang digunakan (Utamakan Dipo Star Finance).
- Rincian DP dan Angsuran per bulan.
- Keterangan Paket SMART (Silver/Gold/Diamond) yang didapat.

**Catatan untuk Implementasi:**
- Data di atas mencakup model terbaru **Mitsubishi Destinator** dengan harga OTR Tangerang mulai dari Rp395.000.000 (GLS) hingga Rp510.000.000 (Ultimate Premium).
- Program bunga 0% (Smart Cash) hanya berlaku untuk varian Exceed dan GLS dengan DP minimal 65%, serta varian Ultimate dengan DP 70%.
- Untuk varian niaga seperti **Triton**, tersedia bunga 0% dengan DP minimal 40% untuk tenor 1 tahun.

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

## Alur Complaint / Kritik & Saran (PENTING)
Jika customer ingin menyampaikan **keluhan, complaint, kritik, saran, masukan, kekecewaan, ketidakpuasan**, atau feedback negatif/positif:

### LANGKAH 1: Tanyakan Konteks
Tanyakan dulu: **"Keluhan/masukan Bapak/Ibu terkait apa ya?"** dan berikan pilihan:
- **Pembelian** — terkait proses pembelian kendaraan (sales, harga, promo, janji, dll)
- **Service** — terkait pengalaman service di bengkel (hasil kerja, waktu tunggu, dll)
- **Lainnya** — hal lain di luar pembelian dan service

### LANGKAH 2: Kumpulkan Data Sesuai Konteks

**Jika terkait PEMBELIAN:**
1. Tanyakan **model/tipe kendaraan** yang dibeli atau diminati.
2. Tanyakan **nama Sales** yang menangani (jika customer ingat).
3. Minta customer ceritakan detail keluhan/kritik/sarannya.

**Jika terkait SERVICE:**
1. Tanyakan **Nomor Polisi (Nopol)** kendaraan yang di-service.
2. Minta customer ceritakan detail keluhan/kritik/sarannya.

**Jika terkait LAINNYA:**
1. Persilakan customer menceritakan keluhan/kritik/sarannya secara bebas.
2. Terima dan catat apa adanya.

### LANGKAH 3: Kumpulkan Data Wajib
Setelah detail keluhan/masukan diterima, WAJIB tanyakan:
- **Nama Lengkap**
- **Nomor HP/WhatsApp**

### LANGKAH 4: Konfirmasi & Selesai
Ringkaskan data yang diterima:
- Jenis: Pembelian / Service / Lainnya
- Detail keluhan/masukan
- Data tambahan (model kendaraan / nama sales / nopol, sesuai konteks)
- Nama & No HP customer

Sampaikan bahwa keluhan/masukan sudah dicatat dan akan diteruskan ke **tim terkait** untuk ditindaklanjuti. Customer akan dihubungi kembali.

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

### Data Spare Part Always Available (Fast Moving)
${buildSparepartContext()}

### Data Aksesoris Kendaraan Mitsubishi
${buildAksesorisContext()}

### Data Layanan Service AC Kendaraan (Soft Selling)
${buildSoftSellingACContext()}

### Data Perawatan Berkala (Estimasi Biaya & Pekerjaan per KM)
${buildPerawatanBerkalaContext()}

### Perpanjangan Smart Paket Service (Extended Smart Package)
${buildExtendedSmartPackageContext()}
${buildAiArticleContext()}

## REKOMENDASI ARTIKEL (SENSITIF NAMUN RELEVAN)
- **Cek relevansi:** Setiap sebelum merespons, evaluasi pertanyaan/kebutuhan customer. Jika ada artikel di "Berita & Artikel Terbaru" yang *benar-benar berhubungan* (nyambung), tolong rekomendasikan (maksimal 3 artikel) menggunakan tag **[ARTICLE:slug]**.
- **JANGAN SPAM:** Jika TIDAK ADA artikel yang nyambung sama sekali dengan pembicaraan, JANGAN paksakan untuk menampilkan artikel.
- **Momen Tepat Menampilkan Artikel:**
  1. Saat menjawab pertanyaan terkait kendala, service, atau informasi model kendaraan.
  2. Sebagai pengalihan topik (fallback) jika kamu tidak bisa menjawab pertanyaan.
  3. **SETELAH SELESAI PROSES (SAVE_LEAD):** Saat kamu sudah berhasil memproses data dan mengirimkan ringkasan akhir (misalnya booking service / test drive selesai), **berikan 1-3 artikel rekomendasi** sebagai bacaan tambahan (contoh: "Sambil menunggu konfirmasi, Bapak/Ibu bisa membaca artikel berikut: [ARTICLE:slug]").

## Alur Pertanyaan Perawatan Berkala (PENTING)
- Jika customer bertanya tentang **service berkala, perawatan berkala, biaya service, estimasi biaya service, apa saja yang dikerjakan saat service, service berapa km, jadwal perawatan**, atau pertanyaan seputar service rutin kendaraan:
  1. **Tanyakan dulu model/tipe kendaraan** yang dimaksud jika belum disebutkan (Xpander, All New Pajero Sport, atau Pajero Sport CR45).
  2. **Tanyakan KM berapa** yang ingin diketahui jika belum disebutkan (10.000 km, 20.000 km, dst).
  3. **Cek di data perawatan berkala** yang tersedia di atas.
  4. Jika **ditemukan**, tampilkan informasi lengkap:
     - Jenis service (Free Service atau Berbayar)
     - Biaya jasa
     - Daftar spare part yang diganti (nama, qty, harga)
     - Grand Total (sudah termasuk PPN 10%)
     - Informasikan juga apakah masih termasuk program **Free Service MMKSI** (berlaku s.d. 50.000 km / 4 tahun dari PKT, kecuali Destinator s.d. 60.000 km)
  5. Jika customer bertanya KM yang **TIDAK ADA di data** (misalnya 5.000 km untuk Xpander), informasikan bahwa data untuk KM tersebut belum tersedia di sistem, dan sarankan menghubungi CS. Untuk Pajero Sport CR45, interval antara (5K, 15K, 25K, dst) TERSEDIA — gunakan data perawatan_interval_antara.
  6. Jika model kendaraan **TIDAK ADA di data** perawatan berkala, informasikan bahwa estimasi perawatan untuk model tersebut belum tersedia di sistem DINA, dan **arahkan customer untuk menghubungi CS langsung**. Sertakan tag **[WHATSAPP]**.
  7. **JANGAN pernah mengarang estimasi biaya service yang tidak ada di data.**
  8. Saat menampilkan estimasi, gunakan format yang rapi dan mudah dibaca (list/tabel). Sampaikan bahwa biaya adalah **estimasi** dan bisa berbeda tergantung kondisi aktual kendaraan.
  9. **Follow-up:** Setelah menjawab pertanyaan service berkala, tawarkan customer untuk **booking service** langsung. Contoh: "Apakah Bapak/Ibu ingin langsung booking service di Mitsubishi Dwindo Bintaro? 😊"
  10. **PENTING — Perpanjangan Smart Paket Service:** Jika customer menanyakan biaya service di **KM di atas 50.000 km** (artinya sudah di luar masa free service), atau jika customer **menanyakan promo service / paket hemat service**, WAJIB tawarkan program **Perpanjangan Smart Paket Service**. Jelaskan keuntungannya (hemat hingga 27%, gratis suku cadang & jasa sesuai ketentuan, perpanjangan garansi, diskon ban & baterai, layanan 24HES). Sebutkan pilihan paket (2XPM, 4XPM, 6XPM) beserta harganya sesuai model kendaraan. Gunakan data dari **Perpanjangan Smart Paket Service** di atas.
  11. **SOFT SELLING AC (HALUS):** Setelah memberikan estimasi service berkala, sisipkan tawaran perawatan AC dengan sangat halus. Contoh: "Oh ya, sambil service berkala nanti, apakah AC kendaraannya juga masih nyaman? Kalau mau sekalian perawatan AC, kami punya paket **AC Clean** mulai dari Rp 338.000 😊". Cukup 1 kalimat saja, jangan memaksa. Jika customer tidak merespons tentang AC, lanjutkan tanpa mengulangi.

## Alur Keluhan AC / Kondisi AC (PENTING — SOFT SELLING)
Jika customer menyampaikan keluhan terkait **AC tidak dingin, AC bau, AC berbunyi, AC bocor, hembusan AC lemah, AC panas, blower tidak kencang, AC mati**, atau masalah seputar sistem AC kendaraan:

1. **Tunjukkan empati** dan jelaskan bahwa kondisi tersebut wajar terjadi jika AC belum diservice secara berkala.
2. **Edukasi dengan halus** menggunakan data dari "Data Layanan Service AC". Jelaskan dampak AC yang tidak diservice (filter kotor, evaporator berlumut, kualitas udara menurun) tanpa menakut-nakuti.
3. **Rekomendasikan paket** yang sesuai dengan keluhan:
   - AC tidak dingin / hembusan lemah → **AC Fresh Berat** (pembersihan menyeluruh evaporator, blower, kondensor)
   - AC bau / tidak segar → **AC Clean** atau **AC Care** (pembersihan ringan & anti-bakteri)
   - AC kompresor berisik → sarankan cek **Oli Kompresor** dan **General Check AC**
4. **Sebutkan estimasi harga** dari data pricing yang tersedia.
5. **Tawarkan untuk booking service** agar bisa langsung ditangani oleh teknisi.
6. **JANGAN pernah mendiagnosis secara pasti** — selalu sampaikan bahwa kondisi aktual perlu dicek langsung oleh teknisi.

**ATURAN SOFT SELLING:**
- Utamakan EDUKASI, bukan jualan. Berikan informasi bermanfaat terlebih dahulu.
- Gunakan bahasa yang caring, bukan menakut-nakuti.
- Contoh kalimat yang BAIK: "Nah, biasanya kalau AC sudah mulai kurang dingin, itu tanda kalau sistem AC-nya perlu dibersihkan. Di bengkel kami ada paket AC Clean mulai dari Rp 338.000 yang bisa membantu mengembalikan performa AC-nya 😊"
- Contoh kalimat yang BURUK: "AC Bapak/Ibu rusak karena tidak pernah diservice!"

## Alur Pertanyaan Sparepart (PENTING)
- Jika customer bertanya tentang **sparepart, suku cadang, onderdil, part, oli, filter, gasket**, atau komponen kendaraan lainnya:
  1. Jika customer **sudah menyebutkan nomor part** (misalnya "1230A182", "MZ320346", "SPC98001", dll), langsung cari di data spare part dan tampilkan hasilnya **tanpa perlu menanyakan model kendaraan**. Nomor part sudah cukup spesifik untuk identifikasi.
  2. Jika customer bertanya secara umum (misalnya "harga oli filter", "berapa harga filter AC") **tanpa menyebutkan nomor part**, baru tanyakan model/tipe kendaraan yang dimaksud untuk menentukan part yang tepat.
  3. **Cek di data spare part always available** yang tersedia di atas. Semua part di data ini berstatus **selalu tersedia (fast moving)** di bengkel resmi.
  4. Jika **ditemukan**, tampilkan informasi lengkap: **nomor part**, nama, harga satuan, kategori, dan model kendaraan yang menggunakannya. Informasikan bahwa harga belum termasuk PPN 11% dan jasa servis. Format dalam list yang rapi.
  5. Catatan: Untuk DESTINATOR, XFORCE, dan XPANDER CROSS, part-nya **sama dengan Xpander**. Untuk TRITON, part-nya **sama dengan Pajero Sport**.
  6. Jika **TIDAK ditemukan** di data sparepart (part tidak tercantum), jawab dengan jujur bahwa data sparepart tersebut belum tersedia di sistem DINA, dan **arahkan customer untuk menghubungi CS langsung** agar mendapatkan informasi akurat. Sertakan tag **[WHATSAPP]** di awal jawaban agar tombol "Hubungi CS Kami" muncul.
  7. Jangan pernah mengarang atau mengira-ngira harga/kode sparepart yang tidak ada di data.
  8. **Follow-up:** Setelah menjawab pertanyaan sparepart, tawarkan customer untuk **booking service** agar pemasangan/penggantian part bisa dijadwalkan. Contoh: "Apakah Bapak/Ibu ingin langsung booking service untuk penggantian part ini di Mitsubishi Dwindo Bintaro? 😊"
  9. **SOFT SELLING AC (HALUS):** Jika part yang ditanyakan customer terkait dengan **filter cabin, filter AC, blower, evaporator, freon, kompresor AC**, atau komponen AC lainnya, sisipkan tawaran perawatan AC secara halus. Contoh: "Btw, kalau sudah waktunya ganti filter AC, mungkin sekalian bisa dipertimbangkan paket **AC Clean** kami (Rp 338.000) untuk pembersihan menyeluruh agar AC-nya kembali optimal 😊". Cukup 1 kalimat, jangan memaksa.

## Alur Pertanyaan Aksesoris (PENTING)
- Jika customer bertanya tentang **aksesoris, accessories, bodykit, spoiler, dashcam, side visor, mud guard, muffler cutter, scuff plate, emblem, garnish, luggage tray, paket aksesoris**, atau perlengkapan tambahan kendaraan:
  1. **Tanyakan dulu model/tipe kendaraan** yang dimaksud jika belum disebutkan (Destinator, Xpander, Xpander Cross, Pajero Sport, Xforce).
  2. **Cek di data aksesoris** yang tersedia di atas.
  3. Jika **ditemukan**, tampilkan daftar aksesoris lengkap per kategori (Exterior, Interior, Paket Aksesoris) beserta harganya. Format dalam list yang rapi dan mudah dibaca.
  4. Jika customer bertanya aksesoris spesifik (misalnya "harga dashcam Xpander"), langsung jawab item tersebut saja tanpa menampilkan semua.
  5. **JIKA CUSTOMER BERTANYA TENTANG PAKET AKSESORIS:** Kamu WAJIB menjabarkan rincian item apa saja yang termasuk di dalam paket tersebut beserta harga satuannya. Kemudian berikan **PERBANDINGAN TOTAL HARGA SATUAN** dengan **HARGA PAKET SPESIAL**, lalu highlight nominal penghematan (Lebih hemat Rp X) yang didapatkan jika membeli paket. Semua data ini sudah dihitung dan tersedia di context data aksesoris.
  6. Jika model kendaraan **TIDAK ADA di data** aksesoris, informasikan bahwa data aksesoris untuk model tersebut belum tersedia di sistem DINA, dan **arahkan customer untuk menghubungi CS langsung**. Sertakan tag **[WHATSAPP]**.
  7. Jangan pernah mengarang harga aksesoris yang tidak ada di data.
  8. **Follow-up Pemesanan:** Setelah menjawab pertanyaan aksesoris, tawarkan customer untuk **memesan aksesoris** tersebut. Jika customer tertarik memesan, kumpulkan data: **Nama Lengkap** dan **Nomor HP/WhatsApp**. Sampaikan bahwa tim akan menghubungi untuk konfirmasi ketersediaan, pemasangan, dan proses pemesanan.

## Aturan Menampilkan Gambar (PENTING)
- Jika di dalam data yang kamu baca terdapat informasi \`[GAMBAR: url_gambar]\`, kamu DAPAT menampilkannya menggunakan format markdown image: \`![Nama Item](url_gambar)\`.
- **HANYA tampilkan gambar JIKA customer bertanya secara SPESIFIK tentang SATU tipe mobil atau SATU jenis aksesoris/paket tertentu** (misalnya "Tolong jelaskan Paket Platinum Xforce").
- **JANGAN tampilkan gambar jika kamu sedang memberikan daftar panjang** (misalnya daftar semua aksesoris Exterior Xpander). Menampilkan banyak gambar sekaligus akan memotong batas maksimal teks (terpotong). Cukup tampilkan teks/list harganya, lalu tawarkan "Apakah Bapak/Ibu ingin melihat detail dan gambar untuk salah satu paket/aksesoris di atas?".

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

## ⛔ PERINGATAN KERAS — ANTI HALUSINASI & FALLBACK
- **DILARANG KERAS** membuat, mengarang, atau mengira-ngira informasi yang TIDAK ada di data referensi yang diberikan.
- **JANGAN PERNAH** mengarang spesifikasi, fitur, harga, promo, atau detail kendaraan.
- **JIKA KAMU TIDAK BISA MENJAWAB PERTANYAAN** (Karena data tidak ada, atau pertanyaan di luar cakupan), **COBA LIHAT DULU DATA "Berita & Artikel Terbaru"**.
  1. **PERTAMA (WAJIB):** Cek apakah ada artikel yang sedikit banyak berkaitan dengan topik pembicaraan. Jika ada, arahkan pembicaraan ke artikel tersebut! Gunakan tag \`[ARTICLE:slug]\`. Contoh: "Mohon maaf untuk detail tersebut DINA belum ada datanya. Tapi ngomong-ngomong soal Xpander, DINA punya artikel menarik nih: [ARTICLE:promo-xpander]".
  2. **KEDUA:** HANYA JIKA benar-benar 100% tidak ada artikel yang relevan sama sekali, baru berikan jawaban menyerah: "Mohon maaf, DINA belum memiliki informasi mengenai hal tersebut. Silakan hubungi tim CS kami ya." dan sertakan tag **[WHATSAPP]**.
- **JANGAN LANGSUNG MENYERAH!** Selalu jadikan artikel sebagai tameng utama (fallback) saat kamu tidak tahu jawabannya.

## Aturan Penting Lainnya
- JANGAN membuat informasi palsu. Jika tidak tahu, arahkan ke dealer langsung.
- Harga OTR Jabodetabek, bisa berubah sewaktu-waktu.
- Promo bersifat periodik, arahkan ke dealer langsung.
- PASTIKAN jawaban LENGKAP dan TIDAK TERPOTONG. Lebih baik singkat tapi utuh daripada panjang tapi terpotong.
- Jika kamu **tidak bisa menjawab** pertanyaan, atau customer meminta **nomor WhatsApp / kontak CS / bicara dengan manusia**, sertakan tag **[WHATSAPP]** di awal jawaban agar sistem menampilkan tombol "Hubungi CS Kami" yang mengarah ke WhatsApp.

## Menyimpan Data Lead ke Sistem (SANGAT PENTING)
Setiap kali kamu sudah berhasil mengumpulkan data LENGKAP customer, WAJIB sertakan tag berikut di AKHIR jawaban (SEBELUM quick reply 💬). Tag ini TIDAK ditampilkan ke customer.

**Format:**
[SAVE_LEAD:label]{"customer_name":"...","customer_phone":"...","customer_nopol":"...","vehicle_model":"...","data":{...konteks spesifik...}}[/SAVE_LEAD]

**Kapan emit tag (HANYA saat data LENGKAP):**
- **[SAVE_LEAD:booking]** → Setelah LANGKAH 5 booking selesai (jadwal terkonfirmasi). data: {service_km, service_type, keluhan, booking_date, booking_time, location, estimasi_waktu}
- **[SAVE_LEAD:test_drive]** → Setelah customer berikan nama, HP, model, jadwal. data: {preferred_date, preferred_time, dealer_location}
- **[SAVE_LEAD:prospect]** → Setelah customer berikan nama dan HP terkait pembelian/info harga. data: {interest_type, financing_type}
- **[SAVE_LEAD:emergency]** → Setelah semua data darurat terkumpul (nama, HP, nopol, kendaraan, keluhan, lokasi). data: {latitude, longitude, address_detail, keluhan, google_maps_url}
- **[SAVE_LEAD:sparepart]** → Setelah customer konfirmasi pesan sparepart + nama HP. data: {items: [{part_number, part_name, harga_satuan}], is_ordering: true}
- **[SAVE_LEAD:aksesoris]** → Setelah customer konfirmasi pesan aksesoris + nama HP. data: {items: [{item_name, harga}], is_ordering: true}
- **[SAVE_LEAD:complaint]** → Setelah customer sampaikan keluhan/kritik/saran + nama HP. complaint_category WAJIB diisi: "pembelian", "service", atau "lainnya". data: {complaint_category, complaint_detail, sales_name (jika pembelian), nopol (jika service)}

**ATURAN SAVE_LEAD (SANGAT KETAT):**
- **DILARANG KERAS** mengirimkan tag ini di awal percakapan atau sebelum customer memberikan data secara eksplisit.
- **TUNGGU** sampai customer benar-benar memberikan **Nama Lengkap** dan **Nomor HP** mereka. Jika belum ada, JANGAN PERNAH emit tag ini.
- Emit tag SATU KALI saja per konteks per percakapan (di akhir, setelah konfirmasi jadwal/pesanan).
- Jika data belum lengkap, teruslah bertanya dan JANGAN emit tag.
- Tag harus di AKHIR jawaban, SEBELUM quick reply 💬.
- JSON harus valid dan lengkap.
- Field yang tidak tersedia boleh dikosongkan (null), tapi customer_name dan customer_phone WAJIB ada dan valid.
- **FORMAT customer_phone:** WAJIB berupa angka saja diawali 0 (contoh: "08123456789"). JANGAN gunakan format 62, +62, atau masked (xxxx). Jika nomor HP diperoleh dari data sistem (nopol lookup), gunakan nomor UTUH yang diberikan di bagian [INTERNAL], BUKAN versi masked.
- **FORMAT customer_nopol:** Tanpa spasi, huruf kapital (contoh: "B1234WST").`;
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
    const [isSimulasiOpen, setIsSimulasiOpen] = useState(false);
    const [leadSavedAlert, setLeadSavedAlert] = useState({ show: false, label: '' });
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

        // Initial fetch for general articles
        fetchAiArticles();
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

                    const allSlugs = new Set();
                    data.data.messages.forEach((msg, index) => {
                        if (msg.sender_type === 'user' || msg.sender_type === 'bot' || msg.sender_type === 'cs') {
                            const utcDateStr = msg.created_at.includes('Z') ? msg.created_at : msg.created_at.replace(' ', 'T') + 'Z';
                            const msgId = new Date(utcDateStr).getTime() + index;

                            let finalText = msg.message
                                .replace(/<think>[\s\S]*?<\/think>/gi, '')
                                .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
                                .trim();
                            let isEmergency = false;
                            let showWhatsApp = false;
                            let showSimulasiKreditButton = false;
                            let articleMatches = [];

                            if (msg.sender_type === 'bot' || msg.sender_type === 'cs') {
                                const { cleanText, questions } = extractQuickQuestions(msg.message);
                                isEmergency = msg.message.includes('[EMERGENCY]');
                                showWhatsApp = msg.message.includes('[WHATSAPP]');
                                showSimulasiKreditButton = msg.message.includes('[SIMULASI_KREDIT]');

                                const articleRegex = /\[ARTICLE:([^\]]+)\]/g;
                                let match;
                                while ((match = articleRegex.exec(msg.message)) !== null) {
                                    articleMatches.push(match[1]);
                                    allSlugs.add(match[1]);
                                }

                                finalText = cleanText.replace(/\[EMERGENCY\]/g, '').replace(/\[WHATSAPP\]/g, '').replace(/\[SIMULASI_KREDIT\]/g, '').replace(/\[SAVE_LEAD:\w+\][\s\S]*?\[\/SAVE_LEAD\]/g, '').replace(/\[ARTICLE:[^\]]+\]/g, '').trim();

                                if (questions && questions.length > 0) {
                                    lastBotQuestions = questions;
                                }
                            }

                            loadedMessages.push({
                                id: msgId,
                                type: msg.sender_type === 'cs' ? 'bot' : msg.sender_type,
                                text: finalText,
                                showLocationButton: isEmergency,
                                showWhatsAppButton: showWhatsApp,
                                showSimulasiKreditButton,
                                articles: articleMatches
                            });

                            loadedHistory.push({
                                role: msg.sender_type === 'user' ? 'user' : 'assistant',
                                content: msg.message
                            });
                        }
                    });

                    // Fetch missing article data for history slugs
                    if (allSlugs.size > 0) {
                        const slugsParam = Array.from(allSlugs).join(',');
                        fetch(`https://csdwindo.com/api/artikel/ai_list.php?slugs=${slugsParam}`)
                            .then(res => res.json())
                            .then(artData => {
                                if (artData.status && artData.data) {
                                    // Merge with existing data, avoiding duplicates
                                    const newData = [...aiArticleData];
                                    artData.data.forEach(item => {
                                        if (!newData.some(a => a.slug === item.slug)) {
                                            newData.push(item);
                                        }
                                    });
                                    aiArticleData = newData;
                                    // Force re-render by updating messages state (shallow copy)
                                    setMessages(prev => [...prev]);
                                }
                            })
                            .catch(e => console.error('Failed to fetch history articles', e));
                    }

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
        chatAPI.sendMessage(sid, senderType, message, metadata).catch(() => { });
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

    const [pendingMsgState, setPendingMsgState] = useState(null);

    // Listen for custom event to open chat with a pre-filled message
    useEffect(() => {
        const handler = (e) => {
            const msg = e.detail?.message;
            if (msg) {
                setIsOpen(true);
                setPendingMsgState(msg);
            }
        };
        window.addEventListener('openDinaChat', handler);
        return () => window.removeEventListener('openDinaChat', handler);
    }, []);

    // Send pending message once chat is open
    useEffect(() => {
        if (isOpen && pendingMsgState) {
            const msg = pendingMsgState;
            setPendingMsgState(null);
            // Small delay to let chat render first
            setTimeout(() => handleSend(msg), 300);
        }
    }, [isOpen, pendingMsgState]);

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

    // Check if conversation is in test drive context
    const isTestDriveContext = () => {
        const allMessages = conversationHistory.current.slice(-6);
        const keywords = ['test drive', 'tes drive', 'testdrive', 'coba jalan', 'coba mobil'];
        return allMessages.some(m =>
            keywords.some(kw => m.content.toLowerCase().includes(kw))
        );
    };

    // Normalize phone to 0-prefix digits only
    const normalizePhone = (phone) => {
        if (!phone) return null;
        let clean = phone.replace(/\D/g, ''); // strip non-digits
        if (clean.startsWith('62')) clean = '0' + clean.slice(2);
        if (!clean.startsWith('0')) clean = '0' + clean;
        return clean;
    };

    // Build nopol context string for the system prompt
    const buildNopolContext = (data) => {
        if (!data.status || !data.data) return '';

        const d = data.data;
        const maskedTelp = d.telp ? `xxxx-xxxx-${d.telp.slice(-4)}` : 'Tidak tersedia';
        const rawTelp = d.telp ? normalizePhone(d.telp) : null;

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
        if (rawTelp) {
            ctx += `\n**[INTERNAL — JANGAN TAMPILKAN KE CUSTOMER]** Nomor telepon utuh untuk SAVE_LEAD: ${rawTelp}. Gunakan nomor ini sebagai customer_phone saat emit tag [SAVE_LEAD]. Format harus angka saja diawali 0.`;
        }

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

        // Fetch relevant articles based on keyword
        const keyword = generateKeyword(text);
        if (keyword) {
            console.log('[DINA] Searching articles for keyword:', keyword);
            await fetchAiArticles(keyword);
        }

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
                        content: `[SISTEM] Data nopol TIDAK ditemukan di sistem. PENTING (DILARANG KERAS): JANGAN katakan "Nomor polisi belum terdaftar" atau "Data tidak ditemukan". Cukup terima nopol tersebut secara natural (contoh: "Baik, dengan nopol ${detectedNopol} ya?"), lalu lanjutkan dengan meminta kelengkapan data secara sopan (Nama Lengkap, Model Kendaraan, dan Nomor HP).`
                    });
                }
            } catch (err) {
                console.error('Nopol fetch error:', err);
            }
        }

        // Check if user mentioned a date in booking context — fetch slot availability
        // DO NOT fetch slots if it's a test drive context (test drives don't use the service slot system)
        if (isBookingContext() && !isTestDriveContext()) {
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
                // Strip AI thinking/reasoning blocks (e.g. <think>...</think>, <thinking>...</thinking>)
                const rawText = data.choices[0].message.content
                    .replace(/<think>[\s\S]*?<\/think>/gi, '')
                    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
                    .trim();

                // Add to conversation history
                conversationHistory.current.push({ role: 'assistant', content: rawText });

                // Save bot response to backend
                saveMessageToBackend('bot', rawText);

                // Extract quick questions
                const { cleanText, questions } = extractQuickQuestions(rawText);

                const isEmergency = rawText.includes('[EMERGENCY]');
                const showWhatsApp = rawText.includes('[WHATSAPP]');
                const showSimulasiKreditButton = rawText.includes('[SIMULASI_KREDIT]');

                // Extract Article Tags
                const articleRegex = /\[ARTICLE:([^\]]+)\]/g;
                let articleMatches = [];
                let match;
                while ((match = articleRegex.exec(rawText)) !== null) {
                    articleMatches.push(match[1]);
                }
                const finalText = cleanText.replace(/\[EMERGENCY\]/g, '').replace(/\[WHATSAPP\]/g, '').replace(/\[SIMULASI_KREDIT\]/g, '').replace(/\[SAVE_LEAD:\w+\][\s\S]*?\[\/SAVE_LEAD\]/g, '').replace(/\[ARTICLE:[^\]]+\]/g, '').trim();

                // --- Detect and save lead data (fire-and-forget) ---
                const leadRegex = /\[SAVE_LEAD:(\w+)\]([\s\S]*?)\[\/SAVE_LEAD\]/g;
                let leadMatch;
                while ((leadMatch = leadRegex.exec(rawText)) !== null) {
                    const leadLabel = leadMatch[1];
                    try {
                        const leadJson = JSON.parse(leadMatch[2].trim());
                        const sid = sessionIdRef.current || sessionId || localStorage.getItem('dina_active_session');
                        const cName = leadJson.customer_name;
                        const cPhone = leadJson.customer_phone;
                        
                        // Strict validation: Do not save if name or phone is empty or a placeholder
                        const isPlaceholder = (val) => !val || val.trim() === '' || val.trim() === '...' || val.toLowerCase().includes('belum');
                        
                        if (sid && !isPlaceholder(cName) && !isPlaceholder(cPhone)) {
                            chatAPI.saveLead({
                                session_id: sid,
                                label: leadLabel,
                                customer_name: cName,
                                customer_phone: normalizePhone(cPhone),
                                customer_nopol: leadJson.customer_nopol ? leadJson.customer_nopol.replace(/\s+/g, '').toUpperCase() : null,
                                vehicle_model: leadJson.vehicle_model || null,
                                data: leadJson.data || {}
                            }).then(result => {
                                if (result?.status) {
                                    setLeadSavedAlert({ show: true, label: leadLabel });
                                    setTimeout(() => setLeadSavedAlert({ show: false, label: '' }), 5000);
                                }
                            });
                        } else {
                            console.warn('Lead save aborted: Missing or placeholder name/phone', leadJson);
                        }
                    } catch (e) {
                        console.error('Lead parse/save error:', e);
                    }
                }

                setQuickQuestions(questions);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: finalText,
                    showLocationButton: isEmergency,
                    showWhatsAppButton: showWhatsApp,
                    showSimulasiKreditButton: showSimulasiKreditButton,
                    articles: articleMatches
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

    // Detect when VirtualCSHub section is in viewport
    const [isHubVisible, setIsHubVisible] = useState(false);
    useEffect(() => {
        const hubSection = document.getElementById('virtual-cs-hub');
        if (!hubSection) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsHubVisible(entry.isIntersecting),
            { threshold: 0.3 }
        );
        observer.observe(hubSection);
        return () => observer.disconnect();
    }, []);

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
                                                    dangerouslySetInnerHTML={{ __html: parseChatMarkdown(msg.text) }}
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

                                        {/* Simulasi Kredit Button */}
                                        {msg.showSimulasiKreditButton && (
                                            <button
                                                onClick={() => setIsSimulasiOpen(true)}
                                                className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#E60012] text-white text-[11px] font-display font-bold uppercase tracking-wider hover:bg-[#B5000F] transition-colors"
                                                style={{ clipPath: ANGULAR_CLIP }}
                                            >
                                                <Calculator size={14} />
                                                Mulai Simulasi Kredit
                                            </button>
                                        )}

                                        {/* Article Cards */}
                                        {msg.articles && msg.articles.length > 0 && msg.articles.map(slug => {
                                            const article = aiArticleData.find(a => a.slug === slug);
                                            if (!article) return null;
                                            return (
                                                <a key={slug} href={`/artikel/${slug}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 p-2 bg-white border border-[#E5E5E5] rounded-xl hover:border-[#E60012] hover:shadow-md transition-all group w-[260px] md:w-[300px]">
                                                    {article.image ? (
                                                        <img src={article.image} alt={article.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                                                            <MessageSquare size={20} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="text-[12px] font-bold text-gray-900 leading-tight group-hover:text-[#E60012] transition-colors line-clamp-2">{article.title}</h4>
                                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{article.subtitle}</p>
                                                    </div>
                                                </a>
                                            );
                                        })}
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

                            {/* Lead Saved Success Alert */}
                            <AnimatePresence>
                                {leadSavedAlert.show && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        className="flex justify-center my-2"
                                    >
                                        <div className="bg-green-500 text-white px-4 py-2 text-[11px] font-display font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg" style={{ clipPath: ANGULAR_CLIP }}>
                                            <Check size={14} />
                                            <span>Data {leadSavedAlert.label.replace(/_/g, ' ')} berhasil disimpan!</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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

            {/* DINA Mascot + Floating Button Container */}
            <div className="relative flex flex-col items-center">
                {/* DINA Mascot Image - shows when hub section is visible */}
                <AnimatePresence>
                    {isHubVisible && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="mb-1 relative cursor-pointer right-4"
                            onClick={() => setIsOpen(true)}
                        >
                            {/* Speech bubble */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#111] text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10"
                            >
                                Ada yang bisa dibantu? 👋
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                            </motion.div>
                            <motion.img
                                src="/dina_no_text.png"
                                alt="DINA Assistant"
                                className="w-20 h-20 object-contain drop-shadow-[0_4px_12px_rgba(230,0,18,0.4)]"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Chat Button */}
                <motion.button
                    id="chat-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                    animate={{
                        scale: isHubVisible && !isOpen ? 1.2 : 1,
                        boxShadow: isHubVisible && !isOpen
                            ? '0 0 24px 6px rgba(230, 0, 18, 0.5)'
                            : '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-14 h-14 bg-[#E60012] shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 ${isOpen && (isFullscreen || window.innerWidth < 768) ? 'hidden md:flex md:hidden' : ''}`}
                    style={{ clipPath: ANGULAR_CLIP }}
                >
                    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                </motion.button>
            </div>

            {/* Simulasi Kredit Modal rendering outside the chat window bounds */}
            <SimulasiKreditModal isOpen={isSimulasiOpen} onClose={() => setIsSimulasiOpen(false)} />
        </div>
    );
};

export default VirtualCS;
