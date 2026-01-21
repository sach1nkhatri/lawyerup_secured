import React from 'react';
import tick from '../../../app/assets/tick.png';
import no from '../../../app/assets/no.png';
import { useNavigate } from 'react-router-dom';
import ManageBilling from './ManageBilling'; // ✅ Import

const PlanCardInSettings = ({ plan }) => {
    const navigate = useNavigate();

    const plansData = {
        'Free Trial': {
            name: 'Free Trial',
            features: [
                'Access to key law documents',
                '500 words/day or 10 chatbot interactions',
                'Legal news & articles',
                'Lawyer appointment access',
            ],
            noSupport: true,
            buttonText: 'Get Plus ➕',
        },
        'Basic Plan': {
            name: 'Basic Plan',
            features: [
                'Everything in Free Plan +',
                'Unlimited AI chat access',
                'Lawyer booking and appointment',
                'Great for regular users',
            ],
            noSupport: true,
            buttonText: 'Manage Billing',
        },
        'Premium Plan': {
            name: 'Premium Plan',
            features: [
                'Everything in Basic Plan +',
                'Advanced legal reasoning tools',
                'Tools for lawyers and researchers',
                '24/7 Tech Support',
            ],
            noSupport: false,
            buttonText: 'Manage Billing',
        }
    };

    const current = plansData[plan] || plansData['Free Trial'];

    const isFree = plan === 'Free Trial';

    return (
        <div className="plan-card-glow">
            <h3>{current.name}</h3>
            <ul>
                {current.features.map((f, i) => (
                    <li key={i}><img src={tick} alt="✔" /> {f}</li>
                ))}
                {current.noSupport && <li><img src={no} alt="✖" /> No 24/7 Support</li>}
            </ul>

            {isFree ? (
                <button
                    className="choose-btn"
                    onClick={() => navigate('/settings/pricing')}
                >
                    {current.buttonText}
                </button>
            ) : (
                <ManageBilling />
            )}
        </div>
    );
};

export default PlanCardInSettings;