import React from 'react';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import FeaturedModels from '../components/sections/FeaturedModels';
import VirtualCSHub from '../components/sections/VirtualCSHub';
import Advantage from '../components/sections/Advantage';
import Updates from '../components/sections/Updates';

const Home = () => {
    return (
        <main>
            <Hero />
            <Services />
            <FeaturedModels />
            <VirtualCSHub />
            <Advantage />
            <Updates />
        </main>
    );
};

export default Home;
