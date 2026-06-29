export const COOKIE_CONSENT_STORAGE_KEY = "structonix_cookie_consent_v1";

export const COOKIE_SETTINGS_OPEN_EVENT = "structonix:open-cookie-settings";

export type CookieConsentStatus = "accepted" | "rejected";

export type CookieConsentRecord = {
  status: CookieConsentStatus;
  updatedAt: string;
};

export const CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

export const CONSENT_GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

export function getStoredConsent(): CookieConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (parsed.status !== "accepted" && parsed.status !== "rejected") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(status: CookieConsentStatus): CookieConsentRecord {
  const record: CookieConsentRecord = {
    status,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function updateGoogleConsent(status: CookieConsentStatus): void {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag(
    "consent",
    "update",
    status === "accepted" ? CONSENT_GRANTED : CONSENT_DENIED,
  );
}

export function applyConsentChoice(status: CookieConsentStatus): void {
  saveConsent(status);
  updateGoogleConsent(status);
}

export function openCookieSettings(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT));
}

/**
 * Inline bootstrap for the root layout `<head>`.
 * Consent default is set before gtag config; stored acceptance is restored
 * synchronously from localStorage (browser only, never SSR).
 */
export function buildGoogleConsentBootstrapScript(googleAdsId: string): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500
    });
    try {
      var __consentRaw = localStorage.getItem('${COOKIE_CONSENT_STORAGE_KEY}');
      if (__consentRaw) {
        var __consent = JSON.parse(__consentRaw);
        if (__consent && __consent.status === 'accepted') {
          gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted'
          });
        }
      }
    } catch (e) {}
    gtag('js', new Date());
    gtag('config', '${googleAdsId}');
  `;
}
