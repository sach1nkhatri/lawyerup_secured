import React, { useState } from 'react';
import styles from '../css/ChatHeader.module.css';
import historyIcon from '../../../app/assets/history.png';
import ChatHistoryPopup from './ChatHistoryPopup';
import useChatHistory from '../hooks/useChatHistory';

const ChatHeader = ({ title = "New Chat", onLoadChat, onNewChat, selectedModel, onModelChange }) => {
    const [showPopup, setShowPopup] = useState(false);
    const { history, removeChat } = useChatHistory();

    const handleSelect = async (id) => {
        const chat = history.find(c => c._id === id);
        if (chat) {
            onLoadChat?.(chat);
            setShowPopup(false);
        }
    };

    const handleDelete = async (id) => {
        await removeChat(id);
    };

    return (
        <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
                <img
                    src={historyIcon}
                    alt="history"
                    className={styles.chatIcon}
                    onClick={() => setShowPopup(true)}
                />
                <span>{title}</span>
                <span className={styles.chevron}>›</span>
            </div>

            <select value={selectedModel} onChange={(e) => onModelChange(e.target.value)}>
                <option value="lawai-1.0">LawAI 1.0</option>
                <option value="lawai-2.0">LawAI 2.0</option>
                <option value="lawai-3.0">LawAI 3.0</option>
            </select>

            {showPopup && (
                <ChatHistoryPopup
                    history={history}
                    onLoadChat={handleSelect}
                    onDelete={handleDelete}
                    onNewChat={() => {
                        onNewChat?.();
                        setShowPopup(false);
                    }}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

export default ChatHeader;