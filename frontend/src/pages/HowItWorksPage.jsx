import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function HowItWorksPage() {
  const { t } = useTranslation();
  const { isGuest, isDemo, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError]     = useState('');

  const handleDemo = async () => {
    setDemoLoading(true);
    setDemoError('');
    try {
      await loginAsDemo();
      navigate('/songs');
    } catch {
      setDemoError(t('hiw.demoError'));
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="how-it-works">
      <div className="hiw-hero">
        <h1>🎵 Music Platform</h1>
        <p className="hiw-subtitle">{t('hiw.subtitle')}</p>
        <div className="hiw-hero-actions">
          {!isDemo && (
            <button
              className="btn-primary hiw-cta"
              onClick={handleDemo}
              disabled={demoLoading}
            >
              {demoLoading ? t('common.loading') : t('hiw.tryDemo')}
            </button>
          )}
          {isDemo && (
            <Link to="/songs" className="btn-primary hiw-cta">{t('hiw.cta')}</Link>
          )}
          <Link to="/login" className="btn-sm hiw-cta-secondary">{t('hiw.loginReal')}</Link>
        </div>
        {demoError && <p className="error" style={{ marginTop: '0.5rem' }}>{demoError}</p>}
      </div>

      <div className="hiw-features">
        <div className="hiw-card">
          <div className="hiw-icon">🎼</div>
          <h3>{t('hiw.feature2Title')}</h3>
          <p>{t('hiw.feature2Desc')}</p>
        </div>
        <div className="hiw-card">
          <div className="hiw-icon">👥</div>
          <h3>{t('hiw.feature3Title')}</h3>
          <p>{t('hiw.feature3Desc')}</p>
        </div>
        <div className="hiw-card">
          <div className="hiw-icon">📋</div>
          <h3>{t('hiw.feature4Title')}</h3>
          <p>{t('hiw.feature4Desc')}</p>
        </div>
      </div>

      <div className="hiw-plans">
        <h2>{t('hiw.plansTitle')}</h2>
        <div className="hiw-plan-grid">
          <div className="hiw-plan">
            <h4>{t('hiw.planDemoTitle')}</h4>
            <ul>
              <li>✓ {t('hiw.planDemo1')}</li>
              <li>✓ {t('hiw.planDemo2')}</li>
              <li>✓ {t('hiw.planDemo3')}</li>
              <li>✓ {t('hiw.planDemo4')}</li>
            </ul>
            {!isDemo
              ? <button className="btn-sm" onClick={handleDemo} disabled={demoLoading}>
                  {demoLoading ? t('common.loading') : t('hiw.tryDemo')}
                </button>
              : <Link to="/songs" className="btn-sm">{t('hiw.cta')}</Link>
            }
          </div>
          <div className="hiw-plan hiw-plan-featured">
            <div className="hiw-plan-badge">{t('hiw.planFreeBadge')}</div>
            <h4>{t('hiw.planFreeTitle')}</h4>
            <ul>
              <li>✓ {t('hiw.planFree1')}</li>
              <li>✓ {t('hiw.planFree2')}</li>
              <li>✓ {t('hiw.planFree3')}</li>
              <li>✓ {t('hiw.planFree4')}</li>
            </ul>
            {isGuest && (
              <Link to="/register" className="btn-primary">{t('auth.register')}</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
