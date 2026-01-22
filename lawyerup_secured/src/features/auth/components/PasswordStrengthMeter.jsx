import React from 'react';
import './PasswordStrengthMeter.css';

/**
 * Password Strength Meter Component
 * Displays visual feedback for password strength
 * 
 * @param {string} password - The password to evaluate
 * @param {Array} errors - Array of validation error messages
 */
const PasswordStrengthMeter = ({ password, errors = [] }) => {
    // Calculate password strength (0-4)
    const calculateStrength = (pwd) => {
        if (!pwd) return 0;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(pwd)) strength++;
        return Math.min(strength, 4);
    };

    const strength = calculateStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = {
        0: { bg: '#ff4444', text: '#ff4444', icon: '🔴' },
        1: { bg: '#ff8800', text: '#ff8800', icon: '🟠' },
        2: { bg: '#ffbb00', text: '#ffbb00', icon: '🟡' },
        3: { bg: '#88cc00', text: '#88cc00', icon: '🟢' },
        4: { bg: '#00cc44', text: '#00cc44', icon: '✅' }
    };

    const currentStrength = strengthColors[strength] || strengthColors[0];

    if (!password) return null;

    return (
        <div className="password-strength-meter">
            {/* Strength Bar Container */}
            <div className="strength-bar-container">
                <div className="strength-bar-wrapper">
                    <div 
                        className="strength-bar-fill"
                        style={{
                            width: `${(strength / 4) * 100}%`,
                            backgroundColor: currentStrength.bg,
                            boxShadow: `0 0 8px ${currentStrength.bg}40`
                        }}
                    />
                </div>
                <span 
                    className="strength-label"
                    style={{ color: currentStrength.text }}
                >
                    <span className="strength-icon">{currentStrength.icon}</span>
                    {strengthLabels[strength] || 'Very Weak'}
                </span>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="password-errors">
                    <ul>
                        {errors.map((err, idx) => (
                            <li key={idx}>
                                <span className="error-icon">✗</span>
                                {err}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Requirements Checklist */}
            {password && errors.length === 0 && strength < 4 && (
                <div className="password-tip">
                    <span className="tip-icon">💡</span>
                    <span>Use uppercase, lowercase, numbers, and special characters for a stronger password</span>
                </div>
            )}

            {/* Success Message */}
            {password && errors.length === 0 && strength === 4 && (
                <div className="password-success">
                    <span className="success-icon">✓</span>
                    <span>Excellent! Your password is strong and secure.</span>
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;

