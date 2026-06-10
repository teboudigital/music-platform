import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../../components/PasswordInput';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const resetSuccess = location.state?.resetSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/songs');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎵 Music Platform</h1>
        <h2>{t('auth.login')}</h2>
        <form onSubmit={handleSubmit}>
          <label>{t('auth.email')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>{t('auth.password')}
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {resetSuccess && <p className="success" role="alert">{t('auth.resetSuccess')}</p>}
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <p><Link to="/forgot-password">{t('auth.forgotPassword')}</Link></p>
        <p>{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
      </div>
    </div>
  );
}
