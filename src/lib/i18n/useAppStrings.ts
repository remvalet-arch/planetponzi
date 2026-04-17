"use client";

import { useCallback, useEffect, useState } from "react";

import { type Locale, strings } from "@/src/lib/i18n/strings";

const STORAGE_KEY = "pp-locale";

export function useAppStrings() {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "en" || raw === "fr") setLocaleState(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { locale, setLocale, t: strings[locale] };
}
