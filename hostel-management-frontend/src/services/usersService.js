import API from './api';

const listUsers = async (role) => {
  const params = {};
  if (role) params.role = role;
  const response = await API.get('/users', { params });
  return response.data;
};

const deleteUser = async (id) => {
  const res = await API.delete(`/users/${id}`);
  return res.data;
};

const generateStudentId = async (id) => {
  const res = await API.post(`/users/${id}/generate-student-id`);
  return res.data;
};

const usersService = {
  listUsers,
  deleteUser,
  generateStudentId,
};

export default usersService;
