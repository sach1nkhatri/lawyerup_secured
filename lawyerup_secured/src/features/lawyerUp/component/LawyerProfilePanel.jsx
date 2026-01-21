import React from 'react';
import ReviewList from './ReviewList';
import AppointmentModal from '../../bookings/booking_modals/modal/AppointmentModal';
import '../css/LawyerUp.css';
import { FaGraduationCap, FaFolderOpen } from 'react-icons/fa';
import { useLawyerProfile } from '../hooks/useLawyerProfile';

const LawyerProfilePanel = ({ lawyer, onBack }) => {
    const {
        activeTab,
        setActiveTab,
        showModal,
        setShowModal,
        isUser,
        hasAvailability,
        hasReviews,
        avgRating,
        filledStars,
        emptyStars
    } = useLawyerProfile(lawyer);

    if (!lawyer) return <p>Lawyer not found.</p>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                const latestEducation = lawyer.education?.[lawyer.education.length - 1];
                const specialization = latestEducation?.specialization || lawyer.specialization || 'N/A';
                return (
                    <>
                        <p><strong>Name:</strong> {lawyer.fullName}</p>
                        <p><strong>Speciality:</strong> {specialization}</p>
                        <p><strong>State:</strong> {lawyer.state || 'N/A'}</p>
                        <p><strong>City:</strong> {lawyer.city || 'N/A'}</p>
                        <p><strong>Address:</strong> {lawyer.address}</p>
                        <p><strong>Contact:</strong> {lawyer.phone}</p>
                    </>
                );

            case 'info':
                return (
                    <>
                        <div className="box-section">
                            <p className="box-title">Description</p>
                            <p className="box-text">{lawyer.description || 'N/A'}</p>
                        </div>
                        <div className="box-section">
                            <p className="box-title">Special Case</p>
                            <p className="box-text">{lawyer.specialCase || 'N/A'}</p>
                        </div>
                        <div className="box-section">
                            <p className="box-title">Social Link</p>
                            {lawyer.socialLink ? (
                                <a
                                    href={lawyer.socialLink.startsWith('http') ? lawyer.socialLink : `https://${lawyer.socialLink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                >
                                    {lawyer.socialLink}
                                </a>
                            ) : (
                                <p className="box-text">N/A</p>
                            )}
                        </div>
                    </>
                );

            case 'Education':
                return (
                    <>
                        <div className="box-section">
                            <p className="box-title">Education</p>
                            <ul>
                                {lawyer.education?.length ? lawyer.education.map((e, i) => (
                                    <li key={i}>
                                        <FaGraduationCap /> {e.degree} - {e.institute}, {e.year} ({e.specialization})
                                    </li>
                                )) : <li>No education records.</li>}
                            </ul>
                        </div>
                        <div className="box-section">
                            <p className="box-title">Work Experience</p>
                            <ul>
                                {lawyer.workExperience?.length ? lawyer.workExperience.map((w, i) => (
                                    <li key={i}>
                                        <FaFolderOpen /> {w.court} ({w.from} to {w.to})
                                    </li>
                                )) : <li>No work experience listed.</li>}
                            </ul>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="profile-panel">
            <div className="tab-menu">
                {['profile', 'info', 'Education'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? 'active-tab' : ''}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="tab-content">{renderTabContent()}</div>

            {hasAvailability && isUser ? (
                <button className="book-btn" onClick={() => setShowModal(true)}>Book Appointment</button>
            ) : (
                <p style={{ marginTop: '1rem', color: 'red' }}>
                    {hasAvailability ? 'Login as a user to book appointments' : 'No availability for booking'}
                </p>
            )}

            <h3 className="review-heading">
                Reviews {hasReviews ? filledStars + emptyStars : '☆☆☆☆☆'} &nbsp;
                {hasReviews ? avgRating.toFixed(1) : 'No ratings yet'}
            </h3>

            {hasReviews ? <ReviewList reviews={lawyer.reviews} /> : <p>No reviews available.</p>}
            <button className="back-btn" onClick={onBack}>← Back</button>

            {showModal && (
                <AppointmentModal lawyer={lawyer} onClose={() => setShowModal(false)} />
            )}
        </div>
    );
};

export default LawyerProfilePanel;
