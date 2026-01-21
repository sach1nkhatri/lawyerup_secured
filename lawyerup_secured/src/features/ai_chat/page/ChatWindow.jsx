import React, { useState } from 'react';
import useChat from '../hooks/useChat';
import ChatView from './ChatView';
import ChatHistoryPopup from '../component/ChatHistoryPopup';
import ChatPdfUpload from '../component/chatPdfUpload';

import plusIcon from '../../../app/assets/plus.png';
import sendIcon from '../../../app/assets/send.png';
import historyIcon from '../../../app/assets/history.png';

import styles from '../css/ChatWindow.module.css';
import useChatHistory from '../hooks/useChatHistory';
import API from '../../../app/api/api_endpoints';

const ChatWindow = () => {
    const [showHistory, setShowHistory] = useState(false);
    const [showPdfUpload, setShowPdfUpload] = useState(false);

    const {
        messages,
        input,
        setInput,
        handleSend,
        textareaRef,
        resizeTextarea,
        hasStarted,
        isGenerating,
        responseTime,
        chatId,
        title,
        model,
        setModel,
        newChat,
        loadChat,
    } = useChat();

    const handleChatSelect = async (chatId) => {
        const token = localStorage.getItem('lawyerup_token');
        try {
            const res = await fetch(`${API.AI}/chats/${chatId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const fullChat = await res.json();
            loadChat(fullChat);
        } catch (err) {
            console.error('❌ Failed to load chat:', err.message);
        }
    };

    const {
        history,
        isLoadingHistory,
        removeChat
    } = useChatHistory();

    const handleSampleClick = (sampleText) => {
        setInput(sampleText);
        handleSend(sampleText);
    };

    return (
        <div className={styles.chatWrapper}>
            <div className={styles.historyIcon} onClick={() => setShowHistory(true)}>
                <img src={historyIcon} alt="history" />
            </div>

            {showHistory && (
                <ChatHistoryPopup
                    history={history}
                    isLoading={isLoadingHistory}
                    onDelete={removeChat}
                    onClose={() => setShowHistory(false)}
                    onLoadChat={handleChatSelect}
                    onNewChat={newChat}
                />
            )}

            {showPdfUpload && (
                <ChatPdfUpload
                    chatId={chatId}
                    onClose={() => setShowPdfUpload(false)}
                    onSend={(message) => {
                        setInput(message);
                        handleSend(message);
                    }}
                />
            )}

            {!hasStarted ? (
                <div className={styles.introContainer}>
                    <div className={styles.chatTitle}>Ask Any Law related to Nepal</div>
                    <div className={styles.sampleRow}>
                        <div className={styles.sampleBubble} onClick={() => handleSampleClick("What is law?")}>What is law?</div>
                        <div className={styles.sampleBubble} onClick={() => handleSampleClick("Transfer property to family")}>Transfer property to family</div>
                        <div className={styles.sampleBubble} onClick={() => handleSampleClick("Marriage certificate in Nepal")}>Marriage certificate in Nepal</div>
                    </div>
                    <div className={styles.chatBar}>
                        <div className={styles.chatButton} onClick={() => setShowPdfUpload(true)}>
                            <img src={plusIcon} alt="upload pdf" />
                        </div>
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            placeholder="Ask a legal question..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                resizeTextarea();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <div className={styles.chatButton} onClick={() => handleSend()}>
                            <img src={sendIcon} alt="send" />
                        </div>
                    </div>
                </div>
            ) : (
                <ChatView
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    textareaRef={textareaRef}
                    isGenerating={isGenerating}
                    responseTime={responseTime}
                    title={title}
                    setShowPdfUpload={setShowPdfUpload}
                    model={model}
                    setModel={setModel}
                    onNewChat={newChat}
                    onLoadChat={loadChat}
                />
            )}
        </div>
    );
};

export default ChatWindow;
