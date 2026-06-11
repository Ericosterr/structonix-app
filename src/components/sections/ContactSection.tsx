"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { company } from "@config/company";
import { site } from "@config/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type ContactSectionProps = {
  backgroundImage?: string;
  className?: string;
};

export function ContactSection({ backgroundImage, className }: ContactSectionProps) {
  const tCommon = useTranslations("common");
  const tContact = useTranslations("contact");

  return (
    <AnimatedSection
      className={cn("relative overflow-hidden py-20 md:py-28", className)}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-0 bg-primary/75" />
      <Container className="relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8 text-white">
            <SectionHeading title={tContact("formTitle")} className="text-white" />
            <div className="space-y-6">
              {company.phone ? (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-start gap-3 text-lg transition-opacity hover:opacity-80"
                >
                  <Phone className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{company.phone}</span>
                </a>
              ) : null}
              {company.email ? (
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-start gap-3 transition-opacity hover:opacity-80"
                >
                  <Mail className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{company.email}</span>
                </a>
              ) : null}
              {company.address ? (
                company.googleMaps ? (
                  <a
                    href={company.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 transition-opacity hover:opacity-80"
                  >
                    <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{company.address}</span>
                  </a>
                ) : (
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{company.address}</span>
                  </p>
                )
              ) : null}
              {company.whatsapp ? (
                <Button
                  asChild
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <a href={company.whatsapp} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={site.assets.whatsappIcon}
                      alt={tCommon("whatsapp")}
                      width={20}
                      height={20}
                    />
                    {tCommon("whatsapp")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
            <ContactForm />
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
}
