// lib/i18n.js
import { appWithTranslation } from 'next-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// Import konfigurasi i18n
import nextI18NextConfig from '../../next-i18next.config.mjs';

i18n
  .use(HttpBackend) // Memuat terjemahan dari public/locales
  // .use(LanguageDetector) // Mendeteksi bahasa pengguna (dapat dinonaktifkan)
  .use(initReactI18next) // Menginisialisasi react-i18next
  .init({
    supportedLngs: ['en', 'id'],
    fallbackLng: ['id', 'en'], // Fallback ke 'id'
    debug: true, // Aktifkan debug untuk melihat log i18n
    // interpolation: {
    //   escapeValue: false,
    // },
    // ns: ['common'], // Namespace yang digunakan
    // defaultNS: 'common',
    // supportedLngs: nextI18NextConfig.supportedLngs, // Bahasa yang didukung
    // nonExplicitSupportedLngs: nextI18NextConfig.nonExplicitSupportedLngs, // Mapping varian regional
    // load: nextI18NextConfig.load, // Hanya memuat bagian bahasa
    // backend: {
    //   loadPath: `${nextI18NextConfig.localePath}/{{lng}}/{{ns}}.json`, // Path ke file terjemahan
    // },
    load: 'languageOnly',
    preload: ['id', 'en'],
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },

  }, (err, t) => {
    if (err) console.error('i18n error:', err);
    else console.log('i18n initialized successfully with language:', i18n.language);
  });

export default appWithTranslation;
