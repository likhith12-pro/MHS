import API from './api';

const scheduleVisit = async (payload) => {
  const res = await API.post('/doctor/schedule', payload);
  return res.data;
};

const listVisits = async () => {
  const res = await API.get('/doctor');
  return res.data;
};

const myVisits = async () => {
  const res = await API.get('/doctor/me');
  return res.data;
};

const updateStatus = async (id, status) => {
  const res = await API.post(`/doctor/${id}/status`, { status });
  return res.data;
};

export default {
  scheduleVisit,
  listVisits,
  myVisits,
  updateStatus,
};
