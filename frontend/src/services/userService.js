import api from './api';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data.data;
};

export const activateAccount = async (token, password) => {
  const response = await api.post('/users/activate-account', { token, password });
  return response.data;
};

export const resendActivationEmail = async (userId) => {
  const response = await api.post('/users/resend-activation', { userId });
  return response.data;
};

export const toggleUserStatus = async (id, is_active) => {
  const response = await api.patch(`/users/${id}/status`, { is_active });
  return response.data;
};

export const getMyFaceIdStatus = async () => {
  const response = await api.get('/users/me/face-id');
  return response.data;
};

export const registerMyFaceId = async (image) => {
  const response = await api.post('/users/me/face-id', { image });
  return response.data;
};

export const verifyMyCurrentFace = async (image) => {
  const response = await api.post('/users/me/face-id/verify-current', { image });
  return response.data;
};

export const updateMyFaceId = async (image, verifyToken) => {
  const response = await api.put('/users/me/face-id', { image, verifyToken });
  return response.data;
};

export const deleteMyFaceId = async (verifyToken) => {
  const response = await api.delete('/users/me/face-id', { data: { verifyToken } });
  return response.data;
};
