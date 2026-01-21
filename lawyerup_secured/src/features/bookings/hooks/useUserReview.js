// hooks/useUserReview.js
import { useState } from 'react';
import axios from 'axios';
import { notify } from '../../../app/shared_components/utils/notify';
import API from '../../../app/api/api_endpoints';

export const useUserReview = (bookingId, onClose) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!rating || !comment.trim()) {
            notify('error', 'Please give a rating and write a comment.');
            return;
        }

        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('lawyerup_user'));

            const payload = {
                user: user.fullName, // or user._id if backend expects it
                comment,
                rating,
            };

            await axios.post(`${API.REVIEWS}/${bookingId}`, payload);

            notify('success', 'Review submitted successfully!');
            onClose();
        } catch (err) {
            console.error('Review submission error:', err);
            notify('error', '❌ Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        rating,
        setRating,
        hover,
        setHover,
        comment,
        setComment,
        loading,
        handleSubmit,
    };
};
