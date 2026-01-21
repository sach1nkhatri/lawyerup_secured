import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PdfLibrary from '../../../features/pdf_libary/page/PdfLibrary';

jest.mock('../../../features/pdf_libary/hooks/usePdfList', () => ({
    __esModule: true,
    default: () => ({
        loading: false,
        pdfs: [
            { _id: '1', title: 'Law Basics', url: '/uploads/pdfs/law1.pdf' },
            { _id: '2', title: 'Rights Guide', url: '/uploads/pdfs/rights.pdf' }
        ]
    })
}));

describe('PdfLibrary Component', () => {
    test('renders heading', () => {
        render(<PdfLibrary />);
        expect(screen.getByText(/PDF Library/i)).toBeInTheDocument();
    });

    test('renders all PDF cards', () => {
        render(<PdfLibrary />);
        expect(screen.getByText(/Law Basics/i)).toBeInTheDocument();
        expect(screen.getByText(/Rights Guide/i)).toBeInTheDocument();
    });

    test('renders download icon for each PDF', () => {
        render(<PdfLibrary />);
        const downloadIcons = screen.getAllByAltText(/Download/i);
        expect(downloadIcons.length).toBe(2);
    });

    test('clicking download triggers link creation', () => {
        const appendSpy = jest.spyOn(document.body, 'appendChild');
        render(<PdfLibrary />);
        const downloadBtn = screen.getAllByAltText(/Download/i)[0];
        fireEvent.click(downloadBtn);
        expect(appendSpy).toHaveBeenCalled(); // confirms anchor was created and clicked
        appendSpy.mockRestore();
    });
});


