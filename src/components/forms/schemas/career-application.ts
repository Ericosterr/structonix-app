import { z } from "zod";
import { careerJobKeys } from "@data/careers";

export type CareerApplicationFieldMessages = {
  firstNameRequired: string;
  lastNameRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  emailRequired: string;
  emailInvalid: string;
  ageRequired: string;
  ageInvalid: string;
  coverLetterRequired: string;
  coverLetterMin: string;
  cvRequired: string;
};

const phonePattern = /^\+?[0-9\s().-]{7,20}$/;

export function createCareerApplicationSchema(messages: CareerApplicationFieldMessages) {
  return z.object({
    firstName: z.string().trim().min(1, messages.firstNameRequired),
    lastName: z.string().trim().min(1, messages.lastNameRequired),
    phone: z
      .string()
      .trim()
      .min(1, messages.phoneRequired)
      .regex(phonePattern, messages.phoneInvalid),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    age: z
      .number({ error: messages.ageRequired })
      .int(messages.ageInvalid)
      .min(16, messages.ageInvalid)
      .max(80, messages.ageInvalid),
    coverLetter: z
      .string()
      .trim()
      .min(1, messages.coverLetterRequired)
      .min(30, messages.coverLetterMin),
    website: z.string().optional(),
  });
}

export type CareerApplicationFormValues = z.infer<
  ReturnType<typeof createCareerApplicationSchema>
>;

/** Server-side schema (without localized messages). */
export const careerApplicationServerSchema = z.object({
  jobKey: z.enum(careerJobKeys),
  jobTitle: z.string().trim().min(1).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(phonePattern).max(30),
  email: z.string().trim().email().max(200),
  age: z.coerce.number().int().min(16).max(80),
  coverLetter: z.string().trim().min(30).max(5000),
  locale: z.enum(["es", "en", "ru"]),
  website: z.string().optional(),
  recaptchaToken: z
    .preprocess((value) => (value === null || value === "" ? undefined : value), z.string().optional()),
});
