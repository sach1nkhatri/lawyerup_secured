import { useEffect, useState } from 'react';
import API from '../../../app/api/api_endpoints';

export const useJoinLawyerPage = () => {
    const [view, setView] = useState('loading');
    const [lawyerData, setLawyerData] = useState(null);

    const getToken = () => localStorage.getItem('lawyerup_token');
    const getNextClicked = () => localStorage.getItem('lawyerup_nextClicked') === 'true';

    const loadProfile = async () => {
        const token = getToken();
        if (!token) return setView('form');

        try {
            const res = await fetch(`${API.LAWYERS}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('No application found');

            const data = await res.json();
            setLawyerData(data);

            const status = data?.status || 'pending';
            if (['pending', 'hold', 'rejected'].includes(status)) {
                setView('status');
            } else if (['verified', 'listed'].includes(status)) {
                setView(getNextClicked() ? 'control' : 'status');
            } else {
                setView('form');
            }
        } catch {
            setView('form');
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleNext = () => {
        localStorage.setItem('lawyerup_nextClicked', 'true');
        setView('control');
    };

    const handleBackToStatus = () => {
        localStorage.removeItem('lawyerup_nextClicked');
        loadProfile();
    };

    const handleReapply = () => {
        localStorage.removeItem('lawyerup_nextClicked');
        setLawyerData(null);
        setView('form');
    };

    const handleGoToStatus = async () => {
        localStorage.removeItem('lawyerup_nextClicked');
        await loadProfile();
    };

    return {
        view,
        lawyerData,
        loadProfile,
        handleNext,
        handleBackToStatus,
        handleReapply,
        handleGoToStatus,
    };
};
