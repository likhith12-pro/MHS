const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// GET /api/users?role=student - list users (admin only)
router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('name email role studentId createdAt');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a user by id (admin only)
router.delete('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.deleteOne({ _id: id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user (admin only) - allow updating name, email, role, room
router.put('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, room } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If email is changing, ensure it's not already taken
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof room !== 'undefined') user.room = room || null;

    await user.save();
    res.json({ message: 'User updated', user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// Generate or assign a studentId for a user (admin only)
router.post('/:id/generate-student-id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'student') return res.status(400).json({ message: 'Only students can have studentId' });
    // if studentId already exists, return it
    if (user.studentId) return res.json({ message: 'Already has studentId', studentId: user.studentId });
    // trigger pre-save hook to generate studentId
    user.studentId = undefined; // ensure hook runs
    await user.save();
    return res.json({ message: 'StudentId generated', studentId: user.studentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
