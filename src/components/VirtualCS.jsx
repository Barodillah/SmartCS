import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ArrowRight, Maximize2, Minimize2, Loader2, MapPin, Navigation, Phone } from 'lucide-react';
import { ANGULAR_CLIP } from '../utils/constants';
import priceListData from '../../knowledge/price_list.json';
import dealerData from '../../knowledge/lokasi_dealer.json';
import promoData from '../../knowledge/promo/promo_dsf_april_2026.json';
import referralData from '../../knowledge/promo/progam_referral.json';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// --- Build System Prompt with Data Context ---
const buildSystemPrompt = (nopolContext = '') => {
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

    return `Kamu adalah **DINA** — **Dwindo Intelligent Assistant**, asisten Customer Satisfaction resmi **PT Dwindo Berlian Samjaya**, dealer resmi **Mitsubishi Motors** di area Jabodetabek.

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
- Jika user bertanya soal **booking service**: Pertama-tama tanyakan **Nomor Polisi (Nopol)** kendaraannya saja. Jangan tanyakan hal lain dulu.
- Jika user bertanya **lokasi/alamat**: Langsung berikan informasi cabang dealer yang relevan.
- Jika user bertanya **test drive**: Tanyakan model yang diminati dan jadwal yang diinginkan, lalu minta nama & nomor HP.

## Alur Booking Service (PENTING — IKUTI URUTAN INI)
1. Customer bilang ingin booking service → Tanyakan **Nomor Polisi (Nopol)** saja.
2. Setelah dapat nopol, sistem akan mencari data kendaraan. Jika ditemukan:
   - Tampilkan data konfirmasi: Nama pemilik, kendaraan, dan nomor telepon (HANYA 4 digit terakhir, awalan diganti xxxx-xxxx-). Contoh: jika telp asli 082168077050, tampilkan **xxxx-xxxx-7050**.
   - Tunjukkan riwayat service terakhir (maksimal 3 terbaru).
   - Minta customer **konfirmasi** apakah data tersebut benar.
3. Setelah customer konfirmasi benar → Tanyakan keluhan/kebutuhan service dan jadwal yang diinginkan.
4. Setelah lengkap → Sampaikan bahwa data akan diteruskan ke Service Advisor.

## Alur Umum Lainnya (Pembelian, Test Drive, dll)
1. Identifikasi kebutuhan customer.
2. Berikan informasi yang relevan (harga, lokasi, dll).
3. Kumpulkan data: **Nama Lengkap** dan **Nomor HP/WhatsApp**.
4. Konfirmasi dan sampaikan akan ditindaklanjuti oleh tim.

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

## Format Jawaban
- Gunakan **markdown formatting** (bold, italic, list, dll).
- Setiap jawaban HARUS diakhiri dengan **3 quick answer** relevan, di baris baru, diawali 💬:

💬 Contoh quick answer 1
💬 Contoh quick answer 2
💬 Contoh quick answer 3

## Aturan Penting
- JANGAN membuat informasi palsu. Jika tidak tahu, arahkan ke dealer langsung.
- Harga OTR Jabodetabek, bisa berubah sewaktu-waktu.
- Promo bersifat periodik, arahkan ke dealer langsung.
- PASTIKAN jawaban LENGKAP dan TIDAK TERPOTONG. Lebih baik singkat tapi utuh daripada panjang tapi terpotong.
- Jika kamu **tidak bisa menjawab** pertanyaan, atau customer meminta **nomor WhatsApp / kontak CS / bicara dengan manusia**, sertakan tag **[WHATSAPP]** di awal jawaban agar sistem menampilkan tombol "Hubungi CS Kami" yang mengarah ke WhatsApp.`;
};

const VirtualCS = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Halo! 👋 Saya **DINA** — *Dwindo Intelligent Assistant*.' },
        { id: 2, type: 'bot', text: 'Ada yang bisa DINA bantu hari ini? 😊' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [quickQuestions, setQuickQuestions] = useState([
        'Info Harga Kendaraan',
        'Booking Service',
        'Lokasi Dealer'
    ]);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const conversationHistory = useRef([]);
    const nopolContext = useRef('');
    const pendingMessage = useRef(null);

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

    const handleSend = async (text = inputValue) => {
        if (!text.trim() || isLoading) return;

        const userMsg = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

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
                        { role: 'system', content: buildSystemPrompt(nopolContext.current) },
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

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-[#E5E5E5] p-3 flex items-center gap-2" style={{ borderRadius: '0 12px 12px 12px' }}>
                                        <Loader2 size={14} className="animate-spin text-[#E60012]" />
                                        <span className="text-[12px] text-gray-400 italic">DINA sedang mengetik...</span>
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
