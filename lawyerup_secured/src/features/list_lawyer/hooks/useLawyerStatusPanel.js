import Swal from 'sweetalert2';
import { notify } from '../../../app/shared_components/utils/notify';
import API from '../../../app/api/api_endpoints';

export const useLawyerStatusPanel = (lawyer, onNext) => {
    const status = lawyer?.status || 'pending';

    const statusStep = {
        pending: 1,
        rejected: 1,
        disabled: 0,
        hold: 2,
        verified: 2,
        listed: 3,
    }[status] || 1;

    const imageURL = lawyer.profilePhoto?.startsWith('data:image')
        ? lawyer.profilePhoto
        : `${process.env.REACT_APP_SERVER_URL}${lawyer.profilePhoto}`;

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return '🟠 Pending Review';
            case 'verified': return '🟢 Approved';
            case 'listed': return '🔵 Listed Publicly';
            case 'hold': return '⚪ On Hold';
            case 'disabled': return '🔴 Disabled';
            case 'rejected': return '❌ Rejected';
            default: return 'Unknown';
        }
    };

    const handleStartListing = async () => {
        const result = await Swal.fire({
            title: 'List Your Profile?',
            text: 'Your profile will be made public to clients.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, List It!',
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('lawyerup_token');
        try {
            const res = await fetch(`${API.LAWYERS}/${lawyer._id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'listed' }),
            });

            if (res.ok) {
                notify('success', 'Your profile is now public!');
                onNext?.();
            } else {
                notify('error', '❌ Failed to list profile.');
            }
        } catch (error) {
            notify('error', '⚠️ Network error while updating status.');
        }
    };

    return {
        imageURL,
        statusStep,
        getStatusLabel,
        handleStartListing,
        status,
    };
};
