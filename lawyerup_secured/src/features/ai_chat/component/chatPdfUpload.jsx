import React, { useState, useEffect } from 'react';
import API from '../../../app/api/api_endpoints';
import styles from '../css/ChatPdfUpload.module.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ChatPdfUpload = ({ chatId, onClose, onSend }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userRaw = localStorage.getItem('lawyerup_user');
        if (userRaw) {
            const user = JSON.parse(userRaw);
            if (user.plan === 'Free Trial') {
                Swal.fire({
                    title: 'Upgrade Required',
                    text: 'PDF upload is only available to Premium users.',
                    icon: 'warning',
                    confirmButtonText: 'Get Premium',
                    showCancelButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/checkout'); // 🔁 Adjust path if needed
                    } else {
                        onClose(); // 👈 Close the modal if they cancel
                    }
                });
            }
        }
    }, [navigate, onClose]);

    const handleUpload = async () => {
        if (!file) return;

        const token = localStorage.getItem('lawyerup_token');
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('chatId', chatId);

        try {
            setLoading(true);
            await fetch(`${API.AI}/upload/chatpdf`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            onSend(`📄 Uploaded PDF: ${file.name}`);
            onClose();
        } catch (err) {
            console.error('❌ Upload failed:', err);
            alert('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popup}>
            <div className={styles.content}>
                <h4>Upload PDF</h4>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={handleUpload} disabled={loading || !file}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button className={styles.closeBtn} onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default ChatPdfUpload;
