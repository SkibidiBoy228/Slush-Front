
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uk from "./locales/uk.json";
import en from "./locales/en.json";
import sk from "./locales/sk.json";
import ru from "./locales/ru.json";

export const LANGUAGE_STORAGE_KEY = "slush_language";

export const supportedLanguages = ["uk", "en", "sk", "ru"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

function getInitialLanguage(): SupportedLanguage {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (
        savedLanguage &&
        supportedLanguages.includes(savedLanguage as SupportedLanguage)
    ) {
        return savedLanguage as SupportedLanguage;
    }

    return "uk";
}

i18n.use(initReactI18next).init({
    resources: {
        uk: { translation: uk },
        en: { translation: en },
        sk: { translation: sk },
        ru: { translation: ru },
    },
    lng: getInitialLanguage(),
    fallbackLng: "uk",
    supportedLngs: [...supportedLanguages],
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;
