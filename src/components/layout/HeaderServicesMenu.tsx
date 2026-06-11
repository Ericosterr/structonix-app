"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { serviceNavItems } from "@config/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HeaderServicesMenuProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function HeaderServicesMenu({ variant, onNavigate }: HeaderServicesMenuProps) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (variant === "desktop") {
    return (
      <div className="group relative">
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-white transition-opacity hover:opacity-80"
          aria-haspopup="true"
        >
          {tCommon("services")}
          <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
        </button>
        <div className="invisible absolute left-0 top-full z-50 min-w-[220px] pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          <div className="rounded-[var(--radius-button)] border border-white/10 bg-primary py-2 shadow-[var(--shadow-soft)]">
            {serviceNavItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                {tNav(item.key)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-white/10 pb-3">
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm font-semibold text-white"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
      >
        {tCommon("services")}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", mobileOpen && "rotate-180")}
        />
      </button>
      {mobileOpen ? (
        <div className="mt-3 flex flex-col gap-2 pl-2">
          {serviceNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-white/90 hover:text-white"
              onClick={onNavigate}
            >
              {tNav(item.key)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
