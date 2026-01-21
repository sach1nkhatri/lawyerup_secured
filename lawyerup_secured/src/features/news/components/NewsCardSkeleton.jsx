import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import '../css/NewsCard.css';

const NewsCardSkeleton = () => (
    <div className="news-card">
        <Skeleton className="news-image" height={180} />

        <div className="news-content">
            <h3 className="news-title">
                <Skeleton width={`80%`} height={24} />
            </h3>
            <p className="news-author">
                <Skeleton width={`40%`} height={16} />
            </p>
            <p className="news-summary">
                <Skeleton count={2} height={14} />
            </p>
            <p className="news-date">
                <Skeleton width={100} height={14} />
            </p>
        </div>

        <div className="news-reactions">
            <Skeleton width={40} height={20} style={{ marginRight: '10px' }} />
            <Skeleton width={40} height={20} />
        </div>
    </div>
);

export default NewsCardSkeleton;
