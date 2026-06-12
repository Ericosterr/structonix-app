import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Vary",
            value:
              "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Accept, Accept-Encoding",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
