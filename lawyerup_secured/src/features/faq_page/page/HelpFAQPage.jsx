import React from 'react';
import FAQItem from '../component/FAQItem';
import { useSupportEmail } from '../hooks/useSupportEmail';
import { useFaqs } from '../hooks/useFaqs';
import '../css/HelpFAQPage.css';

const HelpFAQPage = () => {
    const { faqs, loading } = useFaqs();
    const handleSupportClick = useSupportEmail();

    return (
        <div className="faq-container">
            <h1 className="faq-title">Help & FAQ</h1>
            <p className="faq-intro">Got a question? We’ve got answers below.</p>

            {loading ? (
                <p>Loading FAQs...</p>
            ) : faqs.length === 0 ? (
                <p className="empty">No FAQs available.</p>
            ) : (
                faqs.map((faq) => (
                    <FAQItem key={faq._id} question={faq.question} answer={faq.answer} />
                ))
            )}

            <div className="faq-footer">
                <button className="support-btn" onClick={handleSupportClick}>
                    Contact Support
                </button>
            </div>
        </div>
    );
};

export default HelpFAQPage;
