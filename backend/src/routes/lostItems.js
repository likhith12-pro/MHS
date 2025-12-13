const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create/update a lost item (any logged in user can create)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const item = new LostItem({ title, description, location, lostBy: req.user._id });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Mark as found (any user)
router.post('/:id/found', authenticate, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    item.status = 'found';
    item.foundBy = req.user._id;
    await item.save();
    res.json(item);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Claim item (lostBy or admin can mark as claimed)
router.post('/:id/claim', authenticate, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.lostBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    item.status = 'claimed';
    await item.save();
    res.json(item);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Public list of items
router.get('/', authenticate, async (req, res) => {
  const items = await LostItem.find().populate('lostBy foundBy', 'name email');
  res.json(items);
});

module.exports = router;
