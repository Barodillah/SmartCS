import dealerData from '../../knowledge/lokasi_dealer.json';

export const SITE_URL = 'https://csdwindo.com';
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BRAND_NAME = 'Mitsubishi Motors Dwindo Bintaro';
export const LEGAL_NAME = 'PT Dwindo Berlian Samjaya';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/dina.png`;
export const LOGO_URL = `${SITE_URL}/logo/logo_dwindo.png`;

/**
 * Pembuat URL terpusat untuk mencegah inkonsistensi rute internal (Bab 15 #2)
 */
export const buildUrl = (type, slug = '') => {
    switch (type) {
        case 'home':
            return '/';
        case 'price-list':
        case 'pricelist':
            return '/price-list';
        case 'dealer':
        case 'lokasi-dealer':
            return '/lokasi-dealer';
        case 'aksesoris':
            return '/aksesoris';
        case 'booking':
            return '/booking';
        case 'artikel-list':
            return '/artikel';
        case 'artikel':
            return slug ? `/artikel/${encodeURIComponent(slug)}` : '/artikel';
        case 'faq':
            return '/faq';
        case 'kanal-resmi':
        case 'tentang-kami':
            return '/kanal-resmi';
        case 'chat-history':
            return '/chat-history';
        default:
            return '/';
    }
};

export const getBaseGraph = () => [
    {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        legalName: LEGAL_NAME,
        url: `${SITE_URL}/`,
        logo: {
            '@type': 'ImageObject',
            url: LOGO_URL
        },
        sameAs: [
            dealerData?.social?.instagram || 'https://www.instagram.com/dwindoberliansamjaya/',
            dealerData?.social?.youtube || 'https://www.youtube.com/@dwindoberliansamjaya635'
        ],
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                telephone: '+62-21-7458383',
                areaServed: 'ID',
                availableLanguage: ['id']
            }
        ]
    },
    {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: BRAND_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'id'
    }
];

export const getAutoDealerGraphNodes = () => {
    if (!dealerData?.branches) return [];
    return dealerData.branches.map((b) => ({
        '@type': 'AutoDealer',
        '@id': `${SITE_URL}/lokasi-dealer#${b.slug}`,
        name: `Mitsubishi ${b.name} (${LEGAL_NAME})`,
        parentOrganization: { '@id': `${SITE_URL}/#organization` },
        image: DEFAULT_OG_IMAGE,
        url: `${SITE_URL}/lokasi-dealer`,
        telephone: b.phone_intl || b.phone,
        priceRange: 'Rp 240.000.000 - Rp 1.500.000.000',
        address: {
            '@type': 'PostalAddress',
            streetAddress: b.street_address || b.address,
            addressLocality: b.locality || 'Kota Tangerang Selatan',
            addressRegion: b.region || 'Banten',
            postalCode: b.postal_code || '15220',
            addressCountry: 'ID'
        },
        ...(b.latitude && b.longitude
            ? {
                  geo: {
                      '@type': 'GeoCoordinates',
                      latitude: Number(b.latitude),
                      longitude: Number(b.longitude)
                  }
              }
            : {}),
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '16:30'
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Saturday'],
                opens: '08:00',
                closes: '15:00'
            }
        ],
        hasMap: b.maps_direction
    }));
};

export const getBreadcrumbNode = (items = []) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        ...(item.path ? { item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}` } : {})
    }))
});

export const getFaqNode = (faqs = []) => ({
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
            '@type': 'Answer',
            text: f.a
        }
    }))
});

// ── Data FAQ Kontekstual & Pusat (Berbasis Knowledge Base) ──
export const PRICE_LIST_FAQS = [
    {
        q: 'Apakah harga OTR Mitsubishi di Dwindo Bintaro sudah termasuk gratis biaya servis berkala?',
        a: 'Ya. Setiap pembelian unit baru kendaraan penumpang Mitsubishi Motors dilengkapi paket SMART Package yang mencakup gratis biaya jasa dan suku cadang perawatan berkala mulai 10.000 KM hingga 50.000 KM atau 4 tahun (mana yang tercapai lebih dulu sesuai buku servis).'
    },
    {
        q: 'Berapa tambahan biaya untuk pilihan warna putih (Quartz White Pearl) pada Xpander dan Pajero Sport?',
        a: 'Untuk warna Quartz White Pearl terdapat tambahan biaya Rp 1.500.000 pada Mitsubishi Xpander, Xpander Cross, dan Xforce, serta Rp 3.000.000 pada New Pajero Sport.'
    },
    {
        q: 'Bagaimana cara menghitung simulasi kredit dan DP minimal mobil Mitsubishi?',
        a: 'Anda dapat menggunakan fitur Simulasi Kredit di situs ini atau bertanya langsung kepada asisten virtual DINA 24/7. Tersedia pilihan tenor 1 hingga 5 tahun dengan berbagai lembaga pembiayaan resmi rekanan PT Dwindo Berlian Samjaya.'
    },
    {
        q: 'Apakah melayani pembelian fleet/perusahaan untuk truk Fuso Canter dan Fighter X?',
        a: 'Ya, PT Dwindo Berlian Samjaya melayani pembelian perorangan maupun korporasi (fleet) untuk seluruh lini kendaraan niaga Mitsubishi L300, Triton, Fuso Canter, dan Fighter X lengkap dengan dukungan karoseri serta kontrak servis.'
    }
];

export const BOOKING_FAQS = [
    {
        q: 'Kapan saja jam operasional dan slot booking service di bengkel resmi Mitsubishi Dwindo Bintaro?',
        a: 'Slot booking service online tersedia setiap Senin–Sabtu pada pukul 08:00, 09:00, 10:00, 11:00, dan 13:00 WIB (khusus servis ringan non-kelipatan 20.000 KM), serta hari Minggu pukul 08:00 hingga 11:00 WIB.'
    },
    {
        q: 'Apa saja yang ditanggung dalam gratis servis berkala SMART Package 10.000–50.000 KM?',
        a: 'Paket SMART Mitsubishi menanggung biaya jasa dan suku cadang perawatan berkala (seperti Oli Mesin, Oil Filter, Filter AC, Engine Flush, Brake Fluid, dan item berkala lainnya sesuai jadwal KM) hingga 50.000 KM atau 4 tahun sejak tanggal penyerahan kendaraan (PKT).'
    },
    {
        q: 'Apa itu Extended SMART Package untuk kendaraan di atas 50.000 KM dan berapa biayanya?',
        a: 'Extended SMART Package adalah paket perpanjangan servis berkala untuk mobil Mitsubishi yang telah melewati 50.000 KM atau 4 tahun. Tersedia pilihan 1XPM (6 bulan) hingga 6XPM (36 bulan) mulai Rp 1.387.500 untuk Xpander dan Rp 2.497.500 untuk Pajero Sport, menghemat biaya hingga 25–27% ditambah perpanjangan garansi item terbatas 1 tahun/30.000 KM.'
    },
    {
        q: 'Berapa biaya paket perawatan AC (AC Clean & AC Care) di bengkel Dwindo Bintaro?',
        a: 'Tersedia paket AC Care (sterilisasi kabin) Rp 195.000, Cooling Grid Cleaner Rp 273.000, AC Clean (pembersihan evaporator & blower) Rp 338.000, serta paket AC Fresh Berat mulai Rp 1.040.000.'
    }
];

export const AKSESORIS_FAQS = [
    {
        q: 'Apakah pemasangan aksesoris resmi di Dwindo Bintaro memengaruhi garansi kelistrikan dan bodi mobil?',
        a: 'Tidak. Seluruh aksesoris asli Mitsubishi Motors dirancang secara presisi (plug-and-play) dan dipasang oleh teknisi tersertifikasi di bengkel resmi PT Dwindo Berlian Samjaya sehingga garansi resmi kendaraan tetap terjaga.'
    },
    {
        q: 'Paket aksesoris apa saja yang tersedia untuk Mitsubishi Destinator, Xforce, dan Xpander?',
        a: 'Tersedia Aero Package, Aero Plus Package, Active Package, Platinum Package, Safety Package, serta item satuan seperti Dashcam Blackvue, Side Visor, Tailgate Spoiler, Scuff Plate, dan Luggage Tray.'
    },
    {
        q: 'Apakah harga aksesoris sudah termasuk pemasangan?',
        a: 'Untuk kepastian estimasi jasa pemasangan atau promo paket bundling pembelian unit baru, Anda dapat langsung menekan tombol Pesan via DINA pada item aksesoris yang diinginkan.'
    }
];

export const ALL_FAQS_CATEGORIZED = [
    {
        category: 'Lokasi Dealer & Keamanan Transaksi',
        items: [
            {
                q: 'Di mana lokasi cabang resmi Mitsubishi PT Dwindo Berlian Samjaya dan berapa nomor teleponnya?',
                a: 'PT Dwindo Berlian Samjaya memiliki 3 cabang resmi 3S: (1) Dwindo Bintaro di Jl. MH. Thamrin Blok A-01, Bintaro Jaya Sektor 7 (Jl. HR Rasuna Said, Pd. Jaya, Kec. Pd. Aren), Kota Tangerang Selatan 15220, Telp: (021) 745-8383; (2) Dwindo Radin Inten di Jl. Radin Inten II, Duren Sawit, Jakarta Timur 13440, Telp: (021) 2948-3888; dan (3) Dwindo Cakung di Jl. Raya Bekasi KM 26, Ujung Menteng, Cakung, Jakarta Timur 13960, Telp: (021) 2246-1888.'
            },
            {
                q: 'Bagaimana cara memastikan transaksi pembelian mobil di Dwindo Bintaro aman dan resmi?',
                a: 'Pastikan seluruh pembayaran booking fee, uang muka (DP), maupun pelunasan unit hanya ditransfer ke rekening bank perusahaan resmi atas nama PT Dwindo Berlian Samjaya. Kami tidak pernah menggunakan rekening pribadi untuk pembayaran transaksi kendaraan.'
            },
            {
                q: 'Apa itu asisten virtual DINA (Dwindo Intelligent Assistant)?',
                a: 'DINA adalah asisten virtual berbasis AI resmi dari Mitsubishi Motors Dwindo Bintaro yang aktif 24/7 di situs csdwindo.com untuk membantu cek harga OTR, promo bulanan, simulasi kredit, cek stok suku cadang, penjadwalan test drive, dan booking service.'
            }
        ]
    },
    {
        category: 'Pembelian Kendaraan, Harga OTR & Simulasi Kredit',
        items: PRICE_LIST_FAQS
    },
    {
        category: 'Booking Service, Perawatan Berkala & Extended SMART Package',
        items: BOOKING_FAQS
    },
    {
        category: 'Suku Cadang Asli & Aksesoris Resmi',
        items: AKSESORIS_FAQS
    }
];
