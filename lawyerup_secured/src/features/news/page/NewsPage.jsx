import React from 'react';
import NewsCard from '../components/NewsCard';
import NewsCardSkeleton from '../components/NewsCardSkeleton';
import '../css/NewsPage.css';
import '../../../app/shared_components/utils/css/nprogress.css';
import { useNewsPage } from '../hooks/useNewsPage';
import { getImageUrl } from '../utils/getImageUrl';

const NewsPage = () => {
    const {
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
    } = useNewsPage();

    const loggedInUser = JSON.parse(localStorage.getItem('lawyerup_user') || '{}');
    const currentUserName = loggedInUser?.fullName;

    return (
        <div className="news-page">
            <h2 className="news-heading">News & Article</h2>

            {selectedNews ? (
                <div className="news-detail-view">
                    <button className="back-button" onClick={handleBackClick}>← Back to all news</button>
                    <img
                        className="news-detail-image"
                        src={getImageUrl(selectedNews.image)}
                        alt={selectedNews.title}
                    />
                    <h3 className="news-detail-title">{selectedNews.title}</h3>
                    <p className="news-detail-meta">By {selectedNews.author} | {selectedNews.date}</p>

                    <div
                        className="news-detail-body"
                        dangerouslySetInnerHTML={{
                            __html: (selectedNews.fullText || selectedNews.summary || '')
                                .replace(/\\n\\n/g, '<br/><br/>')
                                .replace(/\n\n/g, '<br/><br/>')
                                .replace(/\\n/g, '<br/>')
                                .replace(/\n/g, '<br/>'),
                        }}
                    />

                    <div className="news-reactions">
                        <button onClick={handleLike}>👍 {selectedNews.likes || 0}</button>
                        <button onClick={handleDislike}>👎 {selectedNews.dislikes || 0}</button>
                    </div>

                    <div className="news-comments">
                        <h4>Comments</h4>

                        <textarea
                            placeholder="Write a comment..."
                            value={commentText}
                            maxLength={100}
                            onChange={(e) => {
                                if (e.target.value.length <= 100) setCommentText(e.target.value);
                            }}
                            className="comment-box"
                        />
                        <div className="comment-footer">
                            <small>{commentText.length}/100</small>
                            <button className="comment-submit" onClick={handleComment}>Post</button>
                        </div>

                        <div className="comment-thread">
                            {comments.length === 0 ? (
                                <p className="comment-item">💬 No comments yet.</p>
                            ) : comments.map((c, i) => (
                                <div key={i} className="comment-item">
                                    <strong>{c.user}</strong>: {c.text}
                                    {c.user === currentUserName && (
                                        <button
                                            className="comment-delete-btn"
                                            onClick={() => handleDeleteComment(i)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="news-grid">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
                        : newsData.map((item) => (
                            <NewsCard
                                key={item._id}
                                title={item.title}
                                author={item.author}
                                summary={item.summary}
                                date={item.date}
                                image={item.image}
                                onClick={() => handleCardClick(item)}
                                likes={item.likes}
                                dislikes={item.dislikes}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

export default NewsPage;
