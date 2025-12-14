import AttendancePanel from '../components/admin/AttendancePanel';
import DoctorPanel from '../components/admin/DoctorPanel';
import LibraryPanel from '../components/admin/LibraryPanel';
import LostFoundPanel from '../components/admin/LostFoundPanel';
import RoomsPanel from '../components/admin/RoomsPanel';
import '../styles/admin.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Admin Control Center</h1>
            <p>Comprehensive management of all hostel operations and student services.</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-icon">🏠</span>
              <div className="stat-info">
                <span className="stat-number">50</span>
                <span className="stat-label">Rooms</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div className="stat-info">
                <span className="stat-number">200</span>
                <span className="stat-label">Students</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <div className="stat-info">
                <span className="stat-number">500</span>
                <span className="stat-label">Books</span>
              </div>
            </div>
          </div>
        </div>
        <div className="header-decoration">
          <div className="decoration-line"></div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="panel-wrapper">
          <RoomsPanel />
        </div>
        <div className="panel-wrapper">
          <LostFoundPanel />
        </div>
        <div className="panel-wrapper">
          <AttendancePanel />
        </div>
        <div className="panel-wrapper">
          <LibraryPanel />
        </div>
        <div className="panel-wrapper">
          <DoctorPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
