import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import API from '../api/api_endpoints';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        try {
            // Verify authentication by checking a protected endpoint
            // This will use the httpOnly cookie automatically
            const res = await axiosInstance.get(`${API.AUTH}/me`);
            const user = res.data.user || res.data; // Handle both formats
            if (user) {
                // Update user data in localStorage
                localStorage.setItem('lawyerup_user', JSON.stringify(user));
                localStorage.setItem('auth', 'true');
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (err) {
            // Auth failed - clear any stale data
            localStorage.removeItem('auth');
            localStorage.removeItem('lawyerup_user');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        // Show loading state while verifying auth
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
