const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Ensure JWT secret is configured
if (!process.env.JWT_SECRET) {
	console.error('Missing JWT_SECRET environment variable. Set JWT_SECRET in your .env file (copy .env.example to .env).');
	process.exit(1);
}

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_management');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/lost', require('./routes/lostItems'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/library', require('./routes/library'));
app.use('/api/doctor', require('./routes/doctor'));

app.get('/', (req, res) => res.send('Hostel management API running'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
