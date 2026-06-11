import { z } from "zod";

export function createContactSchema(messages: {
  nombreRequired: string;
  emailRequired: string;
  emailInvalid: string;
  telefonoRequired: string;
  mensajeRequired: string;
  mensajeMin: string;
}) {
  return z.object({
    nombre: z.string().min(1, messages.nombreRequired),
    email: z.string().min(1, messages.emailRequired).email(messages.emailInvalid),
    telefono: z.string().min(1, messages.telefonoRequired),
    mensaje: z
      .string()
      .min(1, messages.mensajeRequired)
      .min(10, messages.mensajeMin),
    website: z.string().optional(),
  });
}

export type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>;
