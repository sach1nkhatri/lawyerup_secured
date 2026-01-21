import React from 'react';
import styles from '../css/LawyerStatusPanel.module.css';
import defaultAvatar from '../../../app/assets/avatar.png';
import { useLawyerStatusPanel } from '../hooks/useLawyerStatusPanel';
import { getImageUrl } from '../utils/getImageUrl';

const LawyerStatusPanel = ({ lawyer, onNext }) => {
    const {
        status,
        statusStep,
        getStatusLabel,
        handleStartListing
    } = useLawyerStatusPanel(lawyer, onNext);

    if (!lawyer) return null;

    return (
        <div className={styles.statusContainer}>
            <div className={styles.panel}>
                <div className={styles.avatarWrapper}>
                    <img
                        src={getImageUrl(lawyer.profilePhoto)}
                        alt={lawyer.fullName}
                        className="listing-profile-pic"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </div>

                <div className={styles.grid}>
                    <div className={styles.left}>
                        <h3>Details</h3>
                        <p><strong>Name:</strong> {lawyer.fullName}</p>
                        <p><strong>Specialization:</strong> {lawyer.specialization}</p>
                        <p><strong>Qualification:</strong> {lawyer.qualification}</p>
                        <p><strong>Address:</strong> {lawyer.address}</p>
                        <p><strong>Contact:</strong> {lawyer.phone}</p>
                        <p><strong>Status:</strong> <span>{getStatusLabel(status)}</span></p>
                    </div>
                    <div className={styles.right}>
                        <h3>Availability</h3>
                        {Object.entries(lawyer.schedule || {}).map(([day, slots], idx) => (
                            <p key={idx}>
                                <strong>{day}</strong>: {slots.map(s => `${s.start} to ${s.end}`).join(', ')}
                            </p>
                        ))}
                    </div>
                </div>

                {lawyer.description && (
                    <div className={styles.section}>
                        <h3>Description</h3>
                        <p>{lawyer.description}</p>
                    </div>
                )}

                {lawyer.specialCase && (
                    <div className={styles.section}>
                        <h3>Special Case</h3>
                        <p>{lawyer.specialCase}</p>
                    </div>
                )}

                {lawyer.socialLink && (
                    <div className={styles.section}>
                        <h3>Social Link</h3>
                        <a href={lawyer.socialLink} target="_blank" rel="noreferrer">{lawyer.socialLink}</a>
                    </div>
                )}

                {lawyer.education?.length > 0 && (
                    <div className={styles.section}>
                        <h3>Education</h3>
                        <ul>
                            {lawyer.education.map((e, i) => (
                                <li key={i}>
                                    🎓 {e.degree} - {e.institute}, {e.year} ({e.specialization})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {lawyer.workExperience?.length > 0 && (
                    <div className={styles.section}>
                        <h3>Work Experience</h3>
                        <ul>
                            {lawyer.workExperience.map((w, i) => (
                                <li key={i}>
                                    📁 {w.court} ({w.from} to {w.to})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {status === 'rejected' && lawyer.rejectionReason && (
                    <div className={styles.rejectionBox}>
                        <h4>❌ Application Rejected</h4>
                        <p><strong>Reason:</strong> {lawyer.rejectionReason}</p>
                    </div>
                )}

                <div className={styles.progressBar}>
                    <div className={`${styles.step} ${statusStep >= 1 ? styles.activeOrange : ''}`}>Application Sent</div>
                    <div className={`${styles.step} ${statusStep >= 2 ? styles.activeGreen : ''}`}>Application Approved</div>
                    <div className={`${styles.step} ${statusStep >= 3 ? styles.activeBlue : ''}`}>Listed</div>
                </div>

                {(status === 'hold' || status === 'verified' || status === 'listed' || status === 'rejected') && (
                    <div className={styles.actionRow}>
                        <button
                            className={styles.nextButton}
                            onClick={status === 'hold' ? handleStartListing : onNext}
                        >
                            {status === 'listed' ? 'Edit Public Listing →' : 'Edit Application →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerStatusPanel;
