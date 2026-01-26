import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SideMenu from '../components/layout/SideMenu';
import HeroSection from '../components/main/HeroSection';
import FeaturesSection from '../components/main/FeaturesSection';
import ProcessSection from '../components/main/ProcessSection';
import PricingSection from '../components/main/PricingSection';

function MainPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <Header onMenuOpen={() => setMenuOpen(true)} />
            <HeroSection />
            <FeaturesSection />
            <ProcessSection />
            <PricingSection />
            <Footer />
            <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
    );
}

export default MainPage;