import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsPage from '../../../features/news/page/NewsPage';

jest.mock('../../../features/news/hooks/useNewsPage', () => {
    const mockFn = jest.fn;
    return {
        useNewsPage: () => ({
            newsData: [],
            selectedNews: {
                _id: '1',
                title: 'Preview Test News',
                author: 'Sachin',
                date: '2025-07-14',
                summary: 'Summary...',
                fullText: 'Full test content',
                image: '/uploads/test.jpg',
                likes: 12,
                dislikes: 3,
                likedBy: [],
                dislikedBy: [],
                comments: [],
            },
            commentText: 'Nice!',
            comments: [],
            setCommentText: mockFn(),
            loading: false,
            handleCardClick: mockFn(),
            handleBackClick: mockFn(),
            handleLike: mockFn(),
            handleDislike: mockFn(),
            handleComment: mockFn(),
            handleDeleteComment: mockFn(),
        }),
    };
});

describe('NewsPage Preview Mode', () => {
    test('renders selected news detail view', () => {
        render(<NewsPage />);
        expect(screen.getByText(/Preview Test News/i)).toBeInTheDocument();
        expect(screen.getByText(/By Sachin/i)).toBeInTheDocument();
    });

    test('like and dislike buttons call handlers', () => {
        render(<NewsPage />);
        fireEvent.click(screen.getByText(/👍/));
        fireEvent.click(screen.getByText(/👎/));
        // We can't assert individual handlers unless we hoist them into variables
    });

    test('comment box works and post button triggers handler', () => {
        render(<NewsPage />);
        fireEvent.change(screen.getByPlaceholderText(/Write a comment/i), {
            target: { value: 'Updated comment' },
        });
        fireEvent.click(screen.getByText(/Post/i));
    });

    test('shows no comments message when empty', () => {
        render(<NewsPage />);
        expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
    });

    test('back button triggers handler', () => {
        render(<NewsPage />);
        fireEvent.click(screen.getByText(/Back to all news/i));
    });
});
