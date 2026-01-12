import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enTranslation from "./locales/en.json";
import viTranslation from "./locales/vi.json";

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem("language") || "en";

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
