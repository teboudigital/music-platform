import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import i18n from '../i18n';

const LANGUAGES = [
  { code: 'it', label: 'IT' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

function IconPerson() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function LangDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const pick = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lang', code);
    setOpen(false);
  };

  return (
    <div className="lang-dropdown" ref={ref}>
      <button
        className="lang-dropdown-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label} <span className="lang-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <ul className="lang-dropdown-panel" role="listbox">
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === i18n.language}>
              <button
                className={`lang-dropdown-option${l.code === i18n.language ? ' active' : ''}`}
                onClick={() => pick(l.code)}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, isGuest } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🎵 Music Platform</Link>

      <div className="navbar-nav">
        <NavLink to="/come-funziona" className={({ isActive }) => `navbar-navlink${isActive ? ' active' : ''}`}>
          {t('nav.howItWorks')}
        </NavLink>
        <NavLink to="/songs" className={({ isActive }) => `navbar-navlink${isActive ? ' active' : ''}`}>
          {t('nav.songs')}
        </NavLink>
      </div>

      <div className="navbar-right">
        <LangDropdown />
        {isGuest ? (
          <Link to="/register" className="navbar-user navbar-guest">
            <div className="navbar-avatar"><IconPerson /></div>
            <span>{t('auth.register')}</span>
          </Link>
        ) : user ? (
          <Link to="/profile" className="navbar-user">
            <div className="navbar-avatar"><IconPerson /></div>
            <span>{user.first_name || user.username}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
