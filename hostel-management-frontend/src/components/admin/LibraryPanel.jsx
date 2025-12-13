import React, { useEffect, useState } from 'react';
import libraryService from '../../services/libraryService';

const LibraryPanel = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', copies: 1 });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => { try { const res = await libraryService.listBooks(); setBooks(res); } catch(err) { console.error(err); } };

  const addBook = async (e) => { e.preventDefault(); try { await libraryService.addBook(form); setForm({ title: '', author: '', isbn: '', copies: 1 }); fetchBooks(); } catch (err) { console.error(err); alert('Add failed'); } };

  return (
    <div className="panel">
      <h3>Library</h3>
      <form onSubmit={addBook} className="panel-form">
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        <input placeholder="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
        <input type="number" min={1} value={form.copies} onChange={e => setForm({ ...form, copies: Number(e.target.value) })} />
        <button type="submit">Add Book</button>
      </form>

      <div className="panel-list">
        {books.map(b => (
          <div key={b._id} className="card">
            <strong>{b.title}</strong>
            <div>Author: {b.author}</div>
            <div>Available: {b.available}/{b.copies}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPanel;
