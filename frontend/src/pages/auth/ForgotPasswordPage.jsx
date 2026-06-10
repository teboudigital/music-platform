import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../../api/auth';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎵 Music Platform</h1>
        <h2>{t('auth.forgotPasswordTitle')}</h2>
        {sent ? (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text)', marginBottom: '1.5rem' }}>
              {t('auth.resetEmailSent')}
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
              {t('auth.backToLogin')}
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              {t('auth.forgotPasswordHint')}
            </p>
            <label>{t('auth.email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('auth.resetPassword')}
            </button>
            <p><Link to="/login">{t('auth.backToLogin')}</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
