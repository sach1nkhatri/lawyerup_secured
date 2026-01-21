import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './app/shared_components/utils/css/toast.css';

import LandingPage from './features/landing_page/page/LandingPage';
import AuthForm from './features/auth/components/LoginSignup';
import Dashboard from './features/dashboard/component/Dashboard';
import PricingPlans from './features/landing_page/components/PricingPlans';
import CheckoutPage from './features/payment_gateway/component/CheckoutPage';
import PrivateRoute from './app/routes/privateRoute';
import PlansPricing from './features/landing_page/components/PricingPlans'

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthForm />} />
                    <Route path="/dashboard/*" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/pricing" element={<PricingPlans />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/settings/pricing" element={<PlansPricing />} />
                </Routes>
            </Router>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
}

export default App;
