import { useState } from 'react';

export const useLawyerProfile = (lawyer) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showModal, setShowModal] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('lawyerup_user'));
    const isUser = currentUser?.role === 'user';

    const hasAvailability = lawyer.schedule && Object.keys(lawyer.schedule).length > 0;
    const hasReviews = lawyer.reviews && lawyer.reviews.length > 0;

    const totalRatings = hasReviews
        ? lawyer.reviews.reduce((sum, r) => sum + r.rating, 0)
        : 0;

    const avgRating = hasReviews ? totalRatings / lawyer.reviews.length : 0;
    const rounded = Math.round(avgRating);
    const filledStars = '⭐'.repeat(rounded);
    const emptyStars = '☆'.repeat(5 - rounded);

    return {
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
    };
};
