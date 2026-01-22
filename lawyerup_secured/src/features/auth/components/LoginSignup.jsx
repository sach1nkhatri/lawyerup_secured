import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LoginSignup.css';
import hammerIcon from '../../../app/assets/hammer.png';
import logoIcon from '../../../app/assets/logo2.png';
import logoText from '../../../app/assets/textlogoblack.png';
import useAuthForm from '../hooks/useAuthForm';
import MfaVerification from './MfaVerification';
import ForgotPassword from './ForgotPassword';

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
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
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
                                onClick={() => setIsLogin(!isLogin)}
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
