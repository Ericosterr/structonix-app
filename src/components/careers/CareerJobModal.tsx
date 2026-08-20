import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { CareerJobKey } from "@data/careers";
import { CareerApplicationForm } from "@/components/careers/CareerApplicationForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackCareerEvent } from "@/lib/career-analytics";

type CareerModalStep = "details" | "application" | "success";

type CareerJobModalProps = {
  jobKey: CareerJobKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function JobSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

export function CareerJobModal({ jobKey, open, onOpenChange }: CareerJobModalProps) {
  const t = useTranslations("careers");
  const [step, setStep] = useState<CareerModalStep>("details");
  const [formDirty, setFormDirty] = useState(false);
  const trackedJobRef = useRef<string | null>(null);

  const jobTitle = jobKey ? t(`jobs.${jobKey}.title`) : "";

  useEffect(() => {
    if (!open || !jobKey) {
      trackedJobRef.current = null;
      return;
    }

    const title = t(`jobs.${jobKey}.title`);
    if (trackedJobRef.current === jobKey) {
      return;
    }
    trackedJobRef.current = jobKey;
    trackCareerEvent("career_job_view", title);
  }, [open, jobKey, t]);

  const responsibilities =
    jobKey && open
      ? (t.raw(`jobs.${jobKey}.responsibilities`) as string[])
      : [];
  const requirements =
    jobKey && open ? (t.raw(`jobs.${jobKey}.requirements`) as string[]) : [];
  const offers = open ? (t.raw("modal.offers") as string[]) : [];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && step === "application" && formDirty) {
      const confirmed = window.confirm(t("modal.discardConfirm"));
      if (!confirmed) {
        return;
      }
    }
    onOpenChange(nextOpen);
  };

  const dialogTitle =
    step === "details"
      ? jobTitle
      : step === "application"
        ? t("modal.applicationTitle")
        : t("success.title");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[min(92dvh,900px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none sm:w-full"
        onInteractOutside={(event) => {
          if (step === "application" && formDirty) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (step === "application" && formDirty) {
            const confirmed = window.confirm(t("modal.discardConfirm"));
            if (!confirmed) {
              event.preventDefault();
            }
          }
        }}
      >
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left sm:px-6">
          <DialogTitle className="text-xl leading-snug md:text-2xl">
            {dialogTitle}
          </DialogTitle>
          {step === "application" && jobTitle ? (
            <p className="pt-1 text-sm text-muted-foreground">{jobTitle}</p>
          ) : null}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {jobKey && step === "details" ? (
            <div className="space-y-8">
              <JobSection title={t("modal.aboutTitle")}>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`jobs.${jobKey}.about`)}
                </p>
              </JobSection>

              <JobSection title={t("modal.responsibilitiesTitle")}>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </JobSection>

              <JobSection title={t("modal.requirementsTitle")}>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </JobSection>

              <JobSection title={t("modal.offersTitle")}>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {offers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </JobSection>
            </div>
          ) : null}

          {jobKey && step === "application" ? (
            <div
              onChange={(event) => {
                const target = event.currentTarget.querySelector(
                  'form[data-dirty="true"]',
                );
                setFormDirty(Boolean(target));
              }}
              onInput={() => setFormDirty(true)}
            >
              <CareerApplicationForm
                jobKey={jobKey}
                jobTitle={jobTitle}
                onBack={() => {
                  setStep("details");
                  setFormDirty(false);
                }}
                onSuccess={() => {
                  setFormDirty(false);
                  setStep("success");
                }}
              />
            </div>
          ) : null}

          {step === "success" ? (
            <div className="space-y-4 py-4 text-center sm:py-8">
              <p className="text-lg font-semibold tracking-tight">
                {t("success.title")}
              </p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("success.message")}
              </p>
            </div>
          ) : null}
        </div>

        {step === "details" ? (
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("modal.close")}
            </Button>
            <Button
              onClick={() => {
                trackCareerEvent("career_application_start", jobTitle);
                setStep("application");
              }}
            >
              {t("modal.apply")}
            </Button>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="flex shrink-0 justify-center border-t border-border px-5 py-4 sm:px-6">
            <Button onClick={() => onOpenChange(false)}>{t("modal.close")}</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
