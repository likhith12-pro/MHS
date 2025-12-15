import API from './api';

const listItems = async () => {
  const res = await API.get('/lost');
  return res.data;
};

const createItem = async (payload) => {
  const res = await API.post('/lost', payload);
  return res.data;
};

const markFound = async (id) => {
  const res = await API.post(`/lost/${id}/found`);
  return res.data;
};

const claimItem = async (id) => {
  const res = await API.post(`/lost/${id}/claim`);
  return res.data;
};

const lostfoundService = {
  listItems,
  createItem,
  markFound,
  claimItem,
};

export default lostfoundService;
