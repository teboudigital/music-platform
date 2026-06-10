import client from './client';

export const getSetlists = () => client.get('/setlists/');
export const getSetlist = (id) => client.get(`/setlists/${id}/`);
export const createSetlist = (data) => client.post('/setlists/', data);
export const updateSetlist = (id, data) => client.patch(`/setlists/${id}/`, data);
export const deleteSetlist = (id) => client.delete(`/setlists/${id}/`);

export const getSetlistItems = (setlistId) => client.get(`/setlists/${setlistId}/items/`);
export const addItemToSetlist = (setlistId, data) =>
  client.post(`/setlists/${setlistId}/items/`, data);
export const removeItemFromSetlist = (setlistId, itemId) =>
  client.delete(`/setlists/${setlistId}/items/${itemId}/`);
