import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/HelpFAQPage.css';

const FAQItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="faq-item">
            <button className="faq-question" onClick={() => setOpen(!open)}>
                {question}
                <span className="faq-icon">{open ? '−' : '+'}</span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        className="faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FAQItem;
