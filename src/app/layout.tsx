import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";
import { buildFaviconIcons, buildRootMetadata } from "@/lib/seo";
import "./globals.css";

const GOOGLE_ADS_ID = "AW-8123699471";

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
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="google-ads-gtag" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
