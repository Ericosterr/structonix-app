"use client";

import {
  GOOGLE_ADS_CONVERSIONS,
  trackGoogleAdsConversion,
} from "@/lib/google-ads";

type WhatsAppConversionLinkProps = React.ComponentPropsWithoutRef<"a">;

export function WhatsAppConversionLink({
  onClick,
  ...props
}: WhatsAppConversionLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackGoogleAdsConversion(GOOGLE_ADS_CONVERSIONS.whatsappClick);
        onClick?.(event);
      }}
    />
  );
}
