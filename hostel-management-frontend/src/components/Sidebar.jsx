import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li>
          <Link to="/admin">Admin Dashboard</Link>
        </li>
        <li>
          <Link to="/student">Student Dashboard</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;