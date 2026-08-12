import api from './api';

/**
 * Fetch current user profile
 */
export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

/**
 * Update current user profile
 */
export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

/**
 * Upload profile picture avatar
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Remove profile picture avatar
 */
export const deleteAvatar = async () => {
  const response = await api.delete('/profile/avatar');
  return response.data;
};
