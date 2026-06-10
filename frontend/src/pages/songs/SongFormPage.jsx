import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createSong, getSong, updateSong } from '../../api/songs';

const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

export default function SongFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ title: '', artist: '', key: '', mode: 'major', bpm: '', time_signature: '4/4', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) getSong(id).then((r) => setForm({ ...r.data, bpm: r.data.bpm ?? '' }));
  }, [id, isEdit]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = { ...form, bpm: form.bpm ? Number(form.bpm) : null };
    try {
      if (isEdit) await updateSong(id, payload);
      else await createSong(payload);
      navigate('/songs');
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>{isEdit ? t('common.edit') : t('songs.newSong')}</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>{t('songs.title')} *
          <input name="title" value={form.title} onChange={change} required />
        </label>
        <label>{t('songs.artist')}
          <input name="artist" value={form.artist} onChange={change} />
        </label>
        <div className="form-row">
          <label>{t('songs.key')}
            <select name="key" value={form.key} onChange={change}>
              <option value="">—</option>
              {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label>{t('songs.mode')}
            <select name="mode" value={form.mode} onChange={change}>
              <option value="major">{t('songs.major')}</option>
              <option value="minor">{t('songs.minor')}</option>
            </select>
          </label>
          <label>{t('songs.bpm')}
            <input name="bpm" type="number" min="20" max="300" value={form.bpm} onChange={change} />
          </label>
        </div>
        <label>Note
          <textarea name="notes" value={form.notes} onChange={change} rows={3} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/songs')}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
