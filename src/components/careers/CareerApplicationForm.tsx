"use client";

import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { FileUp, X } from "lucide-react";
import type { CareerJobKey } from "@data/careers";
import {
  createCareerApplicationSchema,
  type CareerApplicationFormValues,
} from "@/components/forms/schemas/career-application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import {
  CAREER_CV_ALLOWED_EXTENSIONS,
  CAREER_CV_MAX_BYTES,
  isAllowedCareerCvFile,
} from "@/lib/career-application";
import { trackCareerEvent } from "@/lib/career-analytics";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/providers/RecaptchaProvider";

type CareerApplicationFormProps = {
  jobKey: CareerJobKey;
  jobTitle: string;
  onBack: () => void;
  onSuccess: () => void;
};

type SubmitError = "generic" | "recaptchaInit" | "recaptchaToken" | "cv" | null;

export function CareerApplicationForm({
  jobKey,
  jobTitle,
  onBack,
  onSuccess,
}: CareerApplicationFormProps) {
  const t = useTranslations("careers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { executeRecaptcha, isConfigured, isReady, initFailed } = useRecaptcha();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<SubmitError>(null);

  const recaptchaBlocked = isConfigured && (initFailed || !isReady);

  const schema = useMemo(
    () =>
      createCareerApplicationSchema({
        firstNameRequired: t("form.errors.firstNameRequired"),
        lastNameRequired: t("form.errors.lastNameRequired"),
        phoneRequired: t("form.errors.phoneRequired"),
        phoneInvalid: t("form.errors.phoneInvalid"),
        emailRequired: t("form.errors.emailRequired"),
        emailInvalid: t("form.errors.emailInvalid"),
        ageRequired: t("form.errors.ageRequired"),
        ageInvalid: t("form.errors.ageInvalid"),
        coverLetterRequired: t("form.errors.coverLetterRequired"),
        coverLetterMin: t("form.errors.coverLetterMin"),
        cvRequired: t("form.errors.cvRequired"),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CareerApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      coverLetter: "",
      website: "",
    },
  });

  const acceptAttr = CAREER_CV_ALLOWED_EXTENSIONS.join(",");

  const assignCv = (file: File | null) => {
    setCvError(null);
    if (!file) {
      setCvFile(null);
      return;
    }

    const check = isAllowedCareerCvFile(file);
    if (!check.ok) {
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setCvError(
        check.reason === "size"
          ? t("form.errors.cvTooLarge")
          : check.reason === "empty"
            ? t("form.errors.cvRequired")
            : t("form.errors.cvInvalidType"),
      );
      return;
    }

    setCvFile(file);
  };

  const onSubmit = async (values: CareerApplicationFormValues) => {
    setSubmitError(null);

    if (!cvFile) {
      setCvError(t("form.errors.cvRequired"));
      return;
    }

    const check = isAllowedCareerCvFile(cvFile);
    if (!check.ok) {
      setCvError(
        check.reason === "size"
          ? t("form.errors.cvTooLarge")
          : t("form.errors.cvInvalidType"),
      );
      return;
    }

    if (recaptchaBlocked) {
      setSubmitError("recaptchaInit");
      return;
    }

    try {
      trackCareerEvent("career_application_submit", jobTitle);

      const body = new FormData();
      body.set("jobKey", jobKey);
      body.set("jobTitle", jobTitle);
      body.set("firstName", values.firstName);
      body.set("lastName", values.lastName);
      body.set("phone", values.phone);
      body.set("email", values.email);
      body.set("age", String(values.age));
      body.set("coverLetter", values.coverLetter);
      body.set("locale", locale);
      body.set("website", values.website ?? "");
      body.set("cv", cvFile);

      if (isConfigured) {
        try {
          const token = await executeRecaptcha();
          body.set("recaptchaToken", token);
        } catch {
          setSubmitError("recaptchaToken");
          return;
        }
      }

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        setSubmitError("generic");
        return;
      }

      trackCareerEvent("career_application_success", jobTitle);
      onSuccess();
    } catch {
      setSubmitError("generic");
    }
  };

  const errorMessage =
    submitError === "recaptchaInit"
      ? tCommon("recaptchaInitFailed")
      : submitError === "recaptchaToken"
        ? tCommon("recaptchaTokenFailed")
        : submitError === "generic"
          ? t("form.submitError")
          : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      data-dirty={isDirty || Boolean(cvFile) ? "true" : "false"}
      noValidate
    >
      <p className="rounded-[var(--radius-button)] bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t("form.positionLabel")}: </span>
        {jobTitle}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-firstName">{t("form.firstName")}</Label>
          <Input id="career-firstName" autoComplete="given-name" {...register("firstName")} />
          {errors.firstName ? (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-lastName">{t("form.lastName")}</Label>
          <Input id="career-lastName" autoComplete="family-name" {...register("lastName")} />
          {errors.lastName ? (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="career-phone">{t("form.phone")}</Label>
          <Input
            id="career-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+34 ..."
            {...register("phone")}
          />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="career-email">{t("form.email")}</Label>
          <Input
            id="career-email"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 sm:max-w-[10rem]">
        <Label htmlFor="career-age">{t("form.age")}</Label>
        <Input
          id="career-age"
          type="number"
          inputMode="numeric"
          min={16}
          max={80}
          {...register("age", { valueAsNumber: true })}
        />
        {errors.age ? (
          <p className="text-sm text-destructive">{errors.age.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="career-coverLetter">{t("form.coverLetter")}</Label>
        <Textarea
          id="career-coverLetter"
          rows={5}
          {...register("coverLetter")}
        />
        {errors.coverLetter ? (
          <p className="text-sm text-destructive">{errors.coverLetter.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="career-cv">{t("form.cv")}</Label>
        <div
          className={cn(
            "rounded-[var(--radius-card)] border border-dashed border-border bg-muted/30 p-4",
            cvError && "border-destructive/50",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-primary/10 text-primary">
                <FileUp className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{t("form.cvUploadTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("form.cvHint", {
                    maxMb: Math.round(CAREER_CV_MAX_BYTES / (1024 * 1024)),
                  })}
                </p>
                {cvFile ? (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="truncate text-xs font-medium text-foreground">
                      {cvFile.name}
                    </span>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        assignCv(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-3 w-3" aria-hidden />
                      {t("form.removeFile")}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("form.chooseFile")}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            id="career-cv"
            type="file"
            accept={acceptAttr}
            className="sr-only"
            onChange={(event) => {
              assignCv(event.target.files?.[0] ?? null);
            }}
          />
        </div>
        {cvError ? <p className="text-sm text-destructive">{cvError}</p> : null}
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        {...register("website")}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t.rich("form.privacyNotice", {
          privacy: (chunks) => (
            <Link
              href="/politica-de-privacidad"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {t("modal.backToJob")}
        </Button>
        <Button type="submit" disabled={isSubmitting || recaptchaBlocked}>
          {isSubmitting ? t("form.submitting") : t("form.submit")}
        </Button>
      </div>
    </form>
  );
}
