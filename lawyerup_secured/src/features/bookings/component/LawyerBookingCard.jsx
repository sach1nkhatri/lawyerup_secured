import React, { useState } from 'react';
import '../css/LawyerBookingCard.css';
import { useLawyerBookingCard } from '../hooks/useLawyerBookingCard';
import ChatPopup from './ChatPopup';

const currentUser = JSON.parse(localStorage.getItem('lawyerup_user'));

const LawyerBookingCard = ({ booking, onStatusChange }) => {
    const [chatVisible, setChatVisible] = useState(false);
    const user = booking.user;

    const {
        link,
        setLink,
        isUpdating,
        confirmAndUpdateLink,
        confirmAndUpdateStatus
    } = useLawyerBookingCard(booking, onStatusChange);

    return (
        <div className="user-booking-card">
            <div className="info-section">
                <h2>{user?.fullName || "Unknown"}</h2>
                <p><b>Email:</b> {user?.email}</p>
                <p><b>Contact:</b> {user?.contactNumber || user?.phone}</p>
            </div>

            <hr style={{ margin: '1rem 0', borderTop: '1px dashed #ccc' }} />

            <div className="booking-info">
                <h3>Booking Info</h3>
                <div className="booking-columns">
                    <div>
                        <p><b>Date:</b> {booking.date}</p>
                        <p><b>Time:</b> {booking.time}</p>
                        <p><b>Status:</b> {booking.status}</p>
                        <p><b>Type:</b> {booking.mode}</p>
                        {booking.description && (
                            <p><b>Description:</b> {booking.description}</p>
                        )}
                    </div>
                    <div>
                        <label><b>Meeting Link:</b></label>
                        <input
                            type="text"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            style={{ width: '100%' }}
                        />
                        <button className="update-btn" onClick={confirmAndUpdateLink} disabled={isUpdating}>
                            {isUpdating ? 'Updating...' : 'Update Link'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                {booking.status === 'pending' && (
                    <button className="approve-btn" onClick={() => confirmAndUpdateStatus('approved', 'approve')}>
                        Approve
                    </button>
                )}
                {booking.status === 'approved' && (
                    <button className="complete-btn" onClick={() => confirmAndUpdateStatus('completed', 'complete')}>
                        Mark Completed
                    </button>
                )}
            </div>

            {booking.status === 'approved' && (
                <>
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <button className="chat-fab" onClick={() => setChatVisible(true)}>💬 Chat</button>
                    </div>
                    <ChatPopup
                        bookingId={booking._id}
                        senderId={currentUser._id}
                        receiver={user}
                        visible={chatVisible}
                        onClose={() => setChatVisible(false)}
                    />
                </>
            )}
        </div>
    );
};

export default LawyerBookingCard;
