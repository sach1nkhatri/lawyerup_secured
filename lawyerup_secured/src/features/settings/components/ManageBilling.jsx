import React, { useEffect } from 'react';
import useManualPayment from '../../payment_gateway/hooks/useManualPayment';
import '../css/ManageBilling.css';

const ManageBilling = () => {
    const { latestPayment, getLatestUserPayment } = useManualPayment();

    useEffect(() => {
        getLatestUserPayment();
    }, []);

    if (!latestPayment || latestPayment.plan === 'Free Trial') {
        return null; // ❌ Don't show anything for Free Trial
    }

    const renderStatusTag = (status) => {
        switch (status) {
            case 'approved':
                return <span className="status approved">✅ Approved</span>;
            case 'rejected':
                return <span className="status rejected">❌ Rejected</span>;
            case 'pending':
            default:
                return <span className="status pending">⏳ Pending</span>;
        }
    };

    const expired = new Date(latestPayment.validUntil) < new Date();

    return (
        <div className="manage-billing-card">
            <h3>Plan Details</h3>
            <p><strong>Plan:</strong> {latestPayment.plan}</p>
            <p><strong>Method:</strong> {latestPayment.method}</p>
            <p><strong>Valid Until:</strong> {new Date(latestPayment.validUntil).toDateString()}</p>
            <p><strong>Status:</strong> {renderStatusTag(latestPayment.status)}</p>

            {expired && (
                <p className="expired-warning">
                    ⏳ This plan has expired. Please{' '}
                    <span
                        style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() =>
                            window.location.href = '/checkout'
                        }
                    >
                        upgrade again
                    </span>{' '}
                    to continue using premium features.
                </p>
            )}
        </div>
    );
};

export default ManageBilling;
