import API from './api';

const register = async (name, email, password, role) => {
  const response = await API.post(`/auth/register`, { name, email, password, role });
  return response.data;
};

const signup = async (name, email, password) => {
  const response = await API.post('/auth/signup', { name, email, password });
  return response.data;
};

const login = async (email, password) => {
  const response = await API.post(`/auth/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

const fetchProfile = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (err) {
    return null;
  }
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.user.role === 'admin';
};

const isStudent = () => {
  const user = getCurrentUser();
  return user && user.user.role === 'student';
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAdmin,
  isStudent,
  fetchProfile,
  signup,
};

export default authService;