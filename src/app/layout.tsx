import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import { buildFaviconIcons, buildRootMetadata } from "@/lib/seo";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";
import { buildGoogleConsentBootstrapScript } from "@/lib/consent-mode";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  ...buildRootMetadata(),
  icons: buildFaviconIcons(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <Script id="google-consent-gtag" strategy="beforeInteractive">
          {buildGoogleConsentBootstrapScript(GOOGLE_ADS_ID)}
        </Script>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
