import React from 'react';
import RoomsPanel from '../components/admin/RoomsPanel';
import LostFoundPanel from '../components/admin/LostFoundPanel';
import AttendancePanel from '../components/admin/AttendancePanel';
import LibraryPanel from '../components/admin/LibraryPanel';
import DoctorPanel from '../components/admin/DoctorPanel';
import '../styles/admin.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage rooms, lost &amp; found, attendance, library and doctor visits.</p>
      </header>

      <div className="admin-grid">
        <RoomsPanel />
        <LostFoundPanel />
        <AttendancePanel />
        <LibraryPanel />
        <DoctorPanel />
      </div>
    </div>
  );
};

export default AdminDashboard;