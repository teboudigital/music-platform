import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createGroup, getGroup, updateGroup } from '../../api/groups';

export default function GroupFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) getGroup(id).then((r) => setForm({ name: r.data.name, description: r.data.description }));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await updateGroup(id, form);
      else await createGroup(form);
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>{isEdit ? t('common.edit') : t('groups.newGroup')}</h2>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>{t('groups.name')} *
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>Descrizione
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/groups')}>{t('common.cancel')}</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
