import API from './api';

const markAttendance = async (body) => {
  const res = await API.post('/attendance/mark', body);
  return res.data;
};

const getMyAttendance = async () => {
  const res = await API.get('/attendance/me');
  return res.data;
};

const getUserAttendance = async (userId) => {
  const res = await API.get(`/attendance/user/${userId}`);
  return res.data;
};

export default {
  markAttendance,
  getMyAttendance,
  getUserAttendance,
};
