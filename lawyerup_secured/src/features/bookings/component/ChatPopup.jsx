import React, { useEffect } from 'react';
import '../css/ChatPopup.css';
import MessageBubble from './MessageBubble';
import { useChat } from '../hooks/useChat';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true,
});

const ChatPopup = ({ bookingId, senderId, receiver, visible, onClose }) => {
    const {
        messages,
        text,
        setText,
        sendMessage,
        messagesEndRef,
        isTyping
    } = useChat(bookingId, senderId, visible);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // ✅ This prevents multiple popups from overlapping
    if (!visible) return null;

    return (
        <div className="chat-popup-container">
            <div className="chat-popup">
                <div className="chat-header" onClick={onClose}>
                    Chat with {receiver?.fullName}
                    <span>❌</span>
                </div>
                <div className="chat-body">
                    {messages.map((msg, idx) => (
                        <MessageBubble key={idx} msg={msg} isSender={msg.sender?._id === senderId} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {isTyping && <div className="typing-indicator">Typing...</div>}
                <div className="chat-footer">
                    <input
                        value={text}
                        onChange={e => {
                            setText(e.target.value);
                            socket.emit('userTyping', bookingId);
                        }}
                        placeholder="Type message..."
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
