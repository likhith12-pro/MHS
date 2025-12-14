import { useState } from 'react';
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
      <form onSubmit={(e) => { e.preventDefault(); markForUser(); }} className="panel-form">
        <div className="form-row">
          <input placeholder="Student User ID" value={userId} onChange={e => setUserId(e.target.value)} required />
          <button type="submit">Mark Present</button>
        </div>
        <button type="button" onClick={fetchUserRecords}>Load Records</button>
      </form>
      <div className="panel-list">
        {records.map(r => (
          <div key={r._id} className="card">
            <strong>{new Date(r.date).toLocaleString()}</strong>
            <div>Status: <span style={{ color: r.status === 'present' ? '#28a745' : '#dc3545' }}>{r.status}</span></div>
            <div>Recorded by: {r.recordedBy?.name || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendancePanel;
