import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import doctorService from '../services/doctorService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [form, setForm] = useState({ doctorName: '', time: '', reason: '' });

  useEffect(() => {
    if (user) fetchMyVisits();
  }, [user]);

  const fetchMyVisits = async () => {
    try {
      const res = await doctorService.myVisits();
      setVisits(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await doctorService.scheduleVisit({ ...form, student: user.id });
      setForm({ doctorName: '', time: '', reason: '' });
      fetchMyVisits();
      alert('Visit scheduled successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to schedule visit');
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="welcome-card">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your doctor visits and hostel activities with ease.</p>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-icon">👨‍⚕️</span>
              <span className="stat-number">{visits.length}</span>
              <span className="stat-label">Visits</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section schedule-section">
          <div className="section-header">
            <h2>Schedule Doctor Visit</h2>
            <span className="section-icon">📅</span>
          </div>
          <form onSubmit={handleSubmit} className="schedule-form">
            <div className="form-row">
              <div className="form-group">
                <label>Doctor Name</label>
                <input type="text" name="doctorName" value={form.doctorName} onChange={handleInputChange} placeholder="Enter doctor's name" required />
              </div>
              <div className="form-group">
                <label>Appointment Time</label>
                <input type="datetime-local" name="time" value={form.time} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Reason for Visit</label>
              <textarea name="reason" value={form.reason} onChange={handleInputChange} placeholder="Describe your symptoms or reason" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Schedule Visit</button>
          </form>
        </div>

        <div className="dashboard-section visits-section">
          <div className="section-header">
            <h2>My Doctor Visits</h2>
            <span className="section-icon">📋</span>
          </div>
          <div className="visits-list">
            {visits.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🩺</span>
                <p>No visits scheduled yet.</p>
                <small>Schedule your first doctor visit above.</small>
              </div>
            ) : (
              visits.map(v => (
                <div key={v._id} className="visit-card">
                  <div className="visit-header">
                    <span className="visit-icon">👨‍⚕️</span>
                    <span className={`visit-status status-${v.status.toLowerCase()}`}>{v.status}</span>
                  </div>
                  <div className="visit-details">
                    <h3>{v.doctorName}</h3>
                    <p className="visit-time">📅 {new Date(v.time).toLocaleString()}</p>
                    <p className="visit-reason">💬 {v.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
