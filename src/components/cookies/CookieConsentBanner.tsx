"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  applyConsentChoice,
  COOKIE_SETTINGS_OPEN_EVENT,
  getStoredConsent,
  type CookieConsentStatus,
} from "@/lib/consent-mode";

export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const openSettings = () => {
      setShowDetails(true);
      setVisible(true);
    };

    const initTimer = window.setTimeout(() => {
      setVisible(getStoredConsent() === null);
      setReady(true);
    }, 0);

    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
    };
  }, []);

  const handleChoice = (status: CookieConsentStatus) => {
    applyConsentChoice(status);
    setShowDetails(false);
    setVisible(false);
  };

  if (!ready || !visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2
              id="cookie-consent-title"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {t("title")}
            </h2>
            <p
              id="cookie-consent-description"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {t("description")}
            </p>
            {showDetails ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("settingsDescription")}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => handleChoice("accepted")}
            >
              {t("acceptAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleChoice("rejected")}
            >
              {t("rejectNonEssential")}
            </Button>
            {!showDetails ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => setShowDetails(true)}
              >
                {t("cookieSettings")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
