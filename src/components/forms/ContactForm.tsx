"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createContactSchema,
  type ContactFormValues,
} from "@/components/forms/schemas/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRecaptcha } from "@/providers/RecaptchaProvider";

type ContactFormProps = {
  className?: string;
};

type SubmitError = "generic" | "recaptchaInit" | "recaptchaToken" | null;

export function ContactForm({ className }: ContactFormProps) {
  const tContact = useTranslations("contact");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { executeRecaptcha, isConfigured, isReady, initFailed } = useRecaptcha();
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [submitError, setSubmitError] = useState<SubmitError>(null);

  const recaptchaBlocked = isConfigured && (initFailed || !isReady);

  const schema = useMemo(
    () =>
      createContactSchema({
        nombreRequired: tValidation("nombreRequired"),
        emailRequired: tValidation("emailRequired"),
        emailInvalid: tValidation("emailInvalid"),
        telefonoRequired: tValidation("telefonoRequired"),
        mensajeRequired: tValidation("mensajeRequired"),
        mensajeMin: tValidation("mensajeMin"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      mensaje: "",
      website: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("idle");
    setSubmitError(null);

    if (recaptchaBlocked) {
      setSubmitError("recaptchaInit");
      return;
    }

    try {
      const payload: ContactFormValues & { recaptchaToken?: string } = {
        ...values,
      };

      if (isConfigured) {
        let recaptchaToken: string;
        try {
          recaptchaToken = await executeRecaptcha();
        } catch {
          setSubmitError("recaptchaToken");
          return;
        }
        payload.recaptchaToken = recaptchaToken;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setSubmitError("generic");
        return;
      }

      setStatus("success");
      reset();
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
          ? tCommon("error")
          : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="nombre">{tContact("nombre")}</Label>
        <Input id="nombre" {...register("nombre")} />
        {errors.nombre ? (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{tContact("email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefono">{tContact("telefono")}</Label>
        <Input id="telefono" type="tel" {...register("telefono")} />
        {errors.telefono ? (
          <p className="text-sm text-destructive">{errors.telefono.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensaje">{tContact("mensaje")}</Label>
        <Textarea id="mensaje" {...register("mensaje")} />
        {errors.mensaje ? (
          <p className="text-sm text-destructive">{errors.mensaje.message}</p>
        ) : null}
      </div>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />
      <Button
        type="submit"
        disabled={isSubmitting || recaptchaBlocked}
        className="w-full"
      >
        {isSubmitting ? tCommon("sending") : tCommon("send")}
      </Button>
      {recaptchaBlocked ? (
        <p className="text-sm text-destructive">{tCommon("recaptchaInitFailed")}</p>
      ) : null}
      {status === "success" ? (
        <p className="text-sm text-primary">{tCommon("success")}</p>
      ) : null}
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  );
}
