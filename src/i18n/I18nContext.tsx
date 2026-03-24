import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationKeys } from "./translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | null>(null);

function detectLanguage(): Language {
  const stored = localStorage.getItem("gamepoint-lang");
  if (stored === "en" || stored === "es") return stored;
  const nav = navigator.language || "";
  return nav.startsWith("es") ? "es" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectLanguage);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem("gamepoint-lang", l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
