import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createSetlist, getSetlist, updateSetlist } from '../../api/setlists';

export default function SetlistFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', event_date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getSetlist(id).then((r) => {
        const { name, description, event_date } = r.data;
        setForm({ name, description: description || '', event_date: event_date || '' });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = { ...form };
    if (!payload.event_date) delete payload.event_date;
    try {
      if (isEdit) await updateSetlist(id, payload);
      else await createSetlist(payload);
      navigate('/setlists');
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>{isEdit ? t('common.edit') : t('setlists.newSetlist')}</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>{t('setlists.name')} *
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>{t('setlists.eventDate')}
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          />
        </label>
        <label>Descrizione
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/setlists')}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
