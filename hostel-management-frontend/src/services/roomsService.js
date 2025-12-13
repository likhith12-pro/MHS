import API from './api';

const listRooms = async () => {
  const res = await API.get('/rooms');
  return res.data;
};

const listAvailable = async () => {
  const res = await API.get('/rooms/available');
  return res.data;
};

const createRoom = async (room) => {
  const res = await API.post('/rooms', room);
  return res.data;
};

const assignRoom = async (roomId, userId) => {
  const res = await API.post(`/rooms/${roomId}/assign/${userId}`);
  return res.data;
};

const assignRoomByBody = async (roomId, studentId) => {
  const res = await API.put(`/rooms/${roomId}/assign`, { studentId });
  return res.data;
};

const removeOccupant = async (roomId, userId) => {
  const res = await API.post(`/rooms/${roomId}/remove/${userId}`);
  return res.data;
};

export default {
  listRooms,
  listAvailable,
  createRoom,
  assignRoom,
  assignRoomByBody,
  removeOccupant,
};
