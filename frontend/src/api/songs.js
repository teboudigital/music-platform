import client from './client';

export const getSongs = (params) => client.get('/songs/', { params });
export const getTopics = (params) => client.get('/songs/topics/', { params });
export const getSong = (id) => client.get(`/songs/${id}/`);
export const createSong = (data) => client.post('/songs/', data);
export const updateSong = (id, data) => client.patch(`/songs/${id}/`, data);
export const deleteSong = (id) => client.delete(`/songs/${id}/`);
export const transposeSong = (id, semitones) =>
  client.get(`/songs/${id}/transpose/`, { params: { semitones } });

export const downloadImportTemplate = () =>
  client.get('/songs/import-template/', { responseType: 'blob' });

export const importSongs = (file, groupId) => {
  const form = new FormData();
  form.append('file', file);
  if (groupId) form.append('group', groupId);
  return client.post('/songs/import/', form);
};

export const getLyricLines = (songId) => client.get(`/songs/${songId}/lines/`);
export const createLyricLine = (songId, data) => client.post(`/songs/${songId}/lines/`, data);
export const updateLyricLine = (songId, lineId, data) =>
  client.patch(`/songs/${songId}/lines/${lineId}/`, data);
export const deleteLyricLine = (songId, lineId) =>
  client.delete(`/songs/${songId}/lines/${lineId}/`);

export const createChord = (songId, lineId, data) =>
  client.post(`/songs/${songId}/lines/${lineId}/chords/`, data);
export const deleteChord = (songId, lineId, chordId) =>
  client.delete(`/songs/${songId}/lines/${lineId}/chords/${chordId}/`);
