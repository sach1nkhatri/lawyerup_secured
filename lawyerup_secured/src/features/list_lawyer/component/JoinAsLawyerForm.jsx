import React from 'react';
import { useJoinAsLawyerForm } from '../hooks/useJoinAsLawyerForm';
import LawyerScheduleBuilder from './LawyerScheduleBuilder';
import '../css/JoinAsLawyerForm.css';

const JoinAsLawyerForm = ({ onSubmitted }) => {
  const {
    loading,
    lawyer,
    step,
    form,
    schedule,
    isJunior,
    educationList,
    workList,
    setIsJunior,
    setStep,
    setSchedule,
    handleChange,
    handleFileChange,
    addEducation,
    addWork,
    handleNext,
    handleSubmit
  } = useJoinAsLawyerForm(onSubmitted);

  if (loading) return <p style={{ padding: '2rem' }}>Loading…</p>;
  if (lawyer) return null;

  return (
      <div className="join-lawyer-container">
        <h2 className="form-title">Join as a {isJunior ? 'Junior' : 'Senior'} Lawyer</h2>
        <p className="form-subtitle">
          {step === 1 ? 'Your Application will be reviewed by the admin' : 'Complete your profile'}
        </p>
        <p style={{ textAlign: 'right' }}>
        <span
            onClick={() => setIsJunior(!isJunior)}
            style={{ cursor: 'pointer', color: '#4f46e5', textDecoration: 'underline' }}
        >
          {isJunior ? 'Switch to Senior Lawyer Form' : 'Join as Junior Lawyer'}
        </span>
        </p>

        <form className="lawyer-form" onSubmit={handleSubmit}>
          {step === 1 && (
              <>
                <div className="form-grid">
                  <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
                  {!isJunior && (
                      <input
                          name="specialization"
                          placeholder="Specialization"
                          value={form.specialization}
                          onChange={handleChange}
                      />
                  )}
                  <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                  <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                  <input name="state" placeholder="State" value={form.state} onChange={handleChange} />
                  <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
                  <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                  <div className="file-input">
                    <label>{isJunior ? 'Upload Progress Report (PDF)' : 'Upload License Document'}</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileChange(e, 'licenseFile')}
                    />
                  </div>
                  <div className="file-input">
                    <label>Upload Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                  </div>
                </div>
                <div className="schedule-builder">
                  <LawyerScheduleBuilder onScheduleChange={setSchedule} />
                </div>
                <button type="button" className="submit-btn" onClick={handleNext}>
                  Next
                </button>
              </>
          )}

          {step === 2 && (
              <>
                {isJunior && (
                    <input
                        name="expectedGraduation"
                        placeholder="Expected Graduation Year"
                        value={form.expectedGraduation}
                        onChange={handleChange}
                    />
                )}
                <div>
              <textarea
                  name="description"
                  placeholder="Short Description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={200}
              />
                  <small>{form.description.length}/200</small>
                </div>
                <div>
              <textarea
                  name="specialCase"
                  placeholder="Special Case or Interest"
                  value={form.specialCase}
                  onChange={handleChange}
                  maxLength={200}
              />
                  <small>{form.specialCase.length}/200</small>
                </div>
                <input
                    name="socialLink"
                    placeholder="Social Link (optional)"
                    value={form.socialLink}
                    onChange={handleChange}
                />

                {!isJunior && (
                    <>
                      <h3>Work Experience</h3>
                      <div className="form-grid">
                        <input
                            name="workCourt"
                            placeholder="Court"
                            value={form.workCourt}
                            onChange={handleChange}
                        />
                        <input
                            name="workFrom"
                            placeholder="From"
                            value={form.workFrom}
                            onChange={handleChange}
                        />
                        <input
                            name="workTo"
                            placeholder="To"
                            value={form.workTo}
                            onChange={handleChange}
                        />
                        <button type="button" onClick={addWork}>
                          Add
                        </button>
                      </div>
                      <ul>
                        {workList.map((w, i) => (
                            <li key={i}>
                              📁 {w.court} ({w.from}–{w.to})
                            </li>
                        ))}
                      </ul>
                    </>
                )}

                <h3>Your Academic Details</h3>
                <div className="form-grid">
                  <input
                      name="eduDegree"
                      placeholder="Degree"
                      value={form.eduDegree}
                      onChange={handleChange}
                  />
                  <input
                      name="eduInstitute"
                      placeholder="Institute name"
                      value={form.eduInstitute}
                      onChange={handleChange}
                  />
                  <input
                      name="eduYear"
                      placeholder="Year"
                      value={form.eduYear}
                      onChange={handleChange}
                  />
                  <input
                      name="eduSpecialization"
                      placeholder="Specialization"
                      value={form.eduSpecialization}
                      onChange={handleChange}
                  />
                  <button type="button" onClick={addEducation}>
                    Add
                  </button>
                </div>
                <ul>
                  {educationList.map((e, i) => (
                      <li key={i}>
                        🎓 {e.degree} - {e.institute} ({e.year}) | {e.specialization}
                      </li>
                  ))}
                </ul>

                <button type="submit" className="submit-btn">
                  Join
                </button>
              </>
          )}
        </form>
      </div>
  );
};

export default JoinAsLawyerForm;
