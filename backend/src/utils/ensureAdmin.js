const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ensureAdmin = async () => {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@hostel.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user exists:', email);
      return existing;
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const admin = new User({ name: 'Admin', email, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Admin user created:', email);
    return admin;
  } catch (err) {
    console.error('Failed to ensure admin user:', err);
    throw err;
  }
};

module.exports = { ensureAdmin };