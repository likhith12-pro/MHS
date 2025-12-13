const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create room (admin)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { number, capacity, description } = req.body;
    const room = new Room({ number, capacity, description });
    await room.save();
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List rooms
router.get('/', authenticate, async (req, res) => {
  const rooms = await Room.find().populate('occupants', 'name email');
  res.json(rooms);
});

// Get available rooms (any authenticated user - shows rooms with capacity left)
router.get('/available', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email');
    const available = rooms.filter(r => r.occupants.length < r.capacity);
    res.json(available);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Assign room to student (admin) - existing route with params
router.post('/:roomId/assign/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });

    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room is full' });

    room.occupants.push(user._id);
    user.room = room._id;

    await room.save();
    await user.save();
    res.json({ message: 'Assigned', room, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Assign room to student (admin) - alternate route that accepts body: { studentId }
router.put('/:id/assign', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const room = await Room.findById(id);
    const user = await User.findById(studentId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });
    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room is full' });
    room.occupants.push(user._id);
    user.room = room._id;
    await room.save();
    await user.save();
    res.json({ message: 'Assigned', room, user });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Remove occupant from room (admin)
router.post('/:roomId/remove/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });

    room.occupants = room.occupants.filter(id => id.toString() !== userId);
    user.room = null;

    await room.save();
    await user.save();
    res.json({ message: 'Removed occupant', room });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
