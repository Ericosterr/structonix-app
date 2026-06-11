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

export function ContactForm({ className }: ContactFormProps) {
  const tContact = useTranslations("contact");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const executeRecaptcha = useRecaptcha();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

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
    try {
      const recaptchaToken = executeRecaptcha ? await executeRecaptcha() : null;
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, recaptchaToken }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

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
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? tCommon("sending") : tCommon("send")}
      </Button>
      {status === "success" ? (
        <p className="text-sm text-primary">{tCommon("success")}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-destructive">{tCommon("error")}</p>
      ) : null}
    </form>
  );
}
