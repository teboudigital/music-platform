import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import it from './it';
import fr from './fr';
import en from './en';

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: localStorage.getItem('lang') || 'it',
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
});

export default i18n;
