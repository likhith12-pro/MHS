import API from './api';

const addBook = async (payload) => {
  const res = await API.post('/library', payload);
  return res.data;
};

const listBooks = async () => {
  const res = await API.get('/library');
  return res.data;
};

const borrowBook = async (id) => {
  const res = await API.post(`/library/${id}/borrow`);
  return res.data;
};

const returnBook = async (id) => {
  const res = await API.post(`/library/${id}/return`);
  return res.data;
};

const libraryService = {
  addBook,
  listBooks,
  borrowBook,
  returnBook,
};

export default libraryService;
