import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const LawyerCardSkeleton = () => {
    return (
        <div className="lawyer-card">
            <Skeleton height={180} width={180} style={{ borderRadius: '10px' }} />
            <div className="lawyer-info">
                <p><Skeleton width={120} /></p>
                <p><Skeleton width={100} /></p>
                <div className="rating">
                    <Skeleton width={80} height={20} />
                </div>
                <Skeleton height={30} width={100} />
            </div>
        </div>
    );
};

export const LawyerProfileSkeleton = () => {
    return (
        <div className="profile-panel">
            <h3><Skeleton width={120} /></h3>

            <div className="tab-menu">
                <Skeleton width={90} height={30} style={{ marginRight: '10px' }} />
                <Skeleton width={90} height={30} style={{ marginRight: '10px' }} />
                <Skeleton width={90} height={30} />
            </div>

            <div className="tab-content">
                <Skeleton count={5} height={20} style={{ marginBottom: '10px' }} />
            </div>

            <Skeleton width={160} height={40} style={{ marginTop: '1rem' }} />

            <h3 className="review-heading">
                <Skeleton width={200} />
            </h3>
            <Skeleton count={3} height={30} />

            <Skeleton width={100} height={30} style={{ marginTop: '1rem' }} />
        </div>
    );
};
