const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Mark attendance - admin can specify userId, students mark own attendance
router.post('/mark', authenticate, async (req, res) => {
  try {
    let { userId, studentId, date, status } = req.body;
    if (req.user.role === 'student') {
      // students can only mark their own record
      userId = req.user._id;
    }
    // allow admins to pass studentId instead of userId
    if (!userId && studentId) {
      const u = await User.findOne({ studentId });
      if (!u) return res.status(404).json({ message: 'Student not found' });
      userId = u._id;
    }
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const record = new Attendance({ user: userId, date: date || Date.now(), status, recordedBy: req.user._id });
    await record.save();
    res.json(record);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Student can view own attendance
router.get('/me', authenticate, authorizeRoles('student'), async (req, res) => {
  const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
  res.json(records);
});

// Admin view for any student
router.get('/user/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  const records = await Attendance.find({ user: req.params.userId }).sort({ date: -1 });
  res.json(records);
});

module.exports = router;
