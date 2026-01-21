import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import API from '../../../app/api/api_endpoints';

const useBooking = () => {
    const user = useMemo(() => JSON.parse(localStorage.getItem('lawyerup_user')), []);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.role !== 'user' && user.role !== 'lawyer')) return;

        const fetchBookings = async () => {
            try {
                const endpoint =
                    user.role === 'lawyer'
                        ? `${API.BOOKINGS}/lawyer/${user._id}`
                        : `${API.BOOKINGS}/user/${user._id}`;

                const res = await axios.get(endpoint);
                setBookings(res.data);
            } catch (err) {
                console.error('Failed to fetch bookings:', err);
            } finally {
                setTimeout(() => setLoading(false), 150);
            }
        };

        fetchBookings();
    }, [user]);

    useEffect(() => {
        if (loading) return;

        const hasPending = bookings.some(b => b.status?.toLowerCase() === 'pending');
        const hasAccepted = bookings.some(b => b.status?.toLowerCase() === 'approved');
        const hasHistory = bookings.some(b =>
            ['completed', 'cancelled'].includes(b.status?.toLowerCase())
        );

        if (hasPending) setActiveTab('pending');
        else if (hasAccepted) setActiveTab('accepted');
        else if (hasHistory) setActiveTab('history');
        else setActiveTab('pending');
    }, [loading, bookings]);

    const filterBookings = (status) => {
        const filtered = bookings.filter(b => {
            const s = b.status?.toLowerCase().trim();
            if (status === 'pending') return s === 'pending';
            if (status === 'accepted') return s === 'approved';
            if (status === 'history') return ['completed', 'cancelled'].includes(s);
            return false;
        });

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const handleCancel = (id) => {
        setBookings(prev => prev.filter(b => b._id !== id));
    };

    const handleStatusChange = (id, newStatus = 'approved') => {
        setBookings(prev =>
            prev.map(b => (b._id === id ? { ...b, status: newStatus } : b))
        );
    };

    return {
        user,
        activeTab,
        setActiveTab,
        bookings: filterBookings(activeTab),
        loading,
        handleCancel,
        handleStatusChange,
    };
};

export default useBooking;
