import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import PasswordInput from '../../components/PasswordInput';
import PasswordSuggestPopover from '../../components/PasswordSuggestPopover';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', password2: '', first_name: '', last_name: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const guestToken = localStorage.getItem('guest_token');
      await register({ ...form, ...(guestToken ? { guest_token: guestToken } : {}) });
      await login(form.email, form.password);
      navigate('/songs');
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: [t('common.error')] });
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <label key={name}>{label}
      <input type={type} name={name} value={form[name]} onChange={change} required={['email','username','password','password2'].includes(name)} />
      {errors[name] && <span className="field-error" role="alert">{errors[name][0]}</span>}
    </label>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎵 Music Platform</h1>
        <h2>{t('auth.register')}</h2>
        <form onSubmit={handleSubmit}>
          {field('email', t('auth.email'), 'email')}
          {field('username', t('auth.username'))}
          {field('first_name', t('auth.firstName'))}
          {field('last_name', t('auth.lastName'))}
          <label>{t('auth.password')}
            <PasswordInput name="password" value={form.password} onChange={change} required />
            {errors.password && <span className="field-error" role="alert">{errors.password[0]}</span>}
          </label>
          <PasswordSuggestPopover
            onAccept={(pwd) => setForm((f) => ({ ...f, password: pwd, password2: pwd }))}
          />
          <label>{t('auth.confirmPassword')}
            <PasswordInput name="password2" value={form.password2} onChange={change} required />
            {errors.password2 && <span className="field-error" role="alert">{errors.password2[0]}</span>}
          </label>
          {errors.non_field_errors && <p className="error" role="alert">{errors.non_field_errors[0]}</p>}
          <button type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('auth.register')}
          </button>
        </form>
        <p>{t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link></p>
      </div>
    </div>
  );
}
