import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import priceListData from '../../knowledge/price_list.json';
import { formatCurrency, ANGULAR_CLIP } from '../utils/constants';
import AngularButton from '../components/ui/AngularButton';

const PriceList = () => {
    const [category, setCategory] = useState('passenger_car'); // 'passenger_car' or 'commercial_car'
    const isCommercial = category === 'commercial_car';
    
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

    return (
        <div className={`min-h-screen pt-24 ${theme.bg} ${theme.fontFamily} transition-colors duration-500`}>
            
            {/* Header Section */}
            <div className="bg-white py-12 shadow-sm relative z-10">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                    <div className="text-center mb-10">
                        <h1 className={`${theme.headingFont} text-5xl md:text-6xl uppercase mb-4 text-[#111111]`}>Daftar Harga</h1>
                        <p className="text-gray-500 text-lg">Periode {priceListData.meta.periode} • OTR Jabodetabek</p>
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <AngularButton 
                            variant={!isCommercial ? 'primary' : 'secondary'}
                            onClick={() => setCategory('passenger_car')}
                            className={isCommercial ? '!border-gray-300 !text-gray-400 hover:!border-gray-800 hover:!text-gray-800 !bg-transparent' : ''}
                        >
                            Passenger Car
                        </AngularButton>
                        
                        <AngularButton 
                            variant={isCommercial ? 'primary' : 'secondary'}
                            onClick={() => setCategory('commercial_car')}
                            className={isCommercial ? '!bg-[#FE5E00] hover:!bg-[#D94F00] !border-none text-white' : '!border-gray-300 !text-gray-400 hover:!border-gray-800 hover:!text-gray-800 !bg-transparent'}
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
            </div>
            
        </div>
    );
};

export default PriceList;
