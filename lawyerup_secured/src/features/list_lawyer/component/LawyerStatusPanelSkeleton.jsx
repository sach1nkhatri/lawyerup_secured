import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LawyerStatusPanelSkeleton = () => (
    <div style={{ padding: '2rem' }}>
        <Skeleton height={30} width={250} style={{ marginBottom: '1rem' }} />
        <Skeleton count={3} height={20} />
        <Skeleton height={40} width={100} style={{ marginTop: '2rem' }} />
    </div>
);

export default LawyerStatusPanelSkeleton;
