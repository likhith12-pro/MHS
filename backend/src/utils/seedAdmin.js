const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seed = async () => {
	try {
		await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_management');
		const existing = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL || 'admin@hostel.com' });
		if (existing) {
			console.log('Admin user already exists');
			process.exit(0);
		}
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'password123', salt);
		const admin = new User({ name: 'Admin', email: process.env.SEED_ADMIN_EMAIL || 'admin@hostel.com', password: hashed, role: 'admin' });
		await admin.save();
		console.log('Admin user created', admin.email);
		process.exit(0);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

seed();


