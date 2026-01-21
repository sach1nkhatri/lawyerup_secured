import React from 'react';
import JoinAsLawyerForm from '../component/JoinAsLawyerForm';
import LawyerStatusPanel from '../component/LawyerStatusPanel';
import LawyerFinalListingPanel from '../component/LawyerFinalListingPanel';
import { useJoinLawyerPage } from '../hooks/useJoinLawyerPage';
import LawyerStatusPanelSkeleton from '../component/LawyerStatusPanelSkeleton'

const JoinLawyerPage = () => {
    const {
        view,
        lawyerData,
        loadProfile,
        handleNext,
        handleBackToStatus,
        handleReapply,
        handleGoToStatus
    } = useJoinLawyerPage();

    if (view === 'loading') return <LawyerStatusPanelSkeleton />;
    if (view === 'form') return <JoinAsLawyerForm onSubmitted={loadProfile} />;
    if (view === 'status') return <LawyerStatusPanel lawyer={lawyerData} onNext={handleNext} />;
    if (view === 'control') {
        return (
            <LawyerFinalListingPanel
                lawyer={lawyerData}
                onReapply={handleReapply}
                onBack={handleBackToStatus}
                onHold={handleGoToStatus}
            />
        );
    }

    return <p>Something went wrong. Please reload.</p>;
};

export default JoinLawyerPage;
