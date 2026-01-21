import React from 'react';
import '../css/LawyerCard.css';
import { useLawyerCard } from '../hooks/useLawyerCard';

const LawyerCard = ({ lawyer, onViewProfile, showShare }) => {
    const {
        specialization,
        stars,
        resolvedImage,
        handleShare
    } = useLawyerCard(lawyer);

    return (
        <div className="lawyer-card">
            <img
                src={resolvedImage}
                alt="Lawyer"
                className="lawyer-photo"
                onError={(e) => {
                    e.target.onerror = null; // prevent infinite loop
                    e.target.src = require('../../../app/assets/avatar.png'); // or a default image URL
                }}
            />
            <div className="lawyer-info">
                <p><strong>{lawyer.fullName}</strong></p>
                <p>{specialization}</p>
                <div className="rating">{stars}</div>

                {showShare ? (
                    <button className="share-btn" onClick={handleShare}>Share</button>
                ) : (
                    <button onClick={onViewProfile}>View Profile</button>
                )}
            </div>
        </div>
    );
};

export default LawyerCard;
