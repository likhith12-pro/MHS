const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public signup (student)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, role: 'student' });
    await user.save();
    res.status(201).json({ message: 'User registered', user: { id: user._id, name, email, role: user.role, studentId: user.studentId } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register (Admin creates a student or admin can create users)
router.post('/register', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ message: 'User created', user: { id: user._id, name, email, role, studentId: user.studentId } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Self profile
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
