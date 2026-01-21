import React from 'react';
import styles from '../css/ChatInputBox.module.css';
import plusIcon from '../../../app/assets/plus.png';
import sendIcon from '../../../app/assets/send.png';
import Swal from 'sweetalert2';

const ChatInputBox = ({
                          input,
                          setInput,
                          handleSend,
                          textareaRef,
                          onUploadClick,
                          locked = false
                      }) => {
    const handleLockedAlert = () => {
        Swal.fire({
            icon: 'info',
            title: 'Trial Ended',
            text: 'You’ve reached your daily limit. Please try again after midnight or upgrade your plan.',
            confirmButtonText: 'Okay'
        });
    };

    const handleSafeSend = () => {
        if (locked) {
            handleLockedAlert();
        } else {
            handleSend();
        }
    };

    const handleSafeUpload = () => {
        if (locked) {
            handleLockedAlert();
        } else {
            onUploadClick();
        }
    };

    return (
        <div className={styles.chatInput}>
            <button className={styles.btn} onClick={handleSafeUpload}>
                <img src={plusIcon} alt="Upload" className={styles.icon} />
            </button>

            <textarea
                ref={textareaRef}
                value={input}
                disabled={locked}
                onChange={(e) => {
                    if (locked) {
                        handleLockedAlert();
                        return;
                    }
                    setInput(e.target.value);
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSafeSend();
                    }
                }}
                placeholder="Ask your legal question..."
                rows={1}
            />

            <button className={styles.btn} onClick={handleSafeSend}>
                <img src={sendIcon} alt="Send" className={styles.icon} />
            </button>
        </div>
    );
};

export default ChatInputBox;
