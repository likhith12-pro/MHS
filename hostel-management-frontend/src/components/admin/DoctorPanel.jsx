import { useEffect, useState } from 'react';
import doctorService from '../../services/doctorService';

const DoctorPanel = () => {
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({ doctorName: '', time: '', reason: '', studentId: '' });

  useEffect(() => { fetchVisits(); }, []);

  const fetchVisits = async () => { try { const res = await doctorService.listVisits(); setVisits(res); } catch (err) { console.error(err); } };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorService.scheduleVisit({ ...form, student: form.studentId });
      setForm({ doctorName: '', time: '', reason: '', studentId: '' });
      fetchVisits();
      alert('Visit scheduled successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to schedule visit');
    }
  };

  const updateStatus = async (id) => {
    const s = prompt('Status (completed/cancelled)');
    if (!s) return;
    try { await doctorService.updateStatus(id, s); fetchVisits(); } catch (err) { console.error(err); alert('Failed'); }
  };

  return (
    <div className="panel">
      <h3>Doctor Visits</h3>
      <form onSubmit={handleSubmit} className="panel-form">
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Schedule New Visit</h4>
        <div className="form-row">
          <input type="text" name="doctorName" value={form.doctorName} onChange={handleInputChange} placeholder="Doctor Name" required />
          <input type="datetime-local" name="time" value={form.time} onChange={handleInputChange} required />
        </div>
        <textarea name="reason" value={form.reason} onChange={handleInputChange} placeholder="Reason for visit" required></textarea>
        <input type="text" name="studentId" value={form.studentId} onChange={handleInputChange} placeholder="Student ID" required />
        <button type="submit">Schedule Visit</button>
      </form>
      <div className="panel-list">
        {visits.map(v => (
          <div key={v._id} className="card">
            <strong>Student: {v.student?.name}</strong>
            <div>Doctor: {v.doctorName}</div>
            <div>Time: {new Date(v.time).toLocaleString()}</div>
            <div>Reason: {v.reason}</div>
            <div>Status: <span style={{ color: v.status === 'completed' ? '#28a745' : v.status === 'cancelled' ? '#dc3545' : '#ffc107' }}>{v.status}</span></div>
            <div className="card-actions">
              <button onClick={() => updateStatus(v._id)}>Update Status</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorPanel;
