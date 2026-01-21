import React from 'react';
import '../css/LawyerUp.css';
import { useReviewList } from '../hooks/useReviewList';

const ReviewList = ({ reviews }) => {
    const { formatted } = useReviewList(reviews);

    return (
        <div className="review-list">
            {formatted.map((rev, index) => (
                <div key={index} className="review-item">
                    <p>{rev.comment}</p>
                    <p className="reviewer">{rev.user} {rev.stars}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
