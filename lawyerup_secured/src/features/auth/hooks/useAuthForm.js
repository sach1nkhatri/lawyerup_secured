import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../app/api/axiosConfig';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import API from '../../../app/api/api_endpoints';

const useAuthForm = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaData, setMfaData] = useState(null);

    const [formData, setFormData] = useState({
        role: 'user',
        fullName: '',
        email: '',
        password: '',
        contactNumber: '',
    });

    useEffect(() => {
        // Check if user is already authenticated via cookie
        // Note: We can't directly check httpOnly cookies, so we'll verify on protected routes
        const authFlag = localStorage.getItem('auth');
        if (authFlag === 'true') {
            // Verify auth is still valid by checking a protected endpoint
            verifyAuth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const verifyAuth = async () => {
        try {
            // Try to fetch user profile to verify cookie is valid
            await axiosInstance.get(`${API.AUTH}/me`);
            navigate('/dashboard');
        } catch (err) {
            // Auth invalid, clear flag
            localStorage.removeItem('auth');
            localStorage.removeItem('lawyerup_user');
        }
    };

    const handleInputChange = ({ target: { name, value } }) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        startLoader();

        const endpoint = `${API.AUTH}/${isLogin ? 'login' : 'signup'}`;
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                contactNumber: formData.contactNumber,
            };

        try {
            const res = await axiosInstance.post(endpoint, payload);
            
            if (isLogin) {
                // Check if MFA is required
                if (res.data.mfaRequired) {
                    setMfaRequired(true);
                    setMfaData({
                        mfaToken: res.data.mfaToken,
                        userId: res.data.userId,
                        email: res.data.email,
                        passwordExpiresAt: res.data.passwordExpiresAt
                    });
                    notify('info', 'Please enter your MFA code to continue');
                    stopLoader();
                    return;
                }

                // Normal login success
                const { user } = res.data;
                // Store user data (but NOT token - token is in httpOnly cookie)
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
                
                notify('success', 'Logged in successfully!');
                navigate('/dashboard');
            } else {
                // Signup success
                const { user } = res.data;
                localStorage.setItem('lawyerup_user', JSON.stringify(user));
                localStorage.setItem('auth', 'true');
                notify('success', 'Signup successful! Welcome to LawyerUp.');
                navigate('/dashboard');
            }
        } catch (err) {
            // Handle specific security errors
            if (err.userMessage) {
                notify('error', err.userMessage);
            } else if (err.response?.status === 423) {
                // Account locked
                const retryAfter = err.response?.data?.retryAfter;
                notify('error', `Account locked. Try again in ${retryAfter || 'some time'}.`);
            } else if (err.response?.status === 429) {
                // Rate limited
                notify('error', err.userMessage || 'Too many requests. Please try again later.');
            } else if (err.response?.status === 403 && err.requiresPasswordChange) {
                // Password expired
                notify('error', 'Your password has expired. Please change it.');
                // TODO: Redirect to password change page
            } else {
                const msg = err.response?.data?.message || err.message || '';
                if (msg.toLowerCase().includes('user') || msg.toLowerCase().includes('email')) {
                    notify('error', '❌ Invalid email or password.');
                } else if (msg.toLowerCase().includes('password')) {
                    notify('warn', '🔐 Incorrect password.');
                } else {
                    notify('error', '⚠️ Network error. Please try again.');
                }
            }
            console.error('[Auth error]', err);
        } finally {
            stopLoader();
        }
    };

    return {
        formData,
        isLogin,
        setIsLogin,
        handleInputChange,
        handleSubmit,
        mfaRequired,
        mfaData,
        setMfaRequired,
    };
};

export default useAuthForm;
