"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { InvestmentProject } from "@data/investments";
import { hoverZoom } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type InvestmentCardProps = {
  project: InvestmentProject;
  className?: string;
};

export function InvestmentCard({ project, className }: InvestmentCardProps) {
  const t = useTranslations("common");
  const tInvestors = useTranslations("investors");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.div {...hoverZoom} className={cn("group relative overflow-hidden rounded-[var(--radius-card)]", className)}>
        <div className="relative aspect-[4/3] w-full bg-muted">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title || project.id}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              {/* TODO: missing investor project image */}
            </div>
          )}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                {t("moreInfo")}
              </Button>
            </DialogTrigger>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {project.title ? (
            <p className="font-medium">{project.title}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{/* TODO: investor project title */}</p>
          )}
          {project.type ? (
            <p className="text-sm text-muted-foreground">{project.type}</p>
          ) : null}
          {project.area ? (
            <p className="text-sm text-muted-foreground">{project.area}</p>
          ) : null}
        </div>
      </motion.div>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project.title || project.id}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {project.pdf ? (
              <>
                <iframe
                  src={project.pdf}
                  title={project.title || project.id}
                  className="h-64 w-full rounded-[var(--radius-button)] border border-border"
                />
                <Button asChild variant="outline" className="w-full">
                  <a href={project.pdf} target="_blank" rel="noopener noreferrer">
                    {t("viewPdf")}
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{/* TODO: missing project PDF */}</p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">{tInvestors("projectDescription")}</h4>
            {project.description ? (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{/* TODO: investor project description */}</p>
            )}
          </div>
        </div>
        {project.pdf ? (
          <Button asChild className="w-full">
            <a href={project.pdf} download>
              {t("downloadPdf")}
            </a>
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
