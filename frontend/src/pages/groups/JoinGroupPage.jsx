import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { joinGroup, joinGroupPreview } from '../../api/groups';

export default function JoinGroupPage() {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    joinGroupPreview(token)
      .then((r) => setPreview(r.data))
      .catch(() => setError(t('groups.joinInvalid')))
      .finally(() => setLoading(false));
  }, [token, t]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const r = await joinGroup(token);
      navigate(`/groups/${r.data.group_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || t('common.error'));
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card"><p>{t('common.loading')}</p></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{t('groups.joinGroup')}</h2>
        {error ? (
          <p className="error">{error}</p>
        ) : preview?.already_member ? (
          <>
            <p>{t('groups.alreadyMember')}</p>
            <button className="btn-primary" onClick={() => navigate(`/groups/${preview.group_id}`)}>
              {t('groups.viewGroup')}
            </button>
          </>
        ) : (
          <>
            <p>{t('groups.joinConfirm')}</p>
            <div className="join-group-info">
              <strong>{preview?.group_name}</strong>
              {preview?.description && <p className="text-muted">{preview.description}</p>}
              <p>{preview?.member_count} {t('groups.members')}</p>
            </div>
            <button className="btn-primary" onClick={handleJoin} disabled={joining}>
              {joining ? t('common.loading') : t('groups.joinGroup')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
