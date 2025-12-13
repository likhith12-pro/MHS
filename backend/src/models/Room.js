const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 1 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  description: { type: String }
});

roomSchema.virtual('isEmpty').get(function () {
  return this.occupants.length === 0;
});

module.exports = mongoose.model('Room', roomSchema);
