import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import usersService from '../../services/usersService';

const StudentPanel = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const all = await usersService.listUsers('student');
      setStudents(all || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await authService.register(name, email, password, 'student');
      setSuccess('Student created');
      setName(''); setEmail(''); setPassword('');
      await fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await usersService.deleteUser(id);
      setStudents((s) => s.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError('Delete failed');
    }
  };

  return (
    <div className="panel">
      <h3>Students</h3>
      <form className="panel-form" onSubmit={handleCreate}>
        {error && <div className="error-message">{error}</div>}
        {success && <div style={{ background: '#e6ffea', color: '#155724', padding: '8px 12px', borderRadius: 8 }}>{success}</div>}
        <div className="form-row">
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="form-row">
          <input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Student'}</button>
      </form>

      <div className="panel-list">
        {students.length === 0 && <div className="empty-state">No students found</div>}
        {students.map((s) => (
          <div className="card" key={s._id}>
              {editingId === s._id ? (
                <div>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
              ) : (
                <>
                  <strong>{s.name} {s.studentId ? `(${s.studentId})` : ''}</strong>
                  <div>{s.email}</div>
                  <div>Role: {s.role}</div>
                </>
              )}
            <div className="card-actions">
                {!s.studentId && <button onClick={async () => {
                  try {
                    const res = await usersService.generateStudentId(s._id);
                    alert(res.studentId ? `Generated: ${res.studentId}` : res.message);
                    await fetchStudents();
                  } catch (err) { console.error(err); alert('Failed to generate'); }
                }} style={{ background: '#007bff' }}>Generate Student ID</button>}
                {editingId === s._id ? (
                  <>
                    <button onClick={async () => {
                      try {
                        await usersService.updateUser(s._id, { name: editName, email: editEmail });
                        setEditingId(null);
                        await fetchStudents();
                      } catch (err) {
                        console.error(err);
                        setError(err?.response?.data?.message || 'Update failed');
                      }
                    }} style={{ background: '#28a745' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: '#6c757d' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(s._id); setEditName(s.name); setEditEmail(s.email); }} style={{ background: '#17a2b8' }}>Edit</button>
                    <button onClick={() => handleDelete(s._id)} style={{ background: '#dc3545' }}>Delete</button>
                  </>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPanel;
