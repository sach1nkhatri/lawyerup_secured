import React from 'react';
import '../css/Modal.css';

const PrivacyModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <button className="modal-close-icon" onClick={onClose}>&times;</button>
                <h2>Privacy & Policy</h2>
                <div className="modal-content">
                    <p>
                        At LawyerUp, your privacy is our priority. All communication between users
                        and lawyers is encrypted end-to-end using our custom encryption protocol.
                    </p>
                    <p>
                        We use authenticated APIs, encrypted storage, and secure backend infrastructure
                        to ensure your data is never exposed or misused.
                    </p>
                    <p>
                        Your chat history, bookings, and uploaded documents are never shared with
                        third parties and can be deleted on request. Everything remains between you,
                        your lawyer, and the platform.
                    </p>
                    <p>
                        LawyerUp does not sell your data or use it for advertising. Our system is built
                        for privacy, transparency, and trust.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;
