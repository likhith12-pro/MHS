import React, { useEffect, useState } from 'react';
import doctorService from '../../services/doctorService';

const DoctorPanel = () => {
  const [visits, setVisits] = useState([]);

  useEffect(() => { fetchVisits(); }, []);

  const fetchVisits = async () => { try { const res = await doctorService.listVisits(); setVisits(res); } catch (err) { console.error(err); } };

  const updateStatus = async (id) => {
    const s = prompt('Status (completed/cancelled)');
    if (!s) return;
    try { await doctorService.updateStatus(id, s); fetchVisits(); } catch (err) { console.error(err); alert('Failed'); }
  };

  return (
    <div className="panel">
      <h3>Doctor Visits</h3>
      <div className="panel-list">
        {visits.map(v => (
          <div key={v._id} className="card">
            <div>Student: {v.student?.name}</div>
            <div>Doctor: {v.doctorName}</div>
            <div>Time: {new Date(v.time).toLocaleString()}</div>
            <div>Status: {v.status}</div>
            <div className="card-actions"><button onClick={() => updateStatus(v._id)}>Update</button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorPanel;
