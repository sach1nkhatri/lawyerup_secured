import React from 'react';
import '../css/ChatPopup.css';

const MessageBubble = ({ msg, isSender }) => {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`chat-bubble ${isSender ? 'sent' : 'received'}`}>
            <div className="bubble-header">
                <strong>{msg.sender?.fullName || 'User'}</strong>
                <span className="timestamp">{time}</span>
            </div>
            <div>{msg.text}</div>
            <div className="status">{isSender ? '✔ Sent' : '✔✔ Read'}</div>
        </div>
    );
};

export default MessageBubble;
