import React from 'react';
import Header from '../components/Header';
import WelcomeSection from '../components/WelcomeSection';
import AboutUs from '../components/AboutUs';
import OurServices from '../components/OurServices';
import Plans from '../components/PricingPlans';
import Footer from '../components/Footer';
const LandingPage = () => {
    return (
        <>
            <Header />
            <WelcomeSection />
            <AboutUs />
            <OurServices />
            <Plans/>
            <Footer />
        </>
    );
};

export default LandingPage;
