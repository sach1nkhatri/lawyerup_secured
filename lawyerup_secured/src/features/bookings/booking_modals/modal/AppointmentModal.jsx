import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AppointmentModal.css';
import { startLoader, stopLoader } from '../../../../app/shared_components/utils/loader';
import { notify } from '../../../../app/shared_components/utils/notify';
import API from '../../../../app/api/api_endpoints';

const AppointmentModal = ({ lawyer, onClose }) => {
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(1);
    const [appointmentType, setAppointmentType] = useState('online');
    const [description, setDescription] = useState('');

    const user = JSON.parse(localStorage.getItem('lawyerup_user'));

    useEffect(() => {
        const validDates = [];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);

            const weekday = date.toLocaleDateString('en-US', {
                weekday: 'long',
                timeZone: 'Asia/Kathmandu',
            });

            const formatted = getNepalDateString(date);
            if (lawyer.schedule[weekday]?.length > 0) {
                validDates.push(formatted);
            }
        }

        setAvailableDates(validDates);
        if (validDates.length > 0) {
            setSelectedDate(validDates[0]);
        }
    }, [lawyer.schedule]);

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!selectedDate || !duration || !lawyer._id) return;

            try {
                const res = await axios.get(`${API.BOOKINGS}/slots`, {
                    params: {
                        lawyerId: lawyer._id,
                        date: selectedDate,
                        duration,
                    },
                });

                const slots = res.data || [];
                setTimeSlots(slots);

                const firstAvailable = slots.find(
                    (slot) => typeof slot === 'string' || slot.available === true
                );
                setSelectedTime(
                    typeof firstAvailable === 'string'
                        ? firstAvailable
                        : firstAvailable?.time || ''
                );
            } catch (err) {
                console.error('Failed to load available slots:', err);
                setTimeSlots([]);
                setSelectedTime('');
            }
        };

        fetchAvailableSlots();
    }, [selectedDate, duration, lawyer._id]);

    const handleConfirm = async () => {
        const clientId = user?._id;
        const lawyerUserId = lawyer.user?._id || lawyer.user;
        const lawyerListId = lawyer._id;

        if (!clientId || !lawyerUserId || !lawyerListId || !selectedDate || !selectedTime) {
            notify('warn', '⚠️ Please fill in all required fields.');
            return;
        }

        const bookingData = {
            user: clientId,
            lawyer: lawyerUserId,
            lawyerList: lawyerListId,
            date: selectedDate,
            time: selectedTime,
            duration,
            mode: appointmentType,
            description,
            status: 'pending',
            reviewed: false,
        };

        try {
            startLoader();
            await axios.post(`${API.BOOKINGS}`, bookingData);
            notify('success', 'Appointment booked successfully!');
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Unknown error occurred.';
            notify('error', `Booking failed: ${msg}`);
            console.error('[Booking failed]', err);
        } finally {
            stopLoader();
        }
    };

    function getNepalDateString(date = new Date()) {
        const options = {
            timeZone: 'Asia/Kathmandu',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);

        const year = parts.find((p) => p.type === 'year').value;
        const month = parts.find((p) => p.type === 'month').value;
        const day = parts.find((p) => p.type === 'day').value;

        return `${year}-${month}-${day}`;
    }

    return (
        <div className="appointment-overlay">
            <div className="glass appointment-modal">
                <button className="close-btn" onClick={onClose}>×</button>
                <h2 style={{ textAlign: 'center' }}>Book Appointment</h2>

                <label>Select Date</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                    {availableDates.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                    ))}
                </select>

                <label>Available Time Slots</label>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                    {timeSlots.map((slot, i) => {
                        const [hour, minute] = slot.split(':');
                        const h = parseInt(hour);
                        const ampm = h >= 12 ? 'PM' : 'AM';
                        const hour12 = h % 12 === 0 ? 12 : h % 12;
                        const formatted = `${hour12}:${minute} ${ampm}`;
                        return (
                            <option key={i} value={slot}>{formatted}</option>
                        );
                    })}
                </select>

                <label>Duration (hrs)</label>
                <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                />

                <label>Appointment Type</label>
                <div className="appt-type-toggle">
                    <button
                        className={appointmentType === 'online' ? 'active' : ''}
                        onClick={() => setAppointmentType('online')}
                    >Online</button>
                    <button
                        className={appointmentType === 'live' ? 'active' : ''}
                        onClick={() => setAppointmentType('live')}
                    >Live</button>
                </div>

                <label>Description</label>
                <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is the appointment for?"
                    style={{ width: '100%', borderRadius: '10px', padding: '0.5rem' }}
                />

                <div className="confirm-section">
                    <button className="confirm-btn" onClick={handleConfirm}>
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
