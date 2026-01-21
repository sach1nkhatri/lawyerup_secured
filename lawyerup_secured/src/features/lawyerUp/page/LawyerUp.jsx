import React from 'react';
import { useNavigate } from 'react-router-dom';
import LawyerCard from '../component/LawyerCard';
import LawyerProfilePanel from '../component/LawyerProfilePanel';
import { useLawyerUp } from '../hooks/useLawyerUp';
import { LawyerCardSkeleton, LawyerProfileSkeleton } from '../component/LawyerSkeletons'; // ✅ import
import '../css/LawyerUp.css';

const LawyerUp = () => {
    const navigate = useNavigate();
    const {
        listedLawyers,
        selectedLawyer,
        loading,
        resolveImage
    } = useLawyerUp();

    return (
        <div className="lawyerup-container">
            <div className="lawyerup-header">
                <h2>LawyerUp</h2>
                <div className="lawyerup-controls">
                    <input className="search-bar" placeholder="Search for lawyers"/>
                    <label className="toggle-wrapper">
                        <input type="checkbox"/>
                        <span className="toggle-slider"/>
                    </label>
                </div>
            </div>

            {loading ? (
                selectedLawyer ? (
                    <div className="profile-split-view">
                        <LawyerCardSkeleton />
                        <LawyerProfileSkeleton />
                    </div>
                ) : (
                    <div className="lawyer-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <LawyerCardSkeleton key={i} />
                        ))}
                    </div>
                )
            ) : !selectedLawyer ? (
                <div className="lawyer-grid">
                    {listedLawyers.map((lawyer) => (
                        <LawyerCard
                            key={lawyer._id}
                            lawyer={{
                                ...lawyer,
                                name: lawyer.fullName,
                                contact: lawyer.phone,
                                image: resolveImage(lawyer.profilePhoto),
                                rating: lawyer.rating || 0,
                                reviews: lawyer.reviews || [],
                            }}
                            onViewProfile={() =>
                                navigate(`/dashboard/lawyerUp/lawyerProfile/${lawyer._id}`)
                            }
                        />
                    ))}
                </div>
            ) : (
                <div className="profile-split-view">
                    <LawyerCard
                        lawyer={{
                            ...selectedLawyer,
                            name: selectedLawyer.fullName,
                            contact: selectedLawyer.phone,
                            image: resolveImage(selectedLawyer.profilePhoto),
                            rating: selectedLawyer.rating || 0,
                            reviews: selectedLawyer.reviews || [],
                        }}
                        showShare
                    />
                    <LawyerProfilePanel
                        lawyer={selectedLawyer}
                        onBack={() => navigate('/dashboard/lawyerUp')}
                    />
                </div>
            )}
        </div>
    );
};

export default LawyerUp;
