import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../../api/auth';
import PasswordInput from '../../components/PasswordInput';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ new_password: '', new_password2: '' });
  const [errors, setErrors] = useState({});
  const [linkError, setLinkError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLinkError('');
    setLoading(true);
    try {
      await resetPassword({ uid, token, ...form });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      const data = err.response?.data || {};
      if (data.detail) setLinkError(data.detail);
      else setErrors(data);
    } finally {
      setLoading(false);
    }
  };

  if (linkError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>🎵 Music Platform</h1>
          <p className="error" role="alert" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {linkError}
          </p>
          <Link to="/forgot-password" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
            {t('auth.resetPassword')}
          </Link>
          <p><Link to="/login">{t('auth.backToLogin')}</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎵 Music Platform</h1>
        <h2>{t('auth.resetPasswordTitle')}</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('auth.newPassword')}
            <PasswordInput
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
              autoFocus
            />
            {errors.new_password && <span className="field-error" role="alert">{errors.new_password[0]}</span>}
          </label>
          <label>{t('auth.confirmPassword')}
            <PasswordInput
              value={form.new_password2}
              onChange={(e) => setForm({ ...form, new_password2: e.target.value })}
              required
            />
            {errors.new_password2 && <span className="field-error" role="alert">{errors.new_password2[0]}</span>}
          </label>
          <button type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('auth.resetPassword')}
          </button>
          <p><Link to="/login">{t('auth.backToLogin')}</Link></p>
        </form>
      </div>
    </div>
  );
}
