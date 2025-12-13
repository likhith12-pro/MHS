import React, { useEffect, useState } from 'react';
import roomsService from '../../services/roomsService';

const RoomsPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ number: '', capacity: 1, description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomsService.listRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
      alert('Could not load rooms');
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await roomsService.createRoom(form);
      setRooms(prev => [created, ...prev]);
      setForm({ number: '', capacity: 1, description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create room');
    }
  };

  const handleAssign = async (roomId) => {
    const studentId = prompt('Enter student id to assign to this room:');
    if (!studentId) return;
    try {
      await roomsService.assignRoomByBody(roomId, studentId);
      fetchRooms();
    } catch (err) { console.error(err); alert('Assign failed'); }
  };

  const handleRemove = async (roomId) => {
    const userId = prompt('Enter user id to remove from this room:');
    if (!userId) return;
    try {
      await roomsService.removeOccupant(roomId, userId);
      fetchRooms();
    } catch (err) { console.error(err); alert('Remove failed'); }
  };

  return (
    <div className="panel">
      <h3>Rooms</h3>
      <form onSubmit={handleCreate} className="panel-form">
        <input placeholder="Number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} required />
        <input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Add Room</button>
      </form>

      {loading ? <div>Loading...</div> : (
        <div className="panel-list">
          {rooms.map(r => (
            <div key={r._id} className="card">
              <strong>#{r.number}</strong>
              <div>Capacity: {r.capacity}</div>
              <div>Occupants: {r.occupants?.length || 0}</div>
              <div>{r.description}</div>
              <div className="card-actions">
                <button onClick={() => handleAssign(r._id)}>Assign</button>
                <button onClick={() => handleRemove(r._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPanel;
