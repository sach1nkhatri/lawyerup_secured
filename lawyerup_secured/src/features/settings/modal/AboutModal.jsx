import React from 'react';
import '../css/Modal.css';

const AboutModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <button className="modal-close-icon" onClick={onClose}>&times;</button>
                <h2>About Us</h2>
                <div className="modal-content">
                    <p>
                        LawyerUp is a simple legal support platform created to help people in Nepal
                        connect with verified lawyers and get guidance when they need it.
                    </p>
                    <p>
                        It was built to make legal help more accessible, especially for those who
                        may feel overwhelmed by traditional processes.
                    </p>
                    <p>
                        From booking appointments to asking legal questions through AI, every
                        feature is designed with clarity and ease of use in mind.
                    </p>
                    <p>
                        This platform is built and maintained by a single developer. If you come
                        across any issues or bugs, please report them — I’ll do my best to fix
                        them and make LawyerUp better for everyone.
                    </p>
                    <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
                        Contact: <br />
                        Email: <a href="mailto:sachin10392313@gmail.com">sachin10392313@gmail.com</a> <br />
                        Site: <a href="https://sachin.bio" target="_blank" rel="noopener noreferrer">sachin.bio</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
