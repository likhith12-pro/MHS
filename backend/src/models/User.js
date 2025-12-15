const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  studentId: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  createdAt: { type: Date, default: Date.now }
});

// Generate a unique studentId for student users
userSchema.pre('save', async function (next) {
  if (this.role === 'student' && !this.studentId) {
    const User = mongoose.model('User');
    let id;
    let exists = true;
    // Try a few times to avoid collisions
    for (let i = 0; i < 10 && exists; i++) {
      id = 'S' + Math.floor(100000 + Math.random() * 900000); // S + 6 digits
      // Check uniqueness
      exists = await User.findOne({ studentId: id });
    }
    // As a fallback use timestamp-based id
    if (exists) id = 'S' + Date.now().toString().slice(-8);
    this.studentId = id;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
