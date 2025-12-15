import { useState } from 'react';
import attendanceService from '../../services/attendanceService';
import usersService from '../../services/usersService';

const AttendancePanel = () => {
  const [userId, setUserId] = useState('');
  const [records, setRecords] = useState([]);

  const markForUser = async () => {
    if (!userId) return alert('Enter user id or student id');
    try {
      // If looks like studentId (starts with S), pass as studentId
      if (String(userId).toUpperCase().startsWith('S')) {
        await attendanceService.markAttendance({ studentId: userId, status: 'present' });
      } else {
        await attendanceService.markAttendance({ userId, status: 'present' });
      }
      alert('Marked present');
    } catch (err) { console.error(err); alert(err?.response?.data?.message || 'Failed to mark'); }
  };

  const fetchUserRecords = async () => {
    if (!userId) return alert('Enter user id or student id');
    try {
      if (String(userId).toUpperCase().startsWith('S')) {
        // Lookup user by studentId then fetch using usersService (uses API axios and auth header)
        const users = await usersService.listUsers('student');
        const u = users.find((x) => x.studentId === userId);
        if (!u) return alert('Student not found');
        const res = await attendanceService.getUserAttendance(u._id);
        setRecords(res || []);
      } else {
        const res = await attendanceService.getUserAttendance(userId);
        setRecords(res || []);
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to load attendance records');
    }
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
