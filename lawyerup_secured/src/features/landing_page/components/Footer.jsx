import React from 'react';
import '../css/Footer.css';
import logo from '../../../app/assets/logo2.png';
import play from '../../../app/assets/playstore.png';
import appstore from '../../../app/assets/appstore.png';
import facebook from '../../../app/assets/facebook.png';
import twitter from '../../../app/assets/twitter.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <img src={logo} alt="LawyerUp Icon" className="footer-logo"/>
                    <img src={require('../../../app/assets/textlogowhite.png')} alt="LawyerUp Text Logo"
                         className="footer-text-logo"/>
                </div>
                <div className="footer-columns">
                    <div className="footer-column">
                        <h4>Product</h4>
                        <a href="https://attenai.com/">AttenAI</a>
                        <a href="https://chilli-audioworks.web.app/">ChilliAudioworks</a>
                        <a href="https://github.com/sach1nkhatri/KhajaKhoj">Khaja Khoj</a>
                    </div>
                    <div className="footer-column">
                        <h4>Company</h4>
                        <a href="https://sachin.bio/">About me</a>
                        <a href="https://sachin.bio/contact">Contact</a>
                        <a href="https://sachin.bio/work">Works</a>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <a href="https://sachin.bio/blog">Blog</a>
                        <a href="https://github.com/sach1nkhatri">Github</a>
                        <a href="https://sachinblog-11fa4.web.app/">Hack</a>
                    </div>
                </div>

                <div className="footer-newsletter">
                    <h4>Also find us on</h4>
                    <div className="footer-stores">
                        <img src={play} alt="Play Store" />
                        <img src={appstore} alt="App Store" />
                    </div>

                    <h5>Join our news letter</h5>
                    <div className="footer-subscribe">
                        <input type="email" placeholder="Hello@gmail.com" />
                        <button>Subscribe Now</button>
                    </div>
                </div>
            </div>

            <hr />

            <div className="footer-bottom">
                <p>© 2025 LawyerUp AI All Right Reserved</p>
                <div className="footer-socials">
                    <img src={facebook} alt="Facebook" />
                    <img src={twitter} alt="Twitter" />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
