const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const formatTime = (minutes) => {
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    return `${h}:${m}`;
  };
  
  exports.generateAvailableSlots = (availability, bookings, duration) => {
    const durationMin = duration * 60;
    const slots = [];
  
    const bookedRanges = bookings.map(b => {
      const start = parseTime(b.time);
      const end = start + b.duration * 60;
      return [start, end];
    });
  
    const overlaps = (start, end) =>
      bookedRanges.some(([bStart, bEnd]) =>
        Math.max(start, bStart) < Math.min(end, bEnd)
      );
  
    availability.forEach(({ start, end }) => {
      let slotStart = parseTime(start);
      const slotEnd = parseTime(end);
  
      while (slotStart + durationMin <= slotEnd) {
        const slotFinish = slotStart + durationMin;
        if (!overlaps(slotStart, slotFinish)) {
          slots.push(formatTime(slotStart));
        }
        slotStart += 30; // Step in 30-min increments
      }
    });
  
    return slots;
  };
  