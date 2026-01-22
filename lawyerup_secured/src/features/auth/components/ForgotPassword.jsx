import React, { useState } from 'react';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import '../css/LoginSignup.css';

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('request'); // 'request' or 'reset'
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Client-side password validation (matches backend policy)
    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be no more than 128 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return errors;
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) {
            notify('error', 'Please enter your email address');
            return;
        }

        startLoader();
        try {
            // TODO: Implement forgot password endpoint in backend
            // For now, show a message
            notify('info', 'Password reset functionality is being implemented. Please contact support.');
            // await axiosInstance.post(`${API.AUTH}/forgot-password`, { email });
            // notify('success', 'Password reset link sent to your email');
            // setStep('check-email');
        } catch (err) {
            notify('error', err.response?.data?.message || 'Failed to send reset email');
        } finally {
            stopLoader();
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            notify('error', 'Passwords do not match');
            return;
        }

        // Validate password strength
        const errors = validatePassword(newPassword);
        if (errors.length > 0) {
            setPasswordErrors(errors);
            notify('error', 'Password does not meet requirements');
            return;
        }

        startLoader();
        try {
            // TODO: Implement reset password endpoint in backend
            // await axiosInstance.post(`${API.AUTH}/reset-password`, {
            //     token: resetToken,
            //     password: newPassword
            // });
            notify('info', 'Password reset functionality is being implemented. Please contact support.');
            // notify('success', 'Password reset successfully. Please login.');
            // onBack();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password';
            if (err.response?.data?.errors) {
                setPasswordErrors(err.response.data.errors);
            }
            notify('error', msg);
        } finally {
            stopLoader();
        }
    };

    if (step === 'check-email') {
        return (
            <div className="forgot-password-container">
                <div className="forgot-password-box">
                    <h2>Check Your Email</h2>
                    <p>We've sent a password reset link to {email}</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Please check your inbox and click the link to reset your password.
                    </p>
                    <button onClick={onBack} style={{ marginTop: '20px' }}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'reset') {
        return (
            <div className="forgot-password-container">
                <div className="forgot-password-box">
                    <h2>Reset Password</h2>
                    <form onSubmit={handleResetPassword}>
                        <input
                            type="text"
                            placeholder="Reset Token"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                const errors = validatePassword(e.target.value);
                                setPasswordErrors(errors);
                            }}
                            required
                        />
                        {passwordErrors.length > 0 && (
                            <ul style={{ color: 'red', fontSize: '12px', textAlign: 'left', margin: '5px 0' }}>
                                {passwordErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                            </ul>
                        )}
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p style={{ color: 'red', fontSize: '12px' }}>Passwords do not match</p>
                        )}
                        <button type="submit">Reset Password</button>
                        <button type="button" onClick={() => setStep('request')} style={{ background: '#ccc' }}>
                            Back
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                <form onSubmit={handleRequestReset}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send Reset Link</button>
                    <button type="button" onClick={onBack} style={{ background: '#ccc' }}>
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

