import React from 'react';
import useBooking from '../hooks/useBooking';
import UserBookingCard from '../component/UserBookingCard';
import LawyerBookingCard from '../component/LawyerBookingCard';
import '../css/BookingPage.css';

const BookingPage = () => {
    const {
        user,
        activeTab,
        setActiveTab,
        bookings,
        loading,
        handleCancel,
        handleStatusChange
    } = useBooking();

    return (
        <div className="booking-page">
            <h2>{user?.role === 'lawyer' ? 'Client Bookings' : 'My Bookings'}</h2>

            <div className="booking-tabs">
                {['pending', 'accepted', 'history'].map(tab => (
                    <button
                        key={tab}
                        className={activeTab === tab ? 'active' : ''}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loader-spinner" />
            ) : (
                <div className="booking-list">
                    {bookings.length === 0 ? (
                        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                            No bookings found in {activeTab} tab.
                        </p>
                    ) : (
                        bookings.map((booking) =>
                            user.role === 'lawyer' ? (
                                <LawyerBookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onStatusChange={() => handleStatusChange(booking._id)}
                                />
                            ) : (
                                <UserBookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onCancel={() => handleCancel(booking._id)}
                                />
                            )
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingPage;