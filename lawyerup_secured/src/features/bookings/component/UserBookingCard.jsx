import React, { useState } from 'react';
import UserReview from './UserReview';
import defaultAvatar from '../../../app/assets/avatar.png';
import '../css/UserBookingCard.css';
import { useUserBookingCard } from '../hooks/useUserBookingCard';
import ChatPopup from './ChatPopup';

const currentUser = JSON.parse(localStorage.getItem('lawyerup_user'));

const UserBookingCard = ({ booking, onCancel }) => {
    const [chatVisible, setChatVisible] = useState(false);

    const {
        showReview,
        setShowReview,
        lawyerProfile,
        lawyerUser,
        client,
        lawyerImg,
        handleCancel
    } = useUserBookingCard(booking, onCancel);

    if (!lawyerProfile || !lawyerUser) {
        return <div style={{ padding: '1rem' }}></div>;
    }

    return (
        <div className="user-booking-card">
            <div className="top-section">
                <div className="avatar-section">
                    <img
                        src={lawyerImg}
                        alt="Lawyer"
                        className="lawyer-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </div>
                <div className="info-section">
                    <h2>{lawyerUser.fullName || 'Unknown Lawyer'}</h2>
                    <p><b>Specialization:</b> {lawyerProfile.specialization || '—'}</p>
                    <p><b>Qualification:</b> {lawyerProfile.qualification || '—'}</p>
                    <p><b>Email:</b> {lawyerUser.email || '—'}</p>
                    <p><b>Phone:</b> {lawyerUser.contactNumber || '—'}</p>
                </div>
            </div>

            <hr style={{ margin: '1rem 0', borderTop: '1px dashed #ccc' }} />

            <div className="booking-info">
                <h3>Booking Info</h3>
                <div className="booking-columns">
                    <div>
                        <p><b>Date:</b> {booking.date}</p>
                        <p><b>Time:</b> {booking.time}</p>
                        <p><b>Duration:</b> {booking.duration} hour(s)</p>
                        <p><b>Status:</b> {booking.status}</p>
                        <p><b>Mode:</b> {booking.mode}</p>
                        <p><b>Description:</b> {booking.description || '—'}</p>
                    </div>
                    <div>
                        <p><b>Meeting Link:</b> {booking.meetingLink
                            ? <a href={booking.meetingLink} target="_blank" rel="noreferrer">Join</a>
                            : '—'}</p>
                        <p><b>Your Name:</b> {client?.fullName || 'You'}</p>
                        <p><b>Your Email:</b> {client?.email}</p>
                        <p><b>Your Contact:</b> {client?.contactNumber || client?.phone}</p>
                    </div>
                </div>
            </div>

            <div className="card-actions">
                {booking.status === 'pending' && (
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel Booking
                    </button>
                )}

                {booking.status === 'completed' && !booking.reviewed && (
                    <button className="review-btn" onClick={() => setShowReview(true)}>
                        Rate Lawyer
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
                        receiver={lawyerUser}
                        visible={chatVisible}
                        onClose={() => setChatVisible(false)}
                    />
                </>
            )}

            {showReview && (
                <UserReview
                    bookingId={booking._id}
                    lawyerId={lawyerUser._id}
                    onClose={() => setShowReview(false)}
                />
            )}
        </div>
    );
};

export default UserBookingCard;
