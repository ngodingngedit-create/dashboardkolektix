// lib/i18n.js
import { appWithTranslation } from 'next-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
.use(HttpBackend)
.use(LanguageDetector)
.use(initReactI18next)
.init({
    fallbackLng: 'id',
    debug: false,
    interpolation: {
        escapeValue: false,
    },
    ns: ['common'],
    defaultNS: 'common',
});

export default appWithTranslation;
