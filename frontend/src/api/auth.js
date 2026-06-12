import client from './client';

export const createGuest = () =>
  client.post('/auth/guest/');

export const login = (email, password) =>
  client.post('/auth/login/', { email, password });

export const register = (data) =>
  client.post('/auth/register/', data);

export const getMe = () =>
  client.get('/auth/me/');

export const updateMe = (data) =>
  client.patch('/auth/me/', data);

export const getProfile = () =>
  client.get('/auth/me/profile/');

export const updateProfile = (data) =>
  client.patch('/auth/me/profile/', data);

export const logout = (refresh) =>
  client.post('/auth/logout/', { refresh });

export const exportData = () =>
  client.get('/auth/me/export/');

export const forgotPassword = (email) =>
  client.post('/auth/password-reset/', { email });

export const resetPassword = (data) =>
  client.post('/auth/password-reset/confirm/', data);

export const changePassword = (data) =>
  client.post('/auth/me/change-password/', data);

export const changeEmail = (data) =>
  client.post('/auth/me/change-email/', data);

export const deleteAccount = (password) =>
  client.delete('/auth/me/delete/', { data: { password } });
