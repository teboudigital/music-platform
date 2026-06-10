import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSetlists, deleteSetlist } from '../../api/setlists';

export default function SetlistsPage() {
  const { t } = useTranslation();
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await getSetlists(); setSetlists(r.data.results || r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteSetlist(id); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('nav.setlists')}</h2>
        <Link to="/setlists/new" className="btn-primary">{t('setlists.newSetlist')}</Link>
      </div>
      {loading ? <p>{t('common.loading')}</p> : setlists.length === 0 ? (
        <p className="empty">{t('setlists.noSetlists')}</p>
      ) : (
        <div className="cards-grid">
          {setlists.map((s) => (
            <div key={s.id} className="card">
              <Link to={`/setlists/${s.id}`}>
                <h3>{s.title}</h3>
                {s.event_date && <p>📅 {s.event_date}</p>}
                <p>{s.item_count} canzoni</p>
              </Link>
              <div className="card-actions">
                <button className="btn-sm danger" onClick={() => handleDelete(s.id)}>{t('common.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
