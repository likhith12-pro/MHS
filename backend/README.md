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
