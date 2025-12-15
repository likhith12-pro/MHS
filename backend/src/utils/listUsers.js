const connectDB = require('../config/db');
const User = require('../models/User');

const list = async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_management');
  const users = await User.find().select('-password').lean();
  console.log('Users:', users);
  process.exit(0);
};

list();
