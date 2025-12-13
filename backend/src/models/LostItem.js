const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  foundBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lostBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String },
  status: { type: String, enum: ['lost', 'found', 'claimed'], default: 'lost' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostItem', lostItemSchema);
