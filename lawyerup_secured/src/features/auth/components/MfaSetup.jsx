import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../app/api/axiosConfig';
import API from '../../../app/api/api_endpoints';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';

const MfaSetup = ({ onComplete, onCancel }) => {
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [step, setStep] = useState('setup'); // 'setup' or 'confirm'

    useEffect(() => {
        loadMfaSetup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMfaSetup = async () => {
        startLoader();
        try {
            const res = await axiosInstance.post(`${API.AUTH}/mfa/setup`);
            setQrCode(res.data.qrCodeDataUrl);
            setSecret(res.data.secret);
        } catch (err) {
            notify('error', err.response?.data?.message || 'Failed to setup MFA');
            if (onCancel) onCancel();
        } finally {
            stopLoader();
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!code || code.length !== 6) {
            notify('error', 'Please enter a valid 6-digit code');
            return;
        }

        startLoader();
        try {
            const res = await axiosInstance.post(`${API.AUTH}/mfa/confirm`, { code });
            
            // Show recovery codes (only shown once)
            if (res.data.recoveryCodes) {
                setRecoveryCodes(res.data.recoveryCodes);
                setStep('recovery');
                notify('success', 'MFA enabled successfully!');
            } else {
                notify('success', 'MFA enabled successfully!');
                if (onComplete) onComplete();
            }
        } catch (err) {
            notify('error', err.response?.data?.message || 'Invalid verification code');
        } finally {
            stopLoader();
        }
    };

    if (step === 'recovery') {
        return (
            <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Save Your Recovery Codes</h2>
                <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    ⚠️ These codes will only be shown once. Save them in a safe place!
                </p>
                <div style={{ 
                    background: '#f5f5f5', 
                    padding: '15px', 
                    borderRadius: '4px',
                    margin: '15px 0',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                }}>
                    {recoveryCodes.map((code, idx) => (
                        <div key={idx} style={{ margin: '5px 0' }}>{code}</div>
                    ))}
                </div>
                <button onClick={() => {
                    setRecoveryCodes([]);
                    if (onComplete) onComplete();
                }} style={{ width: '100%', marginTop: '10px' }}>
                    I've Saved These Codes
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Enable Two-Factor Authentication</h2>
            <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            
            {qrCode && (
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <img src={qrCode} alt="MFA QR Code" style={{ maxWidth: '100%', border: '1px solid #ddd' }} />
                </div>
            )}

            {secret && (
                <div style={{ margin: '15px 0', fontSize: '12px', color: '#666' }}>
                    <p>Or enter this secret manually:</p>
                    <code style={{ background: '#f5f5f5', padding: '5px', display: 'block', wordBreak: 'break-all' }}>
                        {secret}
                    </code>
                </div>
            )}

            <form onSubmit={handleConfirm}>
                <input
                    type="text"
                    placeholder="Enter 6-digit code from app"
                    value={code}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCode(value);
                    }}
                    maxLength={6}
                    required
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ flex: 1 }}>
                        Verify & Enable
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} style={{ flex: 1, background: '#ccc' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default MfaSetup;

