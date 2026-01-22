import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginSignup.css';
import hammerIcon from '../../../app/assets/hammer.png';
import logoIcon from '../../../app/assets/logo2.png';
import logoText from '../../../app/assets/textlogoblack.png';
import useAuthForm from '../hooks/useAuthForm';
import MfaVerification from './MfaVerification';
import ForgotPassword from './ForgotPassword';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const LoginSignUp = () => {
    const navigate = useNavigate();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    
    const {
        formData,
        isLogin,
        setIsLogin,
        handleInputChange,
        handleSubmit,
        mfaRequired,
        mfaData,
        setMfaRequired,
        passwordErrors,
    } = useAuthForm();

    const handleMfaSuccess = (user) => {
        setMfaRequired(false);
        navigate('/dashboard');
    };

    const handleMfaCancel = () => {
        setMfaRequired(false);
        // Clear form
        handleInputChange({ target: { name: 'email', value: '' } });
        handleInputChange({ target: { name: 'password', value: '' } });
    };

    const renderSignupFields = () => (
        <>
            <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="input-dropdown"
                required
            >
                <option value="user">User</option>
                <option value="lawyer">Lawyer</option>
            </select>
            <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
            />
            <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
            />
        </>
    );

    // Show MFA verification if required
    if (mfaRequired && mfaData) {
        return (
            <div className="login-signup-page">
                <div className="auth-container">
                    <div className="logo-wrap">
                        <img src={logoIcon} alt="Logo" className="logo-icon" />
                        <img src={logoText} alt="LawyerUp" className="logo-text" />
                    </div>
                    <MfaVerification 
                        mfaData={mfaData} 
                        onSuccess={handleMfaSuccess}
                        onCancel={handleMfaCancel}
                    />
                </div>
            </div>
        );
    }

    // Show forgot password form
    if (showForgotPassword) {
        return (
            <div className="login-signup-page">
                <div className="auth-container">
                    <div className="logo-wrap">
                        <img src={logoIcon} alt="Logo" className="logo-icon" />
                        <img src={logoText} alt="LawyerUp" className="logo-text" />
                    </div>
                    <ForgotPassword onBack={() => setShowForgotPassword(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="login-signup-page">
            <div className="auth-container">
                <div className="logo-wrap">
                    <img src={logoIcon} alt="Logo" className="logo-icon" />
                    <img src={logoText} alt="LawyerUp" className="logo-text" />
                </div>

                <div className="form-container">
                    <h2>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
                    <h1>{isLogin ? 'Sign in' : 'Create Your Account'}</h1>

                    <div className="login-box">
                        <div className="gif-container">
                            <img src={hammerIcon} alt="Hammer" />
                        </div>

                        <form onSubmit={handleSubmit}>
                            {!isLogin && renderSignupFields()}

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        marginBottom: !isLogin && formData.password ? '0' : '8px'
                                    }}
                                />
                                {/* Show password strength meter only during signup */}
                                {!isLogin && (
                                    <PasswordStrengthMeter 
                                        password={formData.password} 
                                        errors={passwordErrors}
                                    />
                                )}
                            </div>
                            {/* Show confirm password field only during signup */}
                            {!isLogin && (
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            fontSize: '16px',
                                            marginBottom: formData.confirmPassword && formData.password !== formData.confirmPassword ? '5px' : '10px',
                                            border: formData.confirmPassword && formData.password !== formData.confirmPassword ? '2px solid #d32f2f' : '2px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                        <p style={{ 
                                            color: '#d32f2f', 
                                            fontSize: '12px', 
                                            marginTop: '5px', 
                                            marginBottom: '10px' 
                                        }}>
                                            Passwords do not match
                                        </p>
                                    )}
                                    {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                                        <p style={{ 
                                            color: '#388e3c', 
                                            fontSize: '12px', 
                                            marginTop: '5px', 
                                            marginBottom: '10px' 
                                        }}>
                                            ✓ Passwords match
                                        </p>
                                    )}
                                </div>
                            )}
                            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>

                            {isLogin && (
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="forgot-pass"
                                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Forgot password?
                                </button>
                            )}
                        </form>

                        <p className="switch-form">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                type="button"
                                className="switch-link"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    // Clear confirm password when switching modes
                                    if (!isLogin) {
                                        handleInputChange({ target: { name: 'confirmPassword', value: '' } });
                                    }
                                }}
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignUp;
