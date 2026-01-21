// src/__tests__/features/faq_page_test/HelpFAQPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpFAQPage from '../../../features/faq_page/page/HelpFAQPage';

jest.mock('../../../features/faq_page/hooks/useSupportEmail', () => ({
    useSupportEmail: () => jest.fn(),
}));

// Declare mock first
const mockUseFaqs = jest.fn();

// Global mock once — no out-of-scope vars!
jest.mock('../../../features/faq_page/hooks/useFaqs', () => ({
    useFaqs: () => mockUseFaqs(),
}));

describe('HelpFAQPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders heading and intro text', () => {
        mockUseFaqs.mockReturnValue({ faqs: [], loading: false });
        render(<HelpFAQPage />);
        expect(screen.getByText(/Help & FAQ/i)).toBeInTheDocument();
        expect(screen.getByText(/Got a question/i)).toBeInTheDocument();
    });

    test('shows loading state when loading is true', () => {
        mockUseFaqs.mockReturnValue({ faqs: [], loading: true });
        render(<HelpFAQPage />);
        expect(screen.getByText(/Loading FAQs/i)).toBeInTheDocument();
    });

    test('shows empty state when no FAQs', () => {
        mockUseFaqs.mockReturnValue({ faqs: [], loading: false });
        render(<HelpFAQPage />);
        expect(screen.getByText(/No FAQs available/i)).toBeInTheDocument();
    });

    test('renders FAQItem components when FAQs exist', () => {
        mockUseFaqs.mockReturnValue({
            loading: false,
            faqs: [
                { _id: '1', question: 'What is LawyerUp?', answer: 'A legal support platform.' },
                { _id: '2', question: 'How to book a lawyer?', answer: 'Click on the book button.' },
            ],
        });
        render(<HelpFAQPage />);
        expect(screen.getByText(/What is LawyerUp/i)).toBeInTheDocument();
        expect(screen.getByText(/How to book a lawyer/i)).toBeInTheDocument();
    });
});
