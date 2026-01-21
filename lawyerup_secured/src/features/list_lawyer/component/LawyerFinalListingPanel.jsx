import React from 'react';
import LawyerScheduleBuilder from './LawyerScheduleBuilder';
import defaultAvatar from '../../../app/assets/avatar.png';
import '../css/LawyerFinalListingPanel.css';
import { useFinalListingForm } from '../hooks/useFinalListingForm';

const LawyerFinalListingPanel = ({ lawyer, onReapply, onBack, onHold }) => {
    const {
        form,
        education,
        workExperience,
        editableSchedule,
        profilePhoto,
        setEditableSchedule,
        handleInputChange,
        handleEducationChange,
        handleWorkChange,
        addEducation,
        removeEducation,
        addWork,
        removeWork,
        handleFileChange,
        handleSave,
        handleDelete,
        handleHold
    } = useFinalListingForm(lawyer, { onReapply, onHold });

    return (
        <div className="listing-panel">
            <h2>Your Listing</h2>
            <p>You can update your contact, address, and availability here.</p>

            {onBack && (
                <button className="back-button" onClick={onBack}>
                    ← Back to Status
                </button>
            )}

            <div className="listing-grid">
                <div className="listing-left">
                    <p><b>Full Name</b> <input value={lawyer.fullName} disabled style={{ backgroundColor: '#f3f4f6' }} /></p>
                    <p><b>Email</b> <input value={lawyer.email} disabled style={{ backgroundColor: '#f3f4f6' }} /></p>
                    <p><b>Specialization</b> <input name="specialization" value={form.specialization} onChange={handleInputChange} /></p>
                    <p><b>Phone</b> <input name="phone" value={form.phone} onChange={handleInputChange} /></p>
                    <p><b>State</b> <input name="state" value={form.state} onChange={handleInputChange} /></p>
                    <p><b>City</b> <input name="city" value={form.city} onChange={handleInputChange} /></p>
                    <p><b>Address</b> <input name="address" value={form.address} onChange={handleInputChange} /></p>
                    <p><b>Qualification</b> <input name="qualification" value={form.qualification} onChange={handleInputChange} /></p>

                    <h3>Education</h3>
                    {education.map((edu, idx) => (
                        <div key={idx} className="array-entry">
                            <input placeholder="Degree" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} />
                            <input placeholder="Institute" value={edu.institute} onChange={(e) => handleEducationChange(idx, 'institute', e.target.value)} />
                            <input placeholder="Year" value={edu.year} onChange={(e) => handleEducationChange(idx, 'year', e.target.value)} />
                            <input placeholder="Specialization" value={edu.specialization} onChange={(e) => handleEducationChange(idx, 'specialization', e.target.value)} />
                            <button onClick={() => removeEducation(idx)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={addEducation}>Add Education</button>

                    <h3>Work Experience</h3>
                    {workExperience.map((work, idx) => (
                        <div key={idx} className="array-entry">
                            <input placeholder="Court" value={work.court} onChange={(e) => handleWorkChange(idx, 'court', e.target.value)} />
                            <input placeholder="From" value={work.from} onChange={(e) => handleWorkChange(idx, 'from', e.target.value)} />
                            <input placeholder="To" value={work.to} onChange={(e) => handleWorkChange(idx, 'to', e.target.value)} />
                            <button onClick={() => removeWork(idx)}>Remove</button>
                        </div>
                    ))}
                    <button onClick={addWork}>Add Work</button>

                    <p><b>Social Link</b> <input name="socialLink" value={form.socialLink} onChange={handleInputChange} /></p>
                    <p>
                        <b>Special Case</b><br />
                        <textarea name="specialCase" value={form.specialCase} onChange={handleInputChange} maxLength={200} />
                        <small>{form.specialCase.length}/200</small>
                    </p>

                    <p>
                        <b>Description</b><br />
                        <textarea name="description" value={form.description} onChange={handleInputChange} maxLength={200} />
                        <small>{form.description.length}/200</small>
                    </p>

                    <LawyerScheduleBuilder
                        onScheduleChange={setEditableSchedule}
                        initialSchedule={editableSchedule}
                    />
                </div>

                <div className="listing-right">
                    <img
                        src={
                            profilePhoto?.startsWith('data:image')
                                ? profilePhoto
                                : profilePhoto
                                    ? `${process.env.REACT_APP_SERVER_URL}${profilePhoto}`
                                    : defaultAvatar
                        }
                        alt="profile"
                        onError={(e) => (e.target.src = defaultAvatar)}
                        className="listing-profile-pic"
                    />
                    <input type="file" accept="image/*" onChange={handleFileChange}/>
                    <button onClick={handleHold}>Hold Profile</button>
                </div>
            </div>

            <div className="listing-actions">
                <button className="listing-save-btn" onClick={handleSave}>Save</button>
                <button className="listing-delete-btn" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
};

export default LawyerFinalListingPanel;
