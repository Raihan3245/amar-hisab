import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (bn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");

    return saved === "en" ? "en" : "bn";
  });

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("app-language", newLanguage);
  };

  const t = (bn: string, en: string) => {
    return language === "bn" ? bn : en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}