"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type ExecuteRecaptcha = () => Promise<string | null>;

const RecaptchaContext = createContext<ExecuteRecaptcha | null>(null);

export function useRecaptcha(): ExecuteRecaptcha | null {
  return useContext(RecaptchaContext);
}

type RecaptchaProviderProps = {
  children: ReactNode;
};

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!siteKey || typeof window === "undefined" || !window.grecaptcha?.execute) {
      return null;
    }
    try {
      return await window.grecaptcha.execute(siteKey, { action: "contact" });
    } catch {
      return null;
    }
  }, [siteKey]);

  const value = useMemo(() => executeRecaptcha, [executeRecaptcha]);

  if (!siteKey) {
    return (
      <RecaptchaContext.Provider value={value}>{children}</RecaptchaContext.Provider>
    );
  }

  return (
    <RecaptchaContext.Provider value={value}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
      />
      {children}
    </RecaptchaContext.Provider>
  );
}
