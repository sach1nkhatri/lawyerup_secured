import { useState } from 'react';
import { notify } from '../../../app/shared_components/utils/notify';
import API from '../../../app/api/api_endpoints';
import axios from 'axios';

export const useReportModal = (onClose) => {
    const [selectedIssue, setSelectedIssue] = useState('');
    const [customIssue, setCustomIssue] = useState('');

    // 📋 Dropdown of digital pain
    const issueOptions = [
        'Incorrect legal information',
        'Chatbot not responding',
        'Broken link or page',
        'Appointment issue',
        'Other', // aka "I’m too lazy to scroll, so I’ll type a novel instead" may user save my db space
    ];

    const handleSubmit = async () => {
        // 🕵 Finalize the issue — user-picked or user-dumped
        const finalIssue = selectedIssue === 'Other' ? customIssue : selectedIssue;

        if (!selectedIssue || (selectedIssue === 'Other' && !customIssue.trim())) {
            // Because apparently some people think submitting an empty form counts as feedback
            notify('warn', 'Please select or describe an issue');
            return;
        }

        try {
            //  Pull the user from storage like it’s 1999
            const user = JSON.parse(localStorage.getItem('lawyerup_user'));

            if (!user || !user._id) {
                // This should never happen... unless it does
                notify('error', 'User not found. Please log in again.');
                return;
            }

            // Send it to the backend so future me can cry while reading it
            const res = await axios.post(API.REPORT, {
                user: user._id,
                message: finalIssue
            });

            // ✨ Success! Now pretend nothing ever went wrong
            notify('success', res.data.message || 'Report submitted!');
            onClose();
        } catch (error) {
            console.error('Report error:', error); // For future debugging... or future regret
            notify('error', 'Failed to submit report');
        }
    };

    return {
        selectedIssue,
        setSelectedIssue,
        customIssue,
        setCustomIssue,
        issueOptions,
        handleSubmit
    };
};
