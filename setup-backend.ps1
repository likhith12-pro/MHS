<#
PowerShell script to create the backend folder and write the scaffold files for the Hostel Management backend.
Usage:
  .\setup-backend.ps1                   # create backend scaffold under current path
  .\setup-backend.ps1 -InstallDependencies -SeedAdmin  # Also installs npm deps and runs seeding
#>
param(
  [switch]$InstallDependencies,
  [switch]$SeedAdmin,
  [string]$ProjectRoot = (Get-Location).Path
)

$backendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"

function Write-File([string]$path, [string]$content) {
  $dir = Split-Path -Path $path -Parent
  if (!(Test-Path -Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $content | Set-Content -Path $path -Encoding UTF8
  Write-Host "Wrote $path"
}

if (Test-Path -Path $backendPath) {
  Write-Host "Backend path already exists: $backendPath" -ForegroundColor Yellow
  $proceed = Read-Host "Continue and overwrite files in this folder? (y/N)"
  if ($proceed -ne 'y' -and $proceed -ne 'Y') {
    Write-Host "Aborting script." -ForegroundColor Red
    exit 0
  }
}

# Create directories
$dirs = @(
  "$backendPath",
  "$backendPath/src",
  "$backendPath/src/config",
  "$backendPath/src/middleware",
  "$backendPath/src/models",
  "$backendPath/src/routes",
  "$backendPath/src/utils"
)
foreach ($d in $dirs) { if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null; Write-Host "Created dir: $d" } }

# Files to write - using single-quote here-strings to avoid variable expansion

$packageJson = @'
{
  "name": "hostel-management-backend",
  "version": "0.1.0",
  "description": "Hostel management backend API built with Node, Express and MongoDB",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "seed-admin": "node src/utils/seedAdmin.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
'@

$envExample = @'
# Copy to .env and supply values
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hostel_management
JWT_SECRET=your_jwt_secret_here
'@

$indexJs = @'
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

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
'@

$dbJs = @'
const mongoose = require('mongoose');
const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
'@

$authMiddleware = @'
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Invalid token' });
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
  next();
};
'@

$userModel = @'
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
'@

$roomModel = @'
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
'@

$lostItemModel = @'
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
'@

$attendanceModel = @'
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
'@

$bookModel = @'
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  isbn: { type: String },
  copies: { type: Number, default: 1 },
  available: { type: Number, default: 1 }
});

module.exports = mongoose.model('Book', bookSchema);
'@

$doctorModel = @'
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
'@

$authRoute = @'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Public signup (student)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, role: 'student' });
    await user.save();
    res.status(201).json({ message: 'User registered', user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register (Admin creates a student or admin can create users)
router.post('/register', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ message: 'User created', user: { id: user._id, name, email, role } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Self profile
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = router;
'@

$roomsRoute = @'
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Create room (admin)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { number, capacity, description } = req.body;
    const room = new Room({ number, capacity, description });
    await room.save();
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// List rooms
router.get('/', authenticate, async (req, res) => {
  const rooms = await Room.find().populate('occupants', 'name email');
  res.json(rooms);
});

// Get available rooms (any authenticated user - shows rooms with capacity left)
router.get('/available', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email');
    const available = rooms.filter(r => r.occupants.length < r.capacity);
    res.json(available);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Assign room to student (admin) - existing route with params
router.post('/:roomId/assign/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });

    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room is full' });

    room.occupants.push(user._id);
    user.room = room._id;

    await room.save();
    await user.save();
    res.json({ message: 'Assigned', room, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Assign room to student (admin) - alternate route that accepts body: { studentId }
router.put('/:id/assign', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const room = await Room.findById(id);
    const user = await User.findById(studentId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });
    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room is full' });
    room.occupants.push(user._id);
    user.room = room._id;
    await room.save();
    await user.save();
    res.json({ message: 'Assigned', room, user });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Remove occupant from room (admin)
router.post('/:roomId/remove/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);
    if (!room || !user) return res.status(404).json({ message: 'Not found' });

    room.occupants = room.occupants.filter(id => id.toString() !== userId);
    user.room = null;

    await room.save();
    await user.save();
    res.json({ message: 'Removed occupant', room });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
'@

$lostRoute = @'
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

module.exports = router;'
@

$attendanceRoute = @'
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Mark attendance - admin can specify userId, students mark own attendance
router.post('/mark', authenticate, async (req, res) => {
  try {
    let { userId, date, status } = req.body;
    if (req.user.role === 'student') {
      // students can only mark their own record
      userId = req.user._id;
    }
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const record = new Attendance({ user: userId, date: date || Date.now(), status, recordedBy: req.user._id });
    await record.save();
    res.json(record);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Student can view own attendance
router.get('/me', authenticate, authorizeRoles('student'), async (req, res) => {
  const records = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
  res.json(records);
});

// Admin view for any student
router.get('/user/:userId', authenticate, authorizeRoles('admin'), async (req, res) => {
  const records = await Attendance.find({ user: req.params.userId }).sort({ date: -1 });
  res.json(records);
});

module.exports = router;'
@

$libraryRoute = @'
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Add book (admin)
router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;
    const book = new Book({ title, author, isbn, copies, available: copies });
    await book.save();
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// List books
router.get('/', authenticate, async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Borrow a book (student)
router.post('/:id/borrow', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    if (book.available <= 0) return res.status(400).json({ message: 'No available copies' });

    book.available -= 1;
    await book.save();
    // You might want to create a 'BorrowRecord' model for tracking borrow/returns
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Return a book (student)
router.post('/:id/return', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    book.available += 1;
    await book.save();
    res.json(book);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;'
@

$doctorRoute = @'
const express = require('express');
const router = express.Router();
const DoctorVisit = require('../models/DoctorVisit');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Student schedule a visit
router.post('/schedule', authenticate, authorizeRoles('student'), async (req, res) => {
  try {
    const { doctorName, time, reason } = req.body;
    const visit = new DoctorVisit({ student: req.user._id, doctorName, time, reason });
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// Admin view all visits
router.get('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  const visits = await DoctorVisit.find().populate('student', 'name email').sort({ time: -1 });
  res.json(visits);
});

// Student view own visits
router.get('/me', authenticate, authorizeRoles('student'), async (req, res) => {
  const visits = await DoctorVisit.find({ student: req.user._id }).sort({ time: -1 });
  res.json(visits);
});

// Admin update visit status (allow POST and PUT to support both clients)
router.post('/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'completed' or 'cancelled'
    const visit = await DoctorVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Not found' });
    visit.status = status;
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

router.put('/:id/status', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'completed' or 'cancelled'
    const visit = await DoctorVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: 'Not found' });
    visit.status = status;
    await visit.save();
    res.json(visit);
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;'
@

$seedScript = @'
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@hostel.local';
    const password = process.env.SEED_ADMIN_PW || 'password123';
    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin user already exists:', email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash(password, 10);
    admin = new User({ name: 'Admin', email, password: hashed, role: 'admin' });
    await admin.save();
    console.log('Admin created:', email, 'pw:', password);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
'@

$backendReadme = @'
# Hostel Management Backend

This is a minimal backend for the Hostel Management System. It is built using Node.js, Express, and MongoDB (Mongoose). It exposes REST APIs for authentication, room management, lost & found, attendance, library, and doctor visits.

## Quick start

1. Copy `.env.example` to `.env` and update the values (especially `MONGO_URI` and `JWT_SECRET`).

2. Install dependencies:

```powershell
cd backend
npm install
```

3. Seed an admin user (optional but useful):

```powershell
npm run seed-admin
```

4. Start the server in development:

```powershell
npm run dev
```

The server will run on `http://localhost:5000` by default and the API root is `http://localhost:5000/api`.

## Useful endpoints
- POST `/api/auth/signup` - Student public signup
- POST `/api/auth/register` - Admin creates users
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get logged-in user
- Rooms: `/api/rooms` (/api/rooms/available, assign/remove)
- Lost & Found: `/api/lost` (create, mark found, claim)
- Attendance: `/api/attendance` (mark, list)
- Library: `/api/library` (add/list/borrow/return)
- Doctor Visits: `/api/doctor` (schedule, list, update status)

## Notes
- Use `Bearer <token>` header for authenticated endpoints or set the `Authorization` header in your client.
- Add validations as needed and secure file uploads (if added) in production.
'@

# Write files
Write-File -path (Join-Path $backendPath 'package.json') -content $packageJson
Write-File -path (Join-Path $backendPath '.env.example') -content $envExample
Write-File -path (Join-Path $backendPath 'src/index.js') -content $indexJs
Write-File -path (Join-Path $backendPath 'src/config/db.js') -content $dbJs
Write-File -path (Join-Path $backendPath 'src/middleware/auth.js') -content $authMiddleware

Write-File -path (Join-Path $backendPath 'src/models/User.js') -content $userModel
Write-File -path (Join-Path $backendPath 'src/models/Room.js') -content $roomModel
Write-File -path (Join-Path $backendPath 'src/models/LostItem.js') -content $lostItemModel
Write-File -path (Join-Path $backendPath 'src/models/Attendance.js') -content $attendanceModel
Write-File -path (Join-Path $backendPath 'src/models/Book.js') -content $bookModel
Write-File -path (Join-Path $backendPath 'src/models/DoctorVisit.js') -content $doctorModel

Write-File -path (Join-Path $backendPath 'src/routes/auth.js') -content $authRoute
Write-File -path (Join-Path $backendPath 'src/routes/rooms.js') -content $roomsRoute
Write-File -path (Join-Path $backendPath 'src/routes/lostItems.js') -content $lostRoute
Write-File -path (Join-Path $backendPath 'src/routes/attendance.js') -content $attendanceRoute
Write-File -path (Join-Path $backendPath 'src/routes/library.js') -content $libraryRoute
Write-File -path (Join-Path $backendPath 'src/routes/doctor.js') -content $doctorRoute

Write-File -path (Join-Path $backendPath 'src/utils/seedAdmin.js') -content $seedScript
Write-File -path (Join-Path $backendPath 'README.md') -content $backendReadme

# Optionally install dependencies
if ($InstallDependencies) {
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "Installing npm dependencies... This may take a while"
    Push-Location $backendPath
    npm install
    Pop-Location
  } else {
    Write-Host "npm not found in PATH. Skipping installing dependencies." -ForegroundColor Yellow
  }
}

# Optionally seed an admin
if ($SeedAdmin) {
  Push-Location $backendPath
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run seed-admin
  } else {
    Write-Host "npm not found in PATH. Skipping seed-admin." -ForegroundColor Yellow
  }
  Pop-Location
}

Write-Host "Backend scaffold created at: $backendPath" -ForegroundColor Green
Write-Host "Next steps: edit .env in backend with MONGO_URI and JWT_SECRET, then run 'npm run dev' inside the backend folder." -ForegroundColor Cyan

