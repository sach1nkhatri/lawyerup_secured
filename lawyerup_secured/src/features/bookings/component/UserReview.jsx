import React from 'react';
import '../css/UserReview.css';
import { useUserReview } from '../hooks/useUserReview';

const UserReview = ({ bookingId, onClose }) => {
    const {
        rating,
        setRating,
        hover,
        setHover,
        comment,
        setComment,
        loading,
        handleSubmit
    } = useUserReview(bookingId, onClose);

    return (
        <div className="review-modal-overlay">
            <div className="review-modal">
                <h3>Rate Your Lawyer</h3>

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hover || rating) ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <label>Comment:</label>
                <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your experience..."
                />

                <div className="modal-buttons">
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UserReview;
