import React from 'react';
import { render, screen } from '@testing-library/react';

const mockUseReportModal = jest.fn();

jest.mock('../../../features/report/hooks/useReportModal', () => ({
    useReportModal: () => mockUseReportModal(),
}));

describe('ReportModal Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders when isOpen is true', () => {
        mockUseReportModal.mockReturnValue({
            selectedIssue: 'Incorrect legal information',
            setSelectedIssue: jest.fn(),
            customIssue: '',
            setCustomIssue: jest.fn(),
            issueOptions: [
                'Incorrect legal information',
                'Chatbot not responding',
                'Broken link or page',
                'Appointment issue',
                'Other',
            ],
            handleSubmit: jest.fn(),
        });

        const Modal = require('../../../features/report/component/ReportModal').default;
        render(<Modal isOpen={true} onClose={jest.fn()} />);
        expect(screen.getByText(/Report an Issue/i)).toBeInTheDocument();
        expect(screen.getByText(/Incorrect legal information/i)).toBeInTheDocument();
    });

    test('does not render when isOpen is false', () => {
        mockUseReportModal.mockReturnValue({
            selectedIssue: 'Anything',
            setSelectedIssue: jest.fn(),
            customIssue: '',
            setCustomIssue: jest.fn(),
            issueOptions: ['Other'],
            handleSubmit: jest.fn(),
        });

        const Modal = require('../../../features/report/component/ReportModal').default;
        const { container } = render(<Modal isOpen={false} onClose={jest.fn()} />);
        // eslint-disable-next-line testing-library/no-node-access
        expect(container.firstChild).toBeNull();
    });

    test('shows textarea when "Other" is selected', () => {
        mockUseReportModal.mockReturnValue({
            selectedIssue: 'Other',
            setSelectedIssue: jest.fn(),
            customIssue: '',
            setCustomIssue: jest.fn(),
            issueOptions: ['Other'],
            handleSubmit: jest.fn(),
        });

        const Modal = require('../../../features/report/component/ReportModal').default;
        render(<Modal isOpen={true} onClose={jest.fn()} />);
        expect(screen.getByPlaceholderText(/Describe your issue/i)).toBeInTheDocument();
    });
});
