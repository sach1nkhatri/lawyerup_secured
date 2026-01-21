import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../css/ChatBody.module.css';

const ChatBody = ({ messages, isGenerating, responseTime }) => {
    const bottomRef = useRef();

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className={styles.chatScroll}>
            {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`${styles.bubble} ${msg.sender === 'user' ? styles.user : styles.bot}`}
                >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    {msg.sender === 'bot' && i === messages.length - 1 && isGenerating && (
                        <span className={styles.typingDots}>⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏</span>
                    )}
                    {msg.sender === 'bot' && i === messages.length - 1 && !isGenerating && responseTime && (
                        <div className={styles.responseTime}>⏱ {responseTime}ms</div>
                    )}
                </div>
            ))}
            <div ref={bottomRef} /> {/* 👈 This will be auto-scrolled into view */}
        </div>
    );
};

export default ChatBody;
