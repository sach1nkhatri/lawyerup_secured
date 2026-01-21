import React, {useState} from 'react';
// import { Sun, Moon } from 'lucide-react';
import profileImage from '../../../app/assets/avatar.png';
import PlanCardInSettings from '../components/PlanCardInSettings';
import { useSettings } from '../hooks/useSettings';
import '../css/SettingPage.css';
import PrivacyModal from "../modal/PrivacyModal";
import AboutModal from "../modal/AboutModal";




const Settings = () => {
    const {
        darkMode,
        formData,
        isEditing,
        hasChanged,
        handleChange,
        loading,
        handleEditClick,
        // toggleTheme,
        handleConfirmAction,
        clearBookingAndChat,
        clearLawAiData,
        deleteAccount
    } = useSettings();

    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const isProfileIncomplete = !formData.state || !formData.city || !formData.address;

// If this is still loading after 0.5s, either your internet’s dead or my code is.

    if (loading) {
        return (
            <div className="settings-container">
                <div className="settings-card skeleton-card">
                    <div className="skeleton-title shimmer" />
                    <div className="skeleton-subtitle shimmer" />
                    <div className="skeleton-form shimmer" />
                </div>
            </div>
        );
    }

    return (
        <div className={`settings-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="settings-card">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Manage your account settings and preferences</p>

                {/*// Reminder: if they haven't entered their city/state, good luck finding a lawyer in the void.*/}
                {isProfileIncomplete && (
                    <div className="profile-incomplete-warning">
                        <strong>Complete your profile</strong> to get personalized lawyer recommendations in your area.
                    </div>
                )}

                {/* ===== Profile Form + Image ===== */}
                <div className="settings-content">
                    <div className="settings-form">
                        {[
                            ['name', 'Name'],
                            ['email', 'Email'],
                            ['phone', 'Phone'],
                            ['state', 'State'],
                            ['city', 'City'],
                            ['address', 'Address'],
                        ].map(([key, label]) => (
                            <div key={key} className={`form-group ${['name', 'email', 'phone', 'address'].includes(key) ? 'full-width' : ''}`}>
                                <label>{label}</label>
                                <input
                                    type="text"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="settings-profile">
                        <img src={profileImage} alt="Profile" className="profile-image" />    {/*// Profile image is static for now — feel free to pretend it’s AI-generated or royalty-free vibes.*/}
                        <button onClick={handleEditClick} className="edit-button">
                            {isEditing ? (hasChanged ? 'Update Profile' : 'Cancel') : 'Edit Profile'}
                        </button>
                        {/*<button className="theme-toggle" onClick={toggleTheme}>*/}           {/*Later For Dark Mode*/}
                        {/*    {darkMode ? <Sun size={18} /> : <Moon size={18} />}*/}
                        {/*</button>*/}
                    </div>
                </div>
                {/* ===== Subscription Plan ===== */}
                {!loading && (
                    <div className="subscription-wrapper">
                        <h3 className="settings-subtitle">Your Current Plan</h3>
                        <PlanCardInSettings plan={formData.plan || 'Free Trial'} />
                    </div>
                )}
                {/* ===== Privacy Section ===== */}
                {/* ===== Legal & Info Section ===== */}
                <div className="privacy-section">
                    <h3>Legal & Info</h3>
                    <div className="privacy-buttons">
                        <button className="info-btn" onClick={() => setShowPrivacy(true)}>
                            Privacy & Policy
                        </button>
                        <button className="info-btn" onClick={() => setShowAbout(true)}>
                            About Us
                        </button>
                    </div>

                    {/* === Popups === */}
                    {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
                    {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
                </div>

                {/* ===== Danger Zone ===== */}
                <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <ul>
                        {[
                            {
                                label: 'Clear Booking ',
                                handler: clearBookingAndChat,
                                confirmWord: 'CLEAR'
                            },
                            {
                                label: 'Clear Law AI Data',
                                handler: clearLawAiData,
                                confirmWord: 'WIPE'
                            },
                            {
                                label: 'Delete Account',
                                handler: deleteAccount,
                                confirmWord: 'DELETE'
                            }
                        ].map(({ label, handler, confirmWord }, index) => (
                            <li key={index}>
                                <span>{label}</span>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleConfirmAction(label, confirmWord, handler)}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                    <p className="warning-text">⚠ This action cannot be undone.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
