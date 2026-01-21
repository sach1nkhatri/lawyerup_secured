import React from 'react';
import '../css/NewsCard.css';
import { getImageUrl } from '../utils/getImageUrl';

const NewsCard = ({ title, author, summary, date, image, onClick, likes = 0, dislikes = 0 }) => (
    <div className="news-card" onClick={onClick}>
        <img
            className="news-image"
            src={getImageUrl(image)}
            alt={title}
        />
        <div className="news-content">
            <h3 className="news-title">{title}</h3>
            <p className="news-author">{author}</p>
            <p className="news-summary">{summary?.replace(/\\n|\\n\\n|\n|\n\n/g, ' ')}</p>
            <p className="news-date">{date}</p>
        </div>
        <div className="news-reactions">
            <span>👍 {likes}</span>
            <span>👎 {dislikes}</span>
        </div>
    </div>
);

export default NewsCard;
