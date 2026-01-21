import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notify } from '../../../app/shared_components/utils/notify';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import API from '../../../app/api/api_endpoints';

const useAuthForm = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        role: 'user',
        fullName: '',
        email: '',
        password: '',
        contactNumber: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('lawyerup_token');
        if (token) navigate('/dashboard');
    }, [navigate]);

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
            const res = await axios.post(endpoint, payload);
            const { user, token } = res.data;

            if (isLogin) {
                localStorage.setItem('lawyerup_token', token);
                localStorage.setItem('lawyerup_user', JSON.stringify(user));
                localStorage.setItem('auth', 'true');
                notify('success', 'Logged in successfully!');
                navigate('/dashboard');
            } else {
                notify('success', 'Signup successful! Please log in.');
                setFormData((prev) => ({
                    email: prev.email,
                    password: prev.password,
                    fullName: '',
                    contactNumber: '',
                    role: 'user',
                }));
                setIsLogin(true);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || '';
            if (msg.toLowerCase().includes('user')) {
                notify('error', '❌ User not found.');
            } else if (msg.toLowerCase().includes('password')) {
                notify('warn', '🔐 Incorrect password.');
            } else {
                notify('error', '⚠️ Network error. Please try again.');
            }
            console.error('[Login error]', err);
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
    };
};

export default useAuthForm;
