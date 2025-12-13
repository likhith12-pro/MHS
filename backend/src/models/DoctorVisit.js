const mongoose = require('mongoose');

const doctorVisitSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String },
  time: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorVisit', doctorVisitSchema);
