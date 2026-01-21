import Swal from 'sweetalert2';

export const useLawyerCard = (lawyer) => {
    const hasReviews = lawyer.reviews && lawyer.reviews.length > 0;
    const latestEducation = lawyer.education?.[lawyer.education.length - 1];
    const specialization = latestEducation?.specialization || lawyer.specialization || 'N/A';

    const totalRatings = hasReviews
        ? lawyer.reviews.reduce((sum, r) => sum + r.rating, 0)
        : 0;

    const avgRating = hasReviews ? totalRatings / lawyer.reviews.length : 0;
    const rounded = Math.round(avgRating);
    const stars = '⭐'.repeat(rounded) + '☆'.repeat(5 - rounded);

    const profileLink = `${window.location.origin}/lawyer/${lawyer._id}`;

    const handleShare = () => {
        Swal.fire({
            title: 'Share Lawyer Profile',
            text: 'Copy the link or share directly',
            showCancelButton: true,
            confirmButtonText: '📋 Copy Link',
            cancelButtonText: '🔗 Share',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                navigator.clipboard.writeText(profileLink);
                Swal.fire('Copied!', 'Link has been copied to clipboard.', 'success');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                if (navigator.share) {
                    navigator
                        .share({
                            title: `${lawyer.fullName} - ${specialization}`,
                            text: `Check out ${lawyer.fullName} on LawyerUp`,
                            url: profileLink,
                        })
                        .catch((err) => {
                            console.warn('Share failed:', err);
                            Swal.fire('Oops!', 'Share not supported or failed.', 'error');
                        });
                } else {
                    Swal.fire('Not Supported', 'This browser does not support native sharing.', 'warning');
                }
            }
        });
    };

    const resolvedImage = lawyer.profilePhoto?.startsWith('data:image')
        ? lawyer.profilePhoto
        : `${process.env.REACT_APP_SERVER_URL}${lawyer.profilePhoto || '/uploads/avatar.png'}`;

    return {
        specialization,
        stars,
        resolvedImage,
        handleShare,
    };
};
