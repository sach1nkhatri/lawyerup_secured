import { useState } from 'react';
import axios from 'axios';
import API from '../../../app/api/api_endpoints';

const useManualPayment = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [latestPayment, setLatestPayment] = useState(null);

    /**
     * This may not be fully automated
     * But it Works Secure form End to End
     * A bit Labour Intensive
     * Since We got Daily plans We gotta to be fastt
     * Submits a manual payment request including screenshot and plan info.
     * Expects: plan, amount, method, duration, validUntil (Date), and file screenshot.
     */
    const submitManualPayment = async ({
                                           plan,
                                           amount,
                                           method,
                                           duration,
                                           validUntil,
                                           screenshot
                                       }) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('lawyerup_token');
            const formData = new FormData();

            formData.append('plan', plan);
            formData.append('amount', amount);
            formData.append('method', method);
            formData.append('duration', duration);
            formData.append('validUntil', validUntil.toISOString());
            formData.append('screenshot', screenshot);

            await axios.post(API.MANUAL_PAYMENT, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess(true);
            await getLatestUserPayment(); // Refresh payment info

        } catch (err) {
            console.error('❌ Payment error:', err);
            setError(
                err.response?.data?.error ||
                err.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * 📥 Fetches the latest manual payment for the logged-in user.
     */
    const getLatestUserPayment = async () => {
        try {
            const token = localStorage.getItem('lawyerup_token');
            const res = await axios.get(`${API.MANUAL_PAYMENT}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLatestPayment(res.data);
        } catch (err) {
            console.error('❌ Failed to fetch latest payment:', err);
        }
    };

    return {
        submitManualPayment,
        loading,
        success,
        error,
        setSuccess, // allow manual reset
        latestPayment,
        getLatestUserPayment
    };
};

export default useManualPayment;