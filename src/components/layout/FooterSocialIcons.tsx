"use client";

import { useTranslations } from "next-intl";
import { company } from "@config/company";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

const socialLinks = [
  { key: "instagram" as const, href: company.instagram, Icon: InstagramIcon },
  { key: "youtube" as const, href: company.youtube, Icon: YoutubeIcon },
];

export function FooterSocialIcons() {
  const tFooter = useTranslations("footer");

  return (
    <nav
      className="flex items-center justify-center gap-5 md:justify-end"
      aria-label={tFooter("socialLinks")}
    >
      {socialLinks.map(({ key, href, Icon }) => {
        if (!href) return null;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tFooter(key)}
            className="text-white transition-opacity hover:opacity-70"
          >
            <Icon className="text-white" />
          </a>
        );
      })}
    </nav>
  );
}
