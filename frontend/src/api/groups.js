import client from './client';

export const getGroups = () => client.get('/groups/');
export const getGroup = (id) => client.get(`/groups/${id}/`);
export const createGroup = (data) => client.post('/groups/', data);
export const updateGroup = (id, data) => client.patch(`/groups/${id}/`, data);
export const deleteGroup = (id) => client.delete(`/groups/${id}/`);
export const regenerateInviteLink = (id) => client.post(`/groups/${id}/regenerate-invite/`);
export const joinGroupPreview = (token) => client.get(`/groups/join/${token}/`);
export const joinGroup = (token) => client.post(`/groups/join/${token}/`);
export const setMemberRole = (id, userId, role) => client.patch(`/groups/${id}/set-role/`, { user_id: userId, role });
export const leaveGroup = (id) => client.delete(`/groups/${id}/leave/`);
export const removeMember = (id, userId) => client.delete(`/groups/${id}/remove-member/${userId}/`);
