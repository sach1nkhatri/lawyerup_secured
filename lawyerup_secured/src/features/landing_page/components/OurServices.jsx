import React from 'react';
import '../css/OurServices.css';
import serviceImage from '../../../app/assets/Ourservices.png';

const services = [
    {
        number: 1,
        title: "AI-Powered Legal Assistant",
        description:
            "Chat with an intelligent bot trained on Nepal’s Constitution, Civil Code, Criminal Code, and more. Ask legal questions and get instant, accurate guidance.",
    },
    {
        number: 2,
        title: "Stay Informed with Legal News",
        description:
            "Get the latest updates, amendments, and articles on Nepali law. Never miss a crucial change in the legal landscape.",
    },
    {
        number: 3,
        title: "Book Lawyers with Ease",
        description:
            "Find, compare, and book verified legal professionals. Schedule appointments quickly through our trusted platform.",
    },
    {
        number: 4,
        title: "Explore the Law Library",
        description:
            "Access a digital archive of official legal documents in one place. From tax law to company acts—search and read with ease.",
    },
];

const OurServices = () => {
    return (
        <section className="services-section" id="services">
            <div className="services-left">
                <h2>Our Services</h2>
                <ul className="service-list">
                    {services.map((s) => (
                        <li key={s.number}>
                            <div className="service-number">{s.number}</div>
                            <div className="service-content">
                                <h4>{s.title}</h4>
                                <p>{s.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="services-right">
                <img src={serviceImage} alt="Services" />
            </div>
        </section>
    );
};

export default OurServices;
