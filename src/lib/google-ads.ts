export const GOOGLE_ADS_ID = "AW-18123699471";

export const GOOGLE_ADS_CONVERSIONS = {
  leadFormSubmit: "AW-18123699471/V-ISCKG45sccEI_qhsJD",
  whatsappClick: "AW-18123699471/w78iCKS45sccEI_qhsJD",
  phoneClick: "AW-18123699471/UJHTCKe45sccEI_qhsJD",
} as const;

export function trackGoogleAdsConversion(sendTo: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    return;
  }

  gtag("event", "conversion", {
    send_to: sendTo,
  });
}
