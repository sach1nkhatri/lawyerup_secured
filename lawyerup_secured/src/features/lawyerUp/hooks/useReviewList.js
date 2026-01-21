export const useReviewList = (reviews = []) => {
    const formatted = reviews.map((rev) => ({
        ...rev,
        stars: '⭐'.repeat(rev.rating || 0),
        user: rev.user || 'Anonymous',
        comment: rev.comment || '',
    }));

    return { formatted };
};