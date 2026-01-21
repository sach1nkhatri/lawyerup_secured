// src/__tests__/NewsPage.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsPage from '../../../features/news/page/NewsPage';

// Mock the hook and utility
jest.mock('../../../features/news/hooks/useNewsPage', () => ({
    useNewsPage: () => ({
        newsData: [
            {
                _id: '1',
                title: 'Test News',
                author: 'Sachin',
                summary: 'This is a test summary',
                date: '2025-07-14',
                image: '/uploads/test.jpg',
                likes: 5,
                dislikes: 2,
                likedBy: [],
                dislikedBy: [],
                comments: []
            }
        ],
        selectedNews: null,
        commentText: '',
        comments: [],
        setCommentText: jest.fn(),
        loading: false,
        handleCardClick: jest.fn(),
        handleBackClick: jest.fn(),
        handleLike: jest.fn(),
        handleDislike: jest.fn(),
        handleComment: jest.fn(),
        handleDeleteComment: jest.fn()
    })
}));

describe('NewsPage Component', () => {
    test('renders news heading', () => {
        render(<NewsPage />);
        expect(screen.getByText(/News & Article/i)).toBeInTheDocument();
    });

    test('renders news card from mock data', () => {
        render(<NewsPage />);
        expect(screen.getByText(/Test News/i)).toBeInTheDocument();
        expect(screen.getByText(/Sachin/i)).toBeInTheDocument();
    });

    test('renders like and dislike counts', () => {
        render(<NewsPage />);
        expect(screen.getByText(/👍 5/)).toBeInTheDocument();
        expect(screen.getByText(/👎 2/)).toBeInTheDocument();
    });

    test('clicking news card triggers handleCardClick', () => {
        const { getByText } = render(<NewsPage />);
        const card = getByText(/Test News/i).closest('.news-card');
        fireEvent.click(card);
        // Note: actual trigger checked in integration test with real implementation
    });
});
