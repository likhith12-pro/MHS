const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Add book (admin)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;
    const book = new Book({ title, author, isbn, copies, available: copies });
    await book.save();
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// List books
router.get('/', authenticate, async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Borrow a book (student)
router.post('/:id/borrow', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    if (book.available <= 0) return res.status(400).json({ message: 'No available copies' });

    book.available -= 1;
    await book.save();
    // You might want to create a 'BorrowRecord' model for tracking borrow/returns
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Return a book (student)
router.post('/:id/return', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    book.available += 1;
    await book.save();
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;
