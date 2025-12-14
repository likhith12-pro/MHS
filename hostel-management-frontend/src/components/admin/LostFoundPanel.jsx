import { useEffect, useState } from 'react';
import lostfoundService from '../../services/lostfoundService';

const LostFoundPanel = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', location: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await lostfoundService.listItems(); setItems(res); } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lostfoundService.createItem(form);
      setForm({ title: '', description: '', location: '' });
      fetchItems();
    } catch (err) { console.error(err); alert('Failed to create item'); }
  };

  const markFound = async (id) => { try { await lostfoundService.markFound(id); fetchItems(); } catch(err) { console.error(err); alert('Failed'); } };
  const claimItem = async (id) => { try { await lostfoundService.claimItem(id); fetchItems(); } catch(err) { console.error(err); alert('Failed'); } };

  return (
    <div className="panel">
      <h3>Lost & Found</h3>
      <form onSubmit={handleSubmit} className="panel-form">
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Report Lost Item</h4>
        <input placeholder="Item Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
        <input placeholder="Location Found" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        <button type="submit">Report Item</button>
      </form>
      <div className="panel-list">
        {items.map(it => (
          <div key={it._id} className="card">
            <strong>{it.title}</strong>
            <div>Location: {it.location}</div>
            <div>Description: {it.description}</div>
            <div>Status: <span style={{ color: it.status === 'claimed' ? '#28a745' : it.status === 'found' ? '#ffc107' : '#6c757d' }}>{it.status}</span></div>
            <div>Found by: {it.foundBy?.name || '-'}</div>
            <div className="card-actions">
              {it.status !== 'found' && <button onClick={() => markFound(it._id)}>Mark Found</button>}
              {it.status !== 'claimed' && <button onClick={() => claimItem(it._id)}>Claim</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LostFoundPanel;
