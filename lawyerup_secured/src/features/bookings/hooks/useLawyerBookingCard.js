import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { notify } from '../../../app/shared_components/utils/notify';

export const useLawyerBookingCard = (booking, onStatusChange) => {
    const [link, setLink] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setLink(booking.meetingLink || '');
    }, [booking.meetingLink]);

    const confirmAndUpdateStatus = async (newStatus, label) => {
        const result = await Swal.fire({
            title: `Confirm ${label}?`,
            text: `Are you sure you want to mark this booking as "${label}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Yes, ${label}`,
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`${process.env.REACT_APP_API_URL}bookings/${booking._id}/status`, {
                    status: newStatus,
                });
                notify('success', `Status updated to "${newStatus}"`);
                if (onStatusChange) onStatusChange();
            } catch (error) {
                console.error('Failed to update status:', error);
                notify('error', '❌ Failed to update booking status');
            }
        }
    };

    const confirmAndUpdateLink = async () => {
        if (!link.trim()) {
            notify('error', 'Please add a meeting link before updating.');
            return;
        }

        const result = await Swal.fire({
            title: 'Update Meeting Link?',
            text: 'Are you sure you want to update the meeting link for this booking?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Update',
        });

        if (!result.isConfirmed) return;

        try {
            setIsUpdating(true);
            await axios.patch(`${process.env.REACT_APP_API_URL}bookings/${booking._id}/meeting-link`, {
                meetingLink: link,
            });
            notify('success', 'Meeting link updated!');
        } catch (error) {
            console.error('Failed to update meeting link:', error);
            notify('error', 'Failed to update meeting link');
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        link,
        setLink,
        isUpdating,
        confirmAndUpdateLink,
        confirmAndUpdateStatus
    };
};
