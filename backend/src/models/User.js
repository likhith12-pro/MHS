const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
