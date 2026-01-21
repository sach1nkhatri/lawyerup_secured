import { useState, useEffect } from 'react';

export const useScheduleBuilder = (initialSchedule = {}, onScheduleChange) => {
    const [selectedDay, setSelectedDay] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [schedule, setSchedule] = useState({});

    useEffect(() => {
        if (initialSchedule && Object.keys(initialSchedule).length > 0) {
            setSchedule(initialSchedule);
        }
    }, [initialSchedule]);

    const handleAddSlot = () => {
        if (!selectedDay || !startTime || !endTime) return;

        const updated = {
            ...schedule,
            [selectedDay]: [...(schedule[selectedDay] || []), { start: startTime, end: endTime }]
        };

        setSchedule(updated);
        onScheduleChange?.(updated);
        setStartTime('');
        setEndTime('');
    };

    const handleRemoveSlot = (day, index) => {
        const updated = { ...schedule };
        updated[day].splice(index, 1);
        if (updated[day].length === 0) delete updated[day];
        setSchedule(updated);
        onScheduleChange?.(updated);
    };

    return {
        schedule,
        selectedDay,
        startTime,
        endTime,
        setSelectedDay,
        setStartTime,
        setEndTime,
        handleAddSlot,
        handleRemoveSlot
    };
};
