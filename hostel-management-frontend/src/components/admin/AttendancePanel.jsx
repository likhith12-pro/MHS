import React, { useState } from 'react';
import attendanceService from '../../services/attendanceService';

const AttendancePanel = () => {
  const [userId, setUserId] = useState('');
  const [records, setRecords] = useState([]);

  const markForUser = async () => {
    if (!userId) return alert('Enter user id');
    try {
      await attendanceService.markAttendance({ userId, status: 'present' });
      alert('Marked present');
    } catch (err) { console.error(err); alert('Failed to mark'); }
  };

  const fetchUserRecords = async () => {
    if (!userId) return alert('Enter user id');
    try { const res = await attendanceService.getUserAttendance(userId); setRecords(res); } catch (err) { console.error(err); alert('Failed to load'); }
  };

  return (
    <div className="panel">
      <h3>Attendance</h3>
      <div className="panel-form">
        <input placeholder="Student User ID" value={userId} onChange={e => setUserId(e.target.value)} />
        <button onClick={markForUser}>Mark Present</button>
        <button onClick={fetchUserRecords}>Load Records</button>
      </div>
      <div className="panel-list">
        {records.map(r => (
          <div key={r._id} className="card">
            <div>{new Date(r.date).toLocaleString()}</div>
            <div>Status: {r.status}</div>
            <div>Recorded by: {r.recordedBy?.name || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendancePanel;
