import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSetlist, getSetlistItems, removeItemFromSetlist } from '../../api/setlists';

export default function SetlistDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [setlist, setSetlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [sl, it] = await Promise.all([getSetlist(id), getSetlistItems(id)]);
      setSetlist(sl.data);
      setItems(it.data.results ?? it.data);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleRemove = async (itemId) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await removeItemFromSetlist(id, itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (loading) return <div className="page">{t('common.loading')}</div>;
  if (!setlist) return <div className="page">{t('common.notFound')}</div>;

  return (
    <div className="page">
      <div className="detail-header">
        <div>
          <h2>{setlist.name}</h2>
          {setlist.event_date && (
            <p className="meta">
              {t('setlists.eventDate')}: {new Date(setlist.event_date).toLocaleDateString()}
            </p>
          )}
          {setlist.description && <p>{setlist.description}</p>}
        </div>
        <div className="detail-actions">
          <Link to={`/setlists/${id}/edit`} className="btn-secondary">{t('common.edit')}</Link>
          <button className="btn-secondary" onClick={() => navigate('/setlists')}>{t('common.back')}</button>
        </div>
      </div>

      <h3>{t('setlists.items')} ({items.length})</h3>
      {items.length === 0 ? (
        <p>{t('setlists.noItems')}</p>
      ) : (
        <ol className="setlist-items">
          {items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <li key={item.id} className="setlist-item">
                <span className="item-order">{item.order}.</span>
                <span className="item-song">
                  <Link to={`/songs/${item.song}`}>{item.song_title || item.song}</Link>
                </span>
                {item.transposition_semitones !== 0 && (
                  <span className="badge">
                    {item.transposition_semitones > 0 ? '+' : ''}{item.transposition_semitones} st
                  </span>
                )}
                <button
                  className="btn-danger-sm"
                  onClick={() => handleRemove(item.id)}
                  title={t('common.remove')}
                >
                  ×
                </button>
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}
