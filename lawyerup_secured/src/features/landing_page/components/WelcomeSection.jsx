import React from 'react';
import '../css/WelcomeSection.css';
import lawyerImg from '../../../app/assets/lawyerstanding.png';

const WelcomeSection = () => {
    return (
        <section className="welcome-section">
            <div className="welcome-text">
                <h1>Navigate the Law.<br />Powered by A.I.</h1>
                <p>
                    Explore Nepal’s Law and legal codes in seconds.<br />
                    Fast, reliable, and built for clarity — no legal jargon required.
                </p>
                <button className="welcome-btn">Free Trial Now</button>
            </div>
            <div className="welcome-image">
                <img src={lawyerImg} alt="Lawyer standing" />
            </div>
        </section>
    );
};

export default WelcomeSection;
