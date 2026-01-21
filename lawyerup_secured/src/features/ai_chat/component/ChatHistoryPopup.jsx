import React, { useState } from 'react';
import Swal from 'sweetalert2';
import styles from '../css/ChatHistoryPopup.module.css';

const ChatHistoryPopup = ({ history = [], onLoadChat, onNewChat, onDelete, onClose }) => {
    const [showAll, setShowAll] = useState(false);

    const filteredChats = history.filter(chat =>
        chat.messages?.length > 0 &&
        chat.messages.some(m => m.role?.toLowerCase() === 'assistant')
    );

    const chatsToShow = showAll ? filteredChats : filteredChats.slice(0, 15);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete this chat?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            onDelete(id);
            Swal.fire('Deleted!', 'The chat has been removed.', 'success');
        }
    };

    return (
        <div className={styles.popupOverlay} onClick={onClose}>
            <div className={styles.popupBox} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✖</button>
                <h4>📜 Recent Chats</h4>

                <div className={styles.chatList}>
                    {chatsToShow.map(chat => (
                        <div key={chat._id} className={styles.chatItem}>
                            <div className={styles.chatTitle} onClick={() => onLoadChat(chat._id)}>
                                {chat.title || "Untitled Chat"}
                            </div>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(chat._id)}
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>

                {filteredChats.length > 15 && (
                    <button className={styles.newChatBtn} onClick={() => setShowAll(prev => !prev)}>
                        {showAll ? '🔽 Show Less' : '🔼 See More Chats'}
                    </button>
                )}

                <button className={styles.newChatBtn} onClick={onNewChat}>
                    ➕ Start New Chat
                </button>
            </div>
        </div>
    );
};

export default ChatHistoryPopup;