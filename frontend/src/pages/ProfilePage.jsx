import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { changeEmail, changePassword, deleteAccount, exportData, getProfile, updateMe, updateProfile } from '../api/auth';
import PasswordInput from '../components/PasswordInput';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // ── Info personali ──────────────────────────────────────────
  const [info, setInfo] = useState({ first_name: '', last_name: '', bio: '' });
  const [draft, setDraft] = useState({ first_name: '', last_name: '', bio: '' });
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    const base = { first_name: user?.first_name || '', last_name: user?.last_name || '' };
    getProfile().then((r) => setInfo({ ...base, bio: r.data.bio || '' }));
  }, [user]);

  const startEditInfo = () => { setDraft({ ...info }); setInfoMsg(''); setEditingInfo(true); };
  const cancelEditInfo = () => { setEditingInfo(false); setInfoMsg(''); };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true); setInfoMsg('');
    try {
      await Promise.all([
        updateMe({ first_name: draft.first_name, last_name: draft.last_name }),
        updateProfile({ bio: draft.bio }),
      ]);
      setInfo({ ...draft });
      await refreshUser();
      setEditingInfo(false);
      setInfoMsg(t('common.saved'));
    } catch { setInfoMsg(t('common.error')); }
    finally { setSavingInfo(false); }
  };

  // ── Email ────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ password: '', email: '' });
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErrors, setEmailErrors] = useState({});
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  const startEditEmail = () => { setEmailForm({ password: '', email: '' }); setEmailMsg(''); setEmailErrors({}); setEditingEmail(true); };
  const cancelEditEmail = () => { setEditingEmail(false); setEmailMsg(''); setEmailErrors({}); };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true); setEmailMsg(''); setEmailErrors({});
    try {
      await changeEmail(emailForm);
      setEmail(emailForm.email);
      await refreshUser();
      setEditingEmail(false);
      setEmailMsg(t('common.saved'));
    } catch (err) {
      const data = err.response?.data || {};
      if (data.password || data.email) setEmailErrors(data);
      else setEmailMsg(t('common.error'));
    } finally { setSavingEmail(false); }
  };

  // ── Password ─────────────────────────────────────────────────
  const [editingPwd, setEditingPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', new_password2: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPwd, setSavingPwd] = useState(false);

  const startEditPwd = () => { setPwdForm({ current_password: '', new_password: '', new_password2: '' }); setPwdMsg(''); setPwdErrors({}); setEditingPwd(true); };
  const cancelEditPwd = () => { setEditingPwd(false); setPwdMsg(''); setPwdErrors({}); };

  const handleSavePwd = async (e) => {
    e.preventDefault();
    setSavingPwd(true); setPwdMsg(''); setPwdErrors({});
    try {
      await changePassword(pwdForm);
      setEditingPwd(false);
      setPwdMsg(t('common.saved'));
    } catch (err) {
      const data = err.response?.data || {};
      if (data.current_password || data.new_password || data.new_password2) setPwdErrors(data);
      else setPwdMsg(t('common.error'));
    } finally { setSavingPwd(false); }
  };

  // ── Elimina account ──────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const handleDelete = async () => {
    try {
      await deleteAccount(deletePassword);
      await logout();
      navigate('/login');
    } catch (err) {
      setDeleteMsg(err.response?.data?.detail || t('common.error'));
    }
  };

  // ── GDPR ─────────────────────────────────────────────────────
  const handleExport = async () => {
    const res = await exportData();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <h2>{t('nav.profile')}</h2>

      {/* Info personali */}
      <div className="form-card">
        <div className="profile-card-header">
          <h3>{t('auth.personalInfo')}</h3>
          {!editingInfo && <button type="button" className="btn-sm" onClick={startEditInfo}>{t('common.edit')}</button>}
        </div>
        {editingInfo ? (
          <form onSubmit={handleSaveInfo}>
            <label>{t('auth.firstName')}
              <input value={draft.first_name} onChange={(e) => setDraft({ ...draft, first_name: e.target.value })} />
            </label>
            <label>{t('auth.lastName')}
              <input value={draft.last_name} onChange={(e) => setDraft({ ...draft, last_name: e.target.value })} />
            </label>
            <label>Bio
              <textarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} rows={3} />
            </label>
            {infoMsg && <p className={infoMsg === t('common.saved') ? 'success' : 'error'} role="alert">{infoMsg}</p>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={cancelEditInfo}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={savingInfo}>{savingInfo ? t('common.loading') : t('common.save')}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-row"><span className="profile-label">{t('auth.firstName')}</span><span>{info.first_name || '—'}</span></div>
            <div className="profile-row"><span className="profile-label">{t('auth.lastName')}</span><span>{info.last_name || '—'}</span></div>
            <div className="profile-row"><span className="profile-label">Bio</span><span>{info.bio || '—'}</span></div>
            {infoMsg && <p className="success" role="alert">{infoMsg}</p>}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="form-card" style={{ marginTop: '1.5rem' }}>
        <div className="profile-card-header">
          <h3>{t('auth.changeEmail')}</h3>
          {!editingEmail && <button type="button" className="btn-sm" onClick={startEditEmail}>{t('common.edit')}</button>}
        </div>
        {editingEmail ? (
          <form onSubmit={handleSaveEmail}>
            <label>{t('auth.currentPassword')}
              <PasswordInput value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} required />
              {emailErrors.password && <span className="field-error" role="alert">{emailErrors.password[0]}</span>}
            </label>
            <label>{t('auth.newEmail')}
              <input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} required />
              {emailErrors.email && <span className="field-error" role="alert">{emailErrors.email[0]}</span>}
            </label>
            {emailMsg && <p className="error" role="alert">{emailMsg}</p>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={cancelEditEmail}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={savingEmail}>{savingEmail ? t('common.loading') : t('common.save')}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-row"><span className="profile-label">Email</span><span>{email}</span></div>
            {emailMsg && <p className="success" role="alert">{emailMsg}</p>}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="form-card" style={{ marginTop: '1.5rem' }}>
        <div className="profile-card-header">
          <h3>{t('auth.changePassword')}</h3>
          {!editingPwd && <button type="button" className="btn-sm" onClick={startEditPwd}>{t('common.edit')}</button>}
        </div>
        {editingPwd ? (
          <form onSubmit={handleSavePwd}>
            <label>{t('auth.currentPassword')}
              <PasswordInput value={pwdForm.current_password} onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })} required />
              {pwdErrors.current_password && <span className="field-error" role="alert">{pwdErrors.current_password[0]}</span>}
            </label>
            <label>{t('auth.newPassword')}
              <PasswordInput value={pwdForm.new_password} onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })} required />
              {pwdErrors.new_password && <span className="field-error" role="alert">{pwdErrors.new_password[0]}</span>}
            </label>
            <label>{t('auth.confirmPassword')}
              <PasswordInput value={pwdForm.new_password2} onChange={(e) => setPwdForm({ ...pwdForm, new_password2: e.target.value })} required />
              {pwdErrors.new_password2 && <span className="field-error" role="alert">{pwdErrors.new_password2[0]}</span>}
            </label>
            {pwdMsg && <p className="error" role="alert">{pwdMsg}</p>}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={cancelEditPwd}>{t('common.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={savingPwd}>{savingPwd ? t('common.loading') : t('common.save')}</button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-row"><span className="profile-label">Password</span><span>••••••••</span></div>
            {pwdMsg && <p className="success" role="alert">{pwdMsg}</p>}
          </div>
        )}
      </div>

      {/* GDPR */}
      <div className="form-card" style={{ marginTop: '1.5rem' }}>
        <h3>GDPR</h3>
        <p>{t('auth.exportInfo')}</p>
        <button className="btn-secondary" onClick={handleExport}>{t('auth.exportData')}</button>
      </div>

      {/* Danger zone */}
      <div className="form-card danger-zone" style={{ marginTop: '1.5rem' }}>
        <h3>{t('auth.deleteAccount')}</h3>
        <p>{t('auth.deleteWarning')}</p>
        {!showDelete ? (
          <button className="btn-danger" onClick={() => setShowDelete(true)}>{t('auth.deleteAccount')}</button>
        ) : (
          <div>
            <label>{t('auth.confirmPassword')}
              <PasswordInput value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder={t('auth.password')} />
            </label>
            {deleteMsg && <p className="error" role="alert">{deleteMsg}</p>}
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowDelete(false)}>{t('common.cancel')}</button>
              <button className="btn-danger" onClick={handleDelete} disabled={!deletePassword}>{t('auth.confirmDelete')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
