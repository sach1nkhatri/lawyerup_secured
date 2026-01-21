import React from 'react';
import '../css/AboutUs.css';
import chatbot from '../../../app/assets/chatbot.png';
import news from '../../../app/assets/news.png';
import law from '../../../app/assets/law.png';
import hammer from '../../../app/assets/qwhammer.png';
import gemma from '../../../app/assets/gemma3.png';

const AboutUs = () => {
    return (
        <section className="aboutus-section" id="about">
            <div className="aboutus-intro">
                <h2>Chat With Our <span className="highlight">LawAi</span></h2>
                <p>Powered By</p>
                <img src={gemma} alt="Gemma 3" className="gemma-img" />
            </div>

            <div className="aboutus-content">
                <div className="features-grid">
                    <div className="feature-card">
                        <img src={chatbot} alt="Legal Text Generate" />
                        <h4>Legal Text Generate</h4>
                        <p>Get high quality legal text with our Law AI</p>
                    </div>
                    <div className="feature-card">
                        <img src={news} alt="News & Article" />
                        <h4>News & article</h4>
                        <p>Get updated with latest law news and Articles</p>
                    </div>
                    <div className="feature-card">
                        <img src={law} alt="Law Pdf" />
                        <h4>Law Pdf</h4>
                        <p>Browse our library of legal Assets</p>
                    </div>
                    <div className="feature-card">
                        <img src={hammer} alt="LawyerUp" />
                        <h4>LawyerUp</h4>
                        <p>Book Yourself Lawyers For Legal Consult</p>
                    </div>
                </div>

                <div className="aboutus-right">
                    <h2>Why Choose LawyerUp</h2>
                    <p>
                        LawyerUp AI is designed to make legal knowledge accessible,
                        understandable, and available on demand. Built around the Constitution and major laws of Nepal, it helps users from citizens to legal professionals get clear, accurate insights from complex legal texts.
                        <br /><br />
                        By combining advanced language models with a vector database of structured legal content, it offers intelligent, human-like assistance for legal queries without the jargon or confusion.
                    </p>
                    <button
                        className="get-started-btn"
                        onClick={() => {
                            document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
                        }}
                    >
                        Get Started Now!
                    </button>

                </div>
            </div>
        </section>
    );
};

export default AboutUs;
