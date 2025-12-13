import React, { useEffect, useState } from 'react';
import lostfoundService from '../../services/lostfoundService';

const LostFoundPanel = () => {
  const [items, setItems] = useState([]);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try { const res = await lostfoundService.listItems(); setItems(res); } catch (err) { console.error(err); }
  };

  const createItem = async () => {
    const title = prompt('Title'); if (!title) return;
    const description = prompt('Description') || '';
    const location = prompt('Location') || '';
    try { await lostfoundService.createItem({ title, description, location }); fetchItems(); } catch (err) { console.error(err); alert('Failed to create item'); }
  };

  const markFound = async (id) => { try { await lostfoundService.markFound(id); fetchItems(); } catch(err) { console.error(err); alert('Failed'); } };
  const claimItem = async (id) => { try { await lostfoundService.claimItem(id); fetchItems(); } catch(err) { console.error(err); alert('Failed'); } };

  return (
    <div className="panel">
      <h3>Lost & Found</h3>
      <div className="panel-actions"><button onClick={createItem}>Create Item</button></div>
      <div className="panel-list">
        {items.map(it => (
          <div key={it._id} className="card">
            <strong>{it.title}</strong>
            <div>Location: {it.location}</div>
            <div>Status: {it.status}</div>
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
