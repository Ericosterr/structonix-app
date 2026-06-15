"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type RecaptchaContextValue = {
  isConfigured: boolean;
  isReady: boolean;
  initFailed: boolean;
  executeRecaptcha: () => Promise<string>;
};

const RecaptchaContext = createContext<RecaptchaContextValue | null>(null);

export function useRecaptcha(): RecaptchaContextValue {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error("useRecaptcha must be used within RecaptchaProvider");
  }
  return context;
}

type RecaptchaProviderProps = {
  children: ReactNode;
};

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
  const isConfigured = siteKey.length > 0;
  const [isReady, setIsReady] = useState(!isConfigured);
  const [initFailed, setInitFailed] = useState(false);

  const markReady = useCallback(() => {
    if (typeof window === "undefined" || !window.grecaptcha?.ready) {
      setInitFailed(true);
      return;
    }

    window.grecaptcha.ready(() => {
      setIsReady(true);
      setInitFailed(false);
    });
  }, []);

  const executeRecaptcha = useCallback(async (): Promise<string> => {
    if (!isConfigured) {
      throw new Error("RECAPTCHA_NOT_CONFIGURED");
    }

    if (initFailed) {
      throw new Error("RECAPTCHA_INIT_FAILED");
    }

    if (!isReady) {
      throw new Error("RECAPTCHA_NOT_READY");
    }

    return new Promise((resolve, reject) => {
      if (!window.grecaptcha?.ready) {
        reject(new Error("RECAPTCHA_INIT_FAILED"));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          ?.execute(siteKey, { action: "contact" })
          .then((token) => {
            if (!token) {
              reject(new Error("RECAPTCHA_TOKEN_EMPTY"));
              return;
            }
            resolve(token);
          })
          .catch(() => {
            reject(new Error("RECAPTCHA_TOKEN_FAILED"));
          });
      });
    });
  }, [initFailed, isConfigured, isReady, siteKey]);

  const value = useMemo(
    () => ({
      isConfigured,
      isReady,
      initFailed,
      executeRecaptcha,
    }),
    [executeRecaptcha, initFailed, isConfigured, isReady],
  );

  if (!isConfigured) {
    return (
      <RecaptchaContext.Provider value={value}>{children}</RecaptchaContext.Provider>
    );
  }

  return (
    <RecaptchaContext.Provider value={value}>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
        onLoad={markReady}
        onError={() => setInitFailed(true)}
      />
      {children}
    </RecaptchaContext.Provider>
  );
}
