import api from './api';

export const getComments = async (taskId) => {
  const { data } = await api.get(`/comments/${taskId}`);
  return data;
};

export const addComment = async ({ taskId, comment }) => {
  const { data } = await api.post(`/comments/${taskId}`, { comment });
  return data;
};

export const deleteComment = async (commentId) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};
