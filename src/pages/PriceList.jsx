import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import defaultPriceListData from '../../knowledge/price_list.json';
import { formatCurrency, ANGULAR_CLIP } from '../utils/constants';
import AngularButton from '../components/ui/AngularButton';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PriceList = () => {
    const [category, setCategory] = useState('passenger_car'); // 'passenger_car' or 'commercial_car'
    const isCommercial = category === 'commercial_car';
    const [isDownloading, setIsDownloading] = useState(false);
    const [priceListData, setPriceListData] = useState(defaultPriceListData);

    useEffect(() => {
        fetch('https://csdwindo.com/api/pricelist/index.php')
            .then(res => res.json())
            .then(data => {
                if (data.status && data.data) {
                    setPriceListData(data.data);
                }
            })
            .catch(e => console.error('Failed to fetch dynamic price list', e));
    }, []);

    // Theme configurations
    const theme = {
        primary: isCommercial ? '#FE5E00' : '#E60012',
        secondary: isCommercial ? '#F7C92C' : '#111111',
        fontFamily: isCommercial ? "font-['Montserrat']" : "font-body",
        bg: isCommercial ? "bg-gray-50" : "bg-[#F5F5F5]",
        headingFont: isCommercial ? "font-['Montserrat'] font-black" : "font-display font-extrabold"
    };

    const data = priceListData[category];

    // Helper to render Passenger Cars
    const renderPassengerCars = () => {
        return Object.entries(data).map(([modelKey, modelData]) => (
            <div key={modelKey} className="mb-16">
                <h3 className={`${theme.headingFont} text-3xl uppercase text-[#111111] mb-8 border-l-4 pl-4`} style={{ borderColor: theme.primary }}>
                    {modelKey.split('_').join(' ')}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <img src={modelData.image} alt={modelKey} className="w-full h-auto object-cover rounded shadow-lg" />
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modelData.items.map((item, idx) => (
                                <div key={idx} className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow border-t-2" style={{ borderTopColor: theme.primary }}>
                                    <h4 className="font-bold text-lg mb-2 text-gray-800">{item.type}</h4>
                                    <div className={`text-xl font-bold`} style={{ color: theme.primary }}>{formatCurrency(item.price)}</div>
                                </div>
                            ))}
                        </div>

                        {modelData.additional_cost && (
                            <div className="bg-white p-4 shadow-sm border-l-4 text-sm text-gray-600" style={{ borderLeftColor: theme.primary }}>
                                <h5 className="font-bold mb-2 uppercase tracking-wide text-xs">Tambahan Biaya:</h5>
                                <ul className="space-y-1">
                                    {Object.entries(modelData.additional_cost).map(([costKey, costValue]) => (
                                        <li key={costKey} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                            <span>{costKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: <strong className="text-gray-800">+{formatCurrency(costValue)}</strong></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ));
    };

    // Helper to render Commercial Cars
    const renderCommercialCars = () => {
        return Object.entries(data).map(([modelKey, modelData]) => (
            <div key={modelKey} className="mb-20">
                <h3 className={`${theme.headingFont} text-4xl uppercase text-[#111111] mb-8 border-l-8 pl-4`} style={{ borderColor: theme.primary }}>
                    {modelKey.split('_').join(' ')}
                </h3>
                <div className="mb-8">
                    <img src={modelData.image} alt={modelKey} className="w-full max-w-2xl mx-auto h-auto object-cover drop-shadow-xl" />
                </div>

                <div className="space-y-12">
                    {Object.entries(modelData.categories).map(([catName, catItems]) => (
                        <div key={catName}>
                            <h4 className="font-bold text-xl uppercase mb-4 text-gray-600 border-b-2 pb-2" style={{ borderBottomColor: theme.secondary }}>{catName.split('_').join(' ')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {catItems.map((item, idx) => (
                                    <div key={idx} className="bg-white p-6 shadow-sm hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: theme.primary }}>
                                        <h5 className="font-bold text-lg mb-1">{item.type}</h5>
                                        <p className="text-sm text-gray-500 mb-3">{item.spec}</p>
                                        <div className="text-xl font-black" style={{ color: theme.primary }}>{formatCurrency(item.price)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category]);

    const getBase64ImageFromUrl = (imageUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            const timeout = setTimeout(() => {
                console.error('Image load timeout:', imageUrl);
                resolve(null);
            }, 8000); // 8 second timeout per image

            img.onload = () => {
                clearTimeout(timeout);
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF'; // White background for transparent PNGs
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            
            img.onerror = () => {
                if (!img.src.includes('allorigins')) {
                    // Fallback to proxy if direct CORS fails
                    img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
                } else {
                    clearTimeout(timeout);
                    console.error('Failed to load image even with proxy:', imageUrl);
                    resolve(null);
                }
            };
            
            img.src = imageUrl;
        });
    };

    const getBase64FontFromUrl = async (url) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Failed to load font', e);
            return null;
        }
    };

    const handleDownloadPdf = async () => {
        if (isDownloading) return;
        setIsDownloading(true);

        try {
            const doc = new jsPDF();
            const title = isCommercial ? 'Pricelist Commercial Car - Mitsubishi' : 'Pricelist Passenger Car - Mitsubishi';
            const periode = priceListData.meta?.periode || '';

            // Document Header
            let currentFont = 'helvetica';
            const fontUrlNormal = '/font/MMCOFFICE-Regular.ttf';
            const fontUrlBold = '/font/MMCOFFICE-Bold.ttf';
            const fontFileNameNormal = 'MMC.ttf';
            const fontFileNameBold = 'MMC-Bold.ttf';
            const fontAlias = 'MMC';
            
            const [fontBase64Normal, fontBase64Bold] = await Promise.all([
                getBase64FontFromUrl(fontUrlNormal),
                getBase64FontFromUrl(fontUrlBold)
            ]);
            
            if (fontBase64Normal) {
                doc.addFileToVFS(fontFileNameNormal, fontBase64Normal);
                doc.addFont(fontFileNameNormal, fontAlias, 'normal');
                currentFont = fontAlias;
            }
            if (fontBase64Bold) {
                doc.addFileToVFS(fontFileNameBold, fontBase64Bold);
                doc.addFont(fontFileNameBold, fontAlias, 'bold');
            }
            
            doc.setFont(currentFont);
            doc.setFontSize(14);
            doc.setTextColor(17, 17, 17);
            doc.text(title, 10, 14);
            
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Periode: ${periode} | OTR Jabodetabek`, 10, 19);

            let colY = [25, 25];
            const colX = [10, 110];
            const colWidth = 90;
            const pageWidth = 210;

            const models = Object.entries(data);

            for (let i = 0; i < models.length; i++) {
                const [modelKey, modelData] = models[i];
                
                // Pick the column with the smaller Y value to balance columns
                let colIndex = colY[0] <= colY[1] ? 0 : 1;
                let currentY = colY[colIndex];
                const startX = colX[colIndex];

                // Check for page break for this specific column
                if (currentY > 280) {
                    doc.addPage();
                    colY = [15, 15];
                    colIndex = 0;
                    currentY = colY[colIndex];
                }

                // Add Image
                if (modelData.image) {
                    const base64Img = await getBase64ImageFromUrl(modelData.image);
                    if (base64Img) {
                        doc.addImage(base64Img, 'JPEG', startX, currentY, 28, 16, undefined, 'FAST');
                    }
                }

                // Model Name
                const modelName = modelKey.replace(/_/g, ' ').toUpperCase();
                doc.setFontSize(10);
                doc.setTextColor(230, 0, 18); // Primary brand color
                const textX = modelData.image ? startX + 31 : startX;
                doc.text(modelName, textX, currentY + 10);
                
                // Move Y below image
                currentY += 18;

                if (isCommercial) {
                    Object.entries(modelData.categories).forEach(([catName, catItems]) => {
                        const subCatName = catName.replace(/_/g, ' ').toUpperCase();
                        autoTable(doc, {
                            startY: currentY,
                            head: [[subCatName, 'Spesifikasi', 'Harga OTR (Rp)']],
                            body: catItems.map(item => [
                                item.type,
                                item.spec || '-',
                                item.price.toLocaleString('id-ID')
                            ]),
                            theme: 'striped',
                            headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
                            styles: { font: currentFont, fontSize: 6.5, cellPadding: 1 },
                            margin: { left: startX, right: pageWidth - startX - colWidth }
                        });
                        currentY = doc.lastAutoTable.finalY + 3;
                    });
                } else {
                    autoTable(doc, {
                        startY: currentY,
                        head: [['Tipe / Varian', 'Harga OTR (Rp)']],
                        body: modelData.items.map(item => [
                            item.type,
                            item.price.toLocaleString('id-ID')
                        ]),
                        theme: 'striped',
                        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
                        styles: { font: currentFont, fontSize: 6.5, cellPadding: 1 },
                        margin: { left: startX, right: pageWidth - startX - colWidth }
                    });
                    currentY = doc.lastAutoTable.finalY + 3;

                    if (modelData.additional_cost) {
                        const addCosts = Object.entries(modelData.additional_cost).map(([k, v]) => [
                            k.replace(/_/g, ' ').toUpperCase(),
                            `+ ${v.toLocaleString('id-ID')}`
                        ]);
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Tambahan Biaya', 'Nilai (Rp)']],
                            body: addCosts,
                            theme: 'plain',
                            styles: { font: currentFont, fontSize: 6, textColor: [80, 80, 80], cellPadding: 0.8 },
                            headStyles: { textColor: [100, 100, 100], fontStyle: 'bold' },
                            margin: { left: startX, right: pageWidth - startX - colWidth }
                        });
                        currentY = doc.lastAutoTable.finalY + 3;
                    }
                }
                
                colY[colIndex] = currentY + 4; 
            }

            // Add footer branding
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150);
                doc.text(`Harga tidak mengikat dan dapat berubah sewaktu-waktu. Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 10, 290);
                doc.text(`Hal ${i} / ${pageCount}`, 190, 290);
            }

            doc.save(`Pricelist_Mitsubishi_${isCommercial ? 'Commercial' : 'Passenger'}_${periode.replace(/ /g, '_')}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Gagal membuat PDF. Coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={`min-h-screen pt-16 ${theme.bg} ${theme.fontFamily} transition-colors duration-500`}>

            {/* Header Section */}
            <div className="relative py-24 overflow-hidden group">
                {/* Background Image with Overlay */}
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 group-hover:scale-105"
                    style={{ 
                        backgroundImage: `url(${isCommercial ? '/media/list_fuso.webp' : '/media/list_car.jpeg'})`,
                        filter: 'brightness(0.35)' 
                    }}
                />
                
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className={`${theme.headingFont} text-6xl md:text-8xl uppercase mb-4 text-white tracking-tighter leading-none`}>
                            Daftar Harga
                        </h1>
                        <p className="text-gray-300 text-lg md:text-xl font-medium tracking-widest uppercase">
                            Periode {priceListData.meta?.periode || ''} <span className="mx-3 text-[#E60012] opacity-50">/</span> OTR Jabodetabek
                        </p>
                    </motion.div>

                    {/* Toggle */}
                    <div className="flex flex-wrap justify-center gap-6 mt-16">
                        <AngularButton
                            variant={!isCommercial ? 'primary' : 'secondary'}
                            onClick={() => setCategory('passenger_car')}
                            className={isCommercial 
                                ? '!border-white/30 !text-white/70 hover:!border-white hover:!text-white !bg-white/5 backdrop-blur-md' 
                                : 'shadow-[0_20px_50px_rgba(230,0,18,0.3)]'}
                        >
                            Passenger Car
                        </AngularButton>

                        <AngularButton
                            variant={isCommercial ? 'primary' : 'secondary'}
                            onClick={() => setCategory('commercial_car')}
                            className={isCommercial 
                                ? '!bg-[#FE5E00] hover:!bg-[#D94F00] !border-none text-white shadow-[0_20px_50px_rgba(254,94,0,0.3)]' 
                                : '!border-white/30 !text-white/70 hover:!border-white hover:!text-white !bg-white/5 backdrop-blur-md'}
                        >
                            Commercial Car
                        </AngularButton>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16">
                <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {isCommercial ? renderCommercialCars() : renderPassengerCars()}
                </motion.div>

                {/* Download PDF Action */}
                <div className="mt-16 flex justify-center pb-12">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className={`flex items-center gap-3 px-8 py-4 text-white font-bold tracking-wider uppercase transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:hover:scale-100 ${
                            isCommercial ? 'bg-[#FE5E00] hover:bg-[#D94F00] shadow-[#FE5E00]/30' : 'bg-[#E60012] hover:bg-[#B5000F] shadow-[#E60012]/30'
                        }`}
                        style={{ clipPath: ANGULAR_CLIP }}
                    >
                        {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                        {isDownloading ? 'Menyiapkan PDF...' : 'Download Pricelist PDF'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default PriceList;
