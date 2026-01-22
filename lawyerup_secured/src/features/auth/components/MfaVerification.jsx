import React, { useState } from 'react';
import axiosInstance from '../../../app/api/axiosConfig';
import API from '../../../app/api/api_endpoints';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import '../css/LoginSignup.css';

const MfaVerification = ({ mfaData, onSuccess, onCancel }) => {
    const [code, setCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!code && !recoveryCode) {
            setError('Please enter a verification code');
            return;
        }

        startLoader();

        try {
            const payload = {
                mfaToken: mfaData.mfaToken,
                ...(useRecoveryCode ? { recoveryCode } : { code })
            };

            const res = await axiosInstance.post(`${API.AUTH}/mfa/verify`, payload);
            
            // MFA verified successfully
            const { user } = res.data;
            localStorage.setItem('lawyerup_user', JSON.stringify(user));
            localStorage.setItem('auth', 'true');
            
            // Check password expiry warning
            if (res.data.passwordExpiresAt) {
                const expiresAt = new Date(res.data.passwordExpiresAt);
                const daysUntilExpiry = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry <= 7) {
                    notify('warn', `Your password expires in ${daysUntilExpiry} day(s). Please change it soon.`);
                }
            }
            
            notify('success', 'MFA verified successfully!');
            onSuccess(user);
        } catch (err) {
            if (err.userMessage) {
                setError(err.userMessage);
                notify('error', err.userMessage);
            } else if (err.response?.status === 429) {
                setError('Too many attempts. Please try again later.');
                notify('error', 'Too many MFA attempts. Please try again later.');
            } else if (err.response?.status === 401) {
                setError('Invalid verification code. Please try again.');
            } else {
                setError('Verification failed. Please try again.');
                notify('error', 'MFA verification failed. Please try again.');
            }
            console.error('[MFA Verification Error]', err);
        } finally {
            stopLoader();
        }
    };

    return (
        <div className="mfa-verification-container">
            <div className="mfa-verification-box">
                <h2>Two-Factor Authentication</h2>
                <p>Enter the 6-digit code from your authenticator app</p>
                
                {error && (
                    <div className="mfa-error" style={{ color: 'red', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!useRecoveryCode ? (
                        <>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setCode(value);
                                    setError('');
                                }}
                                maxLength={6}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '18px',
                                    textAlign: 'center',
                                    letterSpacing: '8px',
                                    marginBottom: '10px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                            <button type="button" 
                                onClick={() => setUseRecoveryCode(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px',
                                    marginBottom: '10px'
                                }}
                            >
                                Use recovery code instead
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Enter recovery code"
                                value={recoveryCode}
                                onChange={(e) => {
                                    setRecoveryCode(e.target.value);
                                    setError('');
                                }}
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '16px',
                                    marginBottom: '10px',
                                    border: '2px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                            <button type="button" 
                                onClick={() => {
                                    setUseRecoveryCode(false);
                                    setRecoveryCode('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px',
                                    marginBottom: '10px'
                                }}
                            >
                                Use authenticator code instead
                            </button>
                        </>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1 }}>
                            Verify
                        </button>
                        <button type="button" onClick={onCancel} style={{ flex: 1, background: '#ccc' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MfaVerification;

