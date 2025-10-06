'use client';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
// import './calendarOverride.css'; // Custom CSS override

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  return (
    <div className="bg-white p-4 rounded-md text-gray-900">
      <Calendar onChange={onChange} value={value} />
    </div>
  );
};

export default EventCalendar;
