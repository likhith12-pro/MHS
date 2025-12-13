const express = require('express');
const router = express.Router();
const DoctorVisit = require('../models/DoctorVisit');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Student schedule a visit
router.post('/schedule', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const { doctorName, time, reason } = req.body;
    const visit = new DoctorVisit({ student: req.user._id, doctorName, time, reason });
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Admin view all visits
router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  const visits = await DoctorVisit.find().populate('student', 'name email').sort({ time: -1 });
  res.json(visits);
});

// Student view own visits
router.get('/me', authenticate, authorizeRoles('student'), async (req, res) => {
  const visits = await DoctorVisit.find({ student: req.user._id }).sort({ time: -1 });
  res.json(visits);
});

// Admin update visit status (allow POST and PUT to support both clients)
router.post('/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'completed' or 'cancelled'
    const visit = await DoctorVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Not found' });
    visit.status = status;
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

router.put('/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'completed' or 'cancelled'
    const visit = await DoctorVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Not found' });
    visit.status = status;
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;
