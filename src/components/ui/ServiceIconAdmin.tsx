"use client";

import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceIconAdminProps = {
  className?: string;
};

export function ServiceIconAdmin({ className }: ServiceIconAdminProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary",
        className,
      )}
    >
      {/* TODO: replace with image icon asset from /public/icons */}
      <Building2 className="h-8 w-8" aria-hidden="true" />
    </div>
  );
}
