import React, { useState } from 'react';
import '../css/Header.css';
import logo from '../../../app/assets/logo2.png';
import logoText from '../../../app/assets/textlogoblack.png';
import {useNavigate} from "react-router-dom";

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const navigate = useNavigate();


    return (
        <header className="header">
            <div className="brand">
                <img src={logo} alt="LawyerUp Icon" className="brand-logo"/>
                <img src={logoText} alt="LawyerUp Text Logo" className="brand-text-logo"/>
            </div>

            <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                ☰
            </div>

            <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                <a href="#about" onClick={toggleMobileMenu}>About Us</a>
                <a href="#services" onClick={toggleMobileMenu}>Services</a>
                <a href="#pricing" onClick={toggleMobileMenu}>Pricing</a>
                <a href="#footer" onClick={toggleMobileMenu}>More</a>
            </nav>


            <button className="signup-btn" onClick={() => navigate('/login')}>
                Sign up
            </button>
        </header>
    );
};

export default Header;
