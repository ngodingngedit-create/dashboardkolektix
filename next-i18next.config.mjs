// next-i18next.config.mjs
import path from 'path';

export default {
  i18n: {
    defaultLocale: 'id', // Locale default
    locales: ['en', 'id'], // Daftar locale yang didukung
    localeDetection: false, // Nonaktifkan deteksi otomatis
  },
  localePath: path.resolve('./public/locales'), // Path ke folder locales
  supportedLngs: ['en', 'id'], // Bahasa yang didukung tanpa varian regional
  nonExplicitSupportedLngs: true, // Mengizinkan mapping varian regional ke bahasa dasar
  load: 'languageOnly', // Hanya memuat bagian bahasa dari locale
};
