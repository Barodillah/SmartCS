import React from 'react';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import FeaturedModels from '../components/sections/FeaturedModels';
import VirtualCSHub from '../components/sections/VirtualCSHub';
import Advantage from '../components/sections/Advantage';

const Home = () => {
    return (
        <main>
            <Hero />
            <Services />
            <FeaturedModels />
            <VirtualCSHub />
            <Advantage />
        </main>
    );
};

export default Home;
