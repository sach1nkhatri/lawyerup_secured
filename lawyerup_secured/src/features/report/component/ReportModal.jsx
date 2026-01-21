import React from 'react';
import '../css/ReportModal.css';
import { useReportModal } from '../hooks/useReportModal';

const ReportModal = ({ isOpen, onClose }) => {
    const {
        selectedIssue,
        setSelectedIssue,
        customIssue,
        setCustomIssue,
        issueOptions,
        handleSubmit
    } = useReportModal(onClose);

    if (!isOpen) return null;
//plain old div holding my hopes and dreams
    return (
        <div className="report-modal-container">
            <div className="report-overlay">
                <div className="report-modal">
                    <h2>Report an Issue</h2>
                    <p>Select a reason for reporting:</p>
                    <form className="report-form" onSubmit={(e) => e.preventDefault()}>
                        {issueOptions.map((issue, idx) => (
                            <label key={idx} className="report-radio-label">
                                <input
                                    type="radio"
                                    name="issue"
                                    value={issue}
                                    checked={selectedIssue === issue}
                                    onChange={() => setSelectedIssue(issue)}
                                />
                                {issue}
                            </label>
                        ))}

                        {selectedIssue === 'Other' && (
                            <textarea
                                className="report-custom-input"
                                placeholder="Describe your issue..."
                                value={customIssue}
                                onChange={(e) => setCustomIssue(e.target.value)}
                                required
                            />
                        )}

                        <div className="report-actions">
                            <button type="button" onClick={onClose} className="report-cancel-btn">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="report-submit-btn">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
