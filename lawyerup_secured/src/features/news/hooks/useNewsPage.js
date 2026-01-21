import { useEffect, useState } from 'react';
import axios from 'axios';
import NProgress from 'nprogress';
import Swal from 'sweetalert2';
import { notify } from '../../../app/shared_components/utils/notify';
import API from '../../../app/api/api_endpoints';

export const useNewsPage = () => {
    const [newsData, setNewsData] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                NProgress.start();
                const res = await axios.get(API.NEWS);
                setNewsData(res.data);
            } catch (error) {
                console.error('Failed to fetch news:', error);
                notify('error', '❌ Failed to load news.');
            } finally {
                NProgress.done();
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const handleCardClick = (newsItem) => {
        setSelectedNews(newsItem);
        setComments(newsItem.comments || []);
    };

    const handleBackClick = () => {
        setSelectedNews(null);
        setCommentText('');
    };

    const handleLike = async () => {
        const user = JSON.parse(localStorage.getItem('lawyerup_user') || '{}');
        const userId = user?._id;
        if (!userId) return notify('error', 'You must be logged in.');

        const alreadyLiked = selectedNews?.likedBy?.includes(userId);
        const endpoint = alreadyLiked ? 'unlike' : 'like';

        try {
            const res = await axios.post(`${API.NEWS}/${selectedNews._id}/${endpoint}`, { userId });
            setSelectedNews({
                ...selectedNews,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                likedBy: alreadyLiked
                    ? selectedNews.likedBy.filter(u => u !== userId)
                    : [...selectedNews.likedBy, userId],
                dislikedBy: selectedNews.dislikedBy.filter(u => u !== userId)
            });

            if (!alreadyLiked) notify('success', '👍 You liked this');
        } catch (err) {
            notify('error', err.response?.data?.error || 'Like action failed');
        }
    };

    const handleDislike = async () => {
        const user = JSON.parse(localStorage.getItem('lawyerup_user') || '{}');
        const userId = user?._id;
        if (!userId) return notify('error', 'You must be logged in.');

        const alreadyDisliked = selectedNews?.dislikedBy?.includes(userId);
        const endpoint = alreadyDisliked ? 'undislike' : 'dislike';

        try {
            const res = await axios.post(`${API.NEWS}/${selectedNews._id}/${endpoint}`, { userId });
            setSelectedNews({
                ...selectedNews,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
                dislikedBy: alreadyDisliked
                    ? selectedNews.dislikedBy.filter(u => u !== userId)
                    : [...selectedNews.dislikedBy, userId],
                likedBy: selectedNews.likedBy.filter(u => u !== userId)
            });

            if (!alreadyDisliked) notify('success', '👎 You disliked this');
        } catch (err) {
            notify('error', err.response?.data?.error || 'Dislike action failed');
        }
    };

    const handleComment = async () => {
        const token = localStorage.getItem('lawyerup_token');
        if (!token) return notify('error', 'You must be logged in to comment.');

        if (!commentText.trim()) {
            return notify('warn', 'Write something before posting!');
        }

        try {
            const res = await axios.post(
                `${API.NEWS}/${selectedNews._id}/comment`,
                { text: commentText.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(res.data.comments);
            setCommentText('');
            notify('success', '💬 Comment added!');
        } catch (err) {
            notify('error', err.response?.data?.error || 'Failed to comment');
        }
    };

    const handleDeleteComment = async (index) => {
        const confirm = await Swal.fire({
            title: 'Delete this comment?',
            text: 'Are you sure you want to remove this comment?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#999'
        });

        if (!confirm.isConfirmed) return;

        const token = localStorage.getItem('lawyerup_token');
        if (!token) return notify('error', 'You must be logged in to delete comments.');

        try {
            const res = await axios.delete(
                `${API.NEWS}/${selectedNews._id}/comment/${index}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(res.data.comments);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Your comment has been removed.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            notify('error', err.response?.data?.error || 'Failed to delete comment');
        }
    };

    return {
        newsData,
        selectedNews,
        commentText,
        comments,
        setCommentText,
        loading,
        handleCardClick,
        handleBackClick,
        handleLike,
        handleDislike,
        handleComment,
        handleDeleteComment
    };
};
