import React, { useState, useEffect } from 'react';


const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const LawyerScheduleBuilder = ({ onScheduleChange, initialSchedule = {} }) => {
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [schedule, setSchedule] = useState({});

    // ✅ Load initial schedule (used in Edit mode)
    useEffect(() => {
        if (initialSchedule && Object.keys(initialSchedule).length > 0) {
            setSchedule(initialSchedule);
        }
    }, [initialSchedule]);

    const handleAddSlot = () => {
        if (!selectedDay || !startTime || !endTime) return;

        const slot = { start: startTime, end: endTime };

        const updated = {
            ...schedule,
            [selectedDay]: [...(schedule[selectedDay] || []), slot]
        };

        setSchedule(updated);
        onScheduleChange && onScheduleChange(updated);

        setStartTime('');
        setEndTime('');
    };

    const handleRemoveSlot = (day, index) => {
        const updated = { ...schedule };
        updated[day].splice(index, 1);
        if (updated[day].length === 0) delete updated[day];

        setSchedule(updated);
        onScheduleChange && onScheduleChange(updated);
    };

    return (
        <div className="schedule-builder">
            <h3>Select Availability</h3>
            <div className="slot-row">
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                    <option value="">Select Day</option>
                    {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>

                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <span>to</span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

                <button type="button" onClick={handleAddSlot}>Add Slot</button>
            </div>

            <div className="schedule-preview">
                {Object.entries(schedule).map(([day, slots]) => (
                    <div key={day}>
                        <strong>{day}:</strong>
                        <ul>
                            {slots.map((slot, index) => (
                                <li key={index}>
                                    {slot.start} - {slot.end}
                                    <button type="button" onClick={() => handleRemoveSlot(day, index)}>❌</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LawyerScheduleBuilder;
