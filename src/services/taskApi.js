import api from './api';

export const getTasks = async (params) => {
  const { data } = await api.get('/tasks', { params });
  return data; // { tasks, page, pages, total }
};

export const getTaskById = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get('/tasks/dashboard');
  return data;
};

export const createTask = async (taskData) => {
  const { data } = await api.post('/tasks', taskData);
  return data;
};

export const updateTask = async ({ id, ...taskData }) => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
