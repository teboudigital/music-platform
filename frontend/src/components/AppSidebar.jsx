import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGroups } from '../api/groups';
import { useAuth } from '../contexts/AuthContext';

function IconNote() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChevron({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'none' }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function AppSidebar() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [groupsOpen, setGroupsOpen] = useState(true);

  const activeGroup = searchParams.get('group');
  const isMySongs = !activeGroup;

  useEffect(() => {
    getGroups().then((r) => setGroups(r.data.results || r.data)).catch(() => {});
  }, []);

  const selectMySongs = () => setSearchParams({});
  const selectGroup = (id) => setSearchParams({ group: id });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      {/* I miei canti */}
      <div className="sidebar-section">
        <button
          className={`sidebar-item${isMySongs ? ' active' : ''}`}
          onClick={selectMySongs}
        >
          <IconNote />
          <span>{t('sidebar.mySongs')}</span>
        </button>
      </div>

      <div className="sidebar-divider" />

      {/* Gruppi */}
      <div className="sidebar-section">
        <button
          className="sidebar-section-header"
          onClick={() => setGroupsOpen((v) => !v)}
        >
          <IconPeople />
          <span>{t('sidebar.myGroups')}</span>
          <IconChevron open={groupsOpen} />
        </button>

        {groupsOpen && (
          <div className="sidebar-group-list">
            {groups.length === 0 ? (
              <p className="sidebar-empty">{t('groups.noGroups')}</p>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  className={`sidebar-item sidebar-group-item${activeGroup === g.id ? ' active' : ''}`}
                  onClick={() => selectGroup(g.id)}
                >
                  <span className={`sidebar-role-dot${g.my_role === 'admin' ? ' admin' : ''}`} />
                  <span className="sidebar-group-name">{g.name}</span>
                  {g.my_role === 'admin' && (
                    <span className="sidebar-badge-admin">A</span>
                  )}
                </button>
              ))
            )}
            <Link to="/groups/new" className="sidebar-add-link">
              + {t('groups.newGroup')}
            </Link>
          </div>
        )}
      </div>

      {/* Logout in fondo */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <IconLogout />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
