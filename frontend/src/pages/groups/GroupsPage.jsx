import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGroups, deleteGroup } from '../../api/groups';

export default function GroupsPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await getGroups(); setGroups(r.data.results || r.data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteGroup(id); load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('nav.groups')}</h2>
        <Link to="/groups/new" className="btn-primary">{t('groups.newGroup')}</Link>
      </div>
      {loading ? <p>{t('common.loading')}</p> : groups.length === 0 ? (
        <p className="empty">{t('groups.noGroups')}</p>
      ) : (
        <div className="cards-grid">
          {groups.map((g) => (
            <div key={g.id} className="card">
              <div>
                <h3>
                  <Link to={`/groups/${g.id}`} className="card-title-link">{g.name}</Link>
                </h3>
                <p>
                  {g.member_count} {t('groups.members')}
                  {g.my_role === 'admin' && (
                    <span className="role-badge role-admin" style={{ marginLeft: '0.5rem' }}>{t('groups.admin')}</span>
                  )}
                </p>
              </div>
              <div className="card-actions">
                <Link to={`/groups/${g.id}`} className="btn-sm">{t('groups.viewGroup')}</Link>
                {g.my_role === 'admin' && (
                  <Link to={`/groups/${g.id}/edit`} className="btn-sm">{t('common.edit')}</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
