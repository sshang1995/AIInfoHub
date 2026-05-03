"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "en" | "zh";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (en: string, zh: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => undefined,
  t: (en) => en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  const setLang = (next: Lang) => {
    setLangState(next);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", next === "zh" ? "zh-CN" : "en");
      document.body.classList.toggle("lang-zh", next === "zh");
    }
  };

  // Restore from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "zh") setLang("zh");
  }, []);

  // Persist preference
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (en: string, zh: string) => (lang === "zh" ? zh : en);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
