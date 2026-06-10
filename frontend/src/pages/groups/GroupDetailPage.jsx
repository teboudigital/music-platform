import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  deleteGroup, getGroup, leaveGroup,
  regenerateInviteLink, removeMember, setMemberRole,
} from '../../api/groups';

export default function GroupDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await getGroup(id);
      setGroup(r.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const inviteUrl = group
    ? `${window.location.origin}/join/${group.invite_token}`
    : '';

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateLink = async () => {
    if (!window.confirm(t('groups.regenerateWarning'))) return;
    await regenerateInviteLink(id);
    load();
  };

  const handleSetRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    await setMemberRole(id, userId, newRole);
    load();
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await removeMember(id, userId);
    load();
  };

  const handleLeave = async () => {
    if (!window.confirm(t('groups.leaveConfirm'))) return;
    try {
      await leaveGroup(id);
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await deleteGroup(id);
    navigate('/groups');
  };

  if (loading) return <div className="page"><p>{t('common.loading')}</p></div>;
  if (error && !group) return <div className="page"><p className="error">{error}</p></div>;

  const isAdmin = group?.is_admin;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/groups" className="back-link">← {t('common.back')}</Link>
          <h2>{group.name}</h2>
          {group.description && <p className="text-muted">{group.description}</p>}
        </div>
        <div className="btn-group">
          {isAdmin && (
            <Link to={`/groups/${id}/edit`} className="btn-secondary">{t('common.edit')}</Link>
          )}
          {group.owner_id && group.my_role !== 'admin' && (
            <button className="btn-sm danger" onClick={handleLeave}>{t('groups.leaveGroup')}</button>
          )}
          {isAdmin && (
            <button className="btn-sm danger" onClick={handleDelete}>{t('common.delete')}</button>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Sezione link di invito — visibile a tutti i membri */}
      <div className="card invite-card">
        <h3>{t('groups.inviteLink')}</h3>
        <div className="invite-url-row">
          <input
            readOnly
            value={inviteUrl}
            className="invite-url-input"
            onClick={(e) => e.target.select()}
          />
          <button className="btn-primary" onClick={handleCopyLink}>
            {copied ? t('groups.copied') : t('groups.copyLink')}
          </button>
        </div>
        {isAdmin && (
          <button className="btn-sm btn-muted" onClick={handleRegenerateLink}>
            {t('groups.regenerateLink')}
          </button>
        )}
      </div>

      {/* Lista membri */}
      <div className="members-section">
        <h3>{t('groups.members')} ({group.member_count})</h3>
        {!group.memberships?.length ? (
          <p className="empty">{t('groups.noMembers')}</p>
        ) : (
          <ul className="members-list">
            {group.memberships.map((m) => (
              <li key={m.id} className="member-item">
                <div className="member-info">
                  <span className="member-name">{m.user_full_name}</span>
                  <span className="member-email">{m.user_email}</span>
                </div>
                <div className="member-actions">
                  <span className={`role-badge role-${m.role}`}>
                    {t(`groups.${m.role}`)}
                  </span>
                  {isAdmin && m.user_id !== group.owner_id && (
                    <>
                      <button
                        className="btn-sm"
                        onClick={() => handleSetRole(m.user_id, m.role)}
                      >
                        {m.role === 'admin' ? t('groups.removeAdmin') : t('groups.makeAdmin')}
                      </button>
                      <button
                        className="btn-sm danger"
                        onClick={() => handleRemoveMember(m.user_id)}
                      >
                        {t('common.remove')}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
