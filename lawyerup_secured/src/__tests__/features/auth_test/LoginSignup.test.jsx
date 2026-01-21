// src/__tests__/LoginSignup.test.jsx
import { render, screen } from '@testing-library/react';
import LoginSignUp from '../../../features/auth/components/LoginSignup';
import React from 'react';

// Default (Login mode) mock
jest.mock('../../../features/auth/hooks/useAuthForm', () => () => ({
    formData: {
        role: 'user',
        fullName: '',
        email: '',
        password: '',
        contactNumber: '',
    },
    isLogin: true,
    setIsLogin: jest.fn(),
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn((e) => e.preventDefault()),
}));

describe('LoginSignup Component', () => {
    describe('Login Mode', () => {
        test('renders login form inputs and button', () => {
            render(<LoginSignUp />);
            expect(screen.getByPlaceholderText(/Email or Username/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
        });

        test('renders forgot password link in login mode', () => {
            render(<LoginSignUp />);
            expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
        });

        test('renders switch to signup button in login mode', () => {
            render(<LoginSignUp />);
            expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
        });
    });

    describe('Signup Mode', () => {
        // Re-mock useAuthForm to return signup state
        beforeEach(() => {
            jest.resetModules();
            jest.doMock('../../../features/auth/hooks/useAuthForm', () => () => ({
                formData: {
                    role: 'lawyer',
                    fullName: '',
                    email: '',
                    password: '',
                    contactNumber: '',
                },
                isLogin: false,
                setIsLogin: jest.fn(),
                handleInputChange: jest.fn(),
                handleSubmit: jest.fn((e) => e.preventDefault()),
            }));
        });

        test('renders signup fields and button', () => {
            const SignupForm = require('../../../features/auth/components/LoginSignup').default;
            render(<SignupForm />);
            expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Contact Number/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Email or Username/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
        });

        test('role dropdown renders and has expected values', () => {
            const SignupForm = require('../../../features/auth/components/LoginSignup').default;
            render(<SignupForm />);
            const roleDropdown = screen.getByRole('combobox');
            expect(roleDropdown).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /User/i })).toBeInTheDocument();
            expect(screen.getByRole('option', { name: /Lawyer/i })).toBeInTheDocument();
        });
    });
});
