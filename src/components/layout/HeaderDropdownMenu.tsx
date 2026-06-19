"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { mobileNavItemClass } from "@/components/layout/mobile-nav";

export type DropdownItem = {
  key: string;
  href: string;
  label: string;
};

type HeaderDropdownMenuProps = {
  variant: "desktop" | "mobile";
  triggerLabel: string;
  items: DropdownItem[];
  onNavigate?: () => void;
};

export function HeaderDropdownMenu({
  variant,
  triggerLabel,
  items,
  onNavigate,
}: HeaderDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (variant !== "desktop" || !open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [variant, open]);

  if (variant === "desktop") {
    return (
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-medium text-white transition-opacity hover:opacity-80"
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {triggerLabel}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
        <div
          id={menuId}
          className={cn(
            "absolute left-0 top-full z-50 min-w-[220px] pt-2 transition-all",
            open ? "visible opacity-100" : "invisible opacity-0",
          )}
        >
          <div className="rounded-[var(--radius-button)] border border-white/10 bg-primary py-2 shadow-[var(--shadow-soft)]">
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        className={cn(mobileNavItemClass, "justify-between")}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
      >
        {triggerLabel}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div id={menuId} className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(mobileNavItemClass, "pl-8 text-white/90 hover:text-white")}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
