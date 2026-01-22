import React, { useState } from 'react';
import axiosInstance from '../../../app/api/axiosConfig';
import API from '../../../app/api/api_endpoints';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import Swal from 'sweetalert2';

const PasswordChangeModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);

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

    // Calculate password strength (0-4)
    const calculateStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'newPassword') {
            const errors = validatePassword(value);
            setPasswordErrors(errors);
            setPasswordStrength(calculateStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            notify('error', 'New passwords do not match');
            return;
        }

        // Validate password strength
        const errors = validatePassword(formData.newPassword);
        if (errors.length > 0) {
            setPasswordErrors(errors);
            notify('error', 'Password does not meet requirements');
            return;
        }

        startLoader();
        try {
            await axiosInstance.post(`${API.AUTH}/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            await Swal.fire('Success!', 'Your password has been changed successfully.', 'success');
            
            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordErrors([]);
            setPasswordStrength(0);
            
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to change password';
            if (err.response?.data?.errors) {
                setPasswordErrors(err.response.data.errors);
            }
            await Swal.fire('Error!', msg, 'error');
        } finally {
            stopLoader();
        }
    };

    if (!isOpen) return null;

    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#d32f2f', '#f57c00', '#fbc02d', '#689f38', '#388e3c'];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h2 style={{ marginBottom: '20px' }}>Change Password</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {formData.newPassword && (
                            <>
                                <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        flex: 1,
                                        height: '8px',
                                        background: '#e0e0e0',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(passwordStrength / 4) * 100}%`,
                                            height: '100%',
                                            background: strengthColors[passwordStrength] || '#d32f2f',
                                            transition: 'all 0.3s'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '12px', color: strengthColors[passwordStrength] || '#d32f2f' }}>
                                        {strengthLabels[passwordStrength] || 'Very Weak'}
                                    </span>
                                </div>
                                {passwordErrors.length > 0 && (
                                    <ul style={{ color: 'red', fontSize: '12px', marginTop: '5px', paddingLeft: '20px' }}>
                                        {passwordErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>Passwords do not match</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ flex: 1, padding: '10px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Change Password
                        </button>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal;

