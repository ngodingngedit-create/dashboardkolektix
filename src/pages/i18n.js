import { appWithTranslation } from 'next-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nextI18NextConfig from '../../next-i18next.config.mjs';
import idTranslations from '../../public/locales/id/translation.json';
import enTranslations from '../../public/locales/en/translation.json';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        id: { translation: idTranslations },
        en: { translation: enTranslations },
      },
      lng: 'id',
      fallbackLng: 'id',
      supportedLngs: ['id', 'en'],
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    }, (err) => {
      if (err) console.error('i18n error:', err);
      else console.log('i18n initialized with language:', i18n.language);
    });
} else {
  // HMR/dev: server singleton persists between module re-evaluations.
  // Refresh bundles so edited translation.json files take effect without a server restart.
  i18n.addResourceBundle('id', 'translation', idTranslations, true, true);
  i18n.addResourceBundle('en', 'translation', enTranslations, true, true);
}

export default appWithTranslation;
