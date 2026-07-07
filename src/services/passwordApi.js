import api from './api';

export const changePassword = async ({ oldPassword, newPassword }) => {
  const { data } = await api.put('/auth/change-password', { oldPassword, newPassword });
  return data;
};
