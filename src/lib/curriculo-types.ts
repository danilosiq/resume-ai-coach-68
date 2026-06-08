import { z } from "zod";

export const TimelineItemSchema = z.object({
  title: z.string().min(1, "Obrigatório"),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
});

export const FormSchema = z.object({
  fullName: z.string().min(1, "Informe seu nome"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Informe um telefone"),
  link: z.string(),
  education: z.array(TimelineItemSchema),
  experience: z.array(TimelineItemSchema),
  jobLink: z.string(),
  jobDescription: z.string(),
});

export type FormValues = z.infer<typeof FormSchema>;
export type TimelineItem = z.infer<typeof TimelineItemSchema>;

export const AIResultSchema = z.object({
  name: z.string(),
  suggestedTitle: z.string(),
  contacts: z.object({
    email: z.string().default(""),
    phone: z.string().default(""),
    link: z.string().default(""),
  }),
  summary: z.string(),
  skills: z.array(z.string()).default([]),
  workExperience: z
    .array(
      z.object({
        title: z.string(),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        title: z.string(),
        period: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        title: z.string(),
        period: z.string().default(""),
        description: z.string().default(""),
      }),
    )
    .default([]),
  compatibilityScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  studyRecommendations: z.array(z.string()).default([]),
  finalReview: z.string(),
  analysisSummary: z.string(),
});

export type AIResult = z.infer<typeof AIResultSchema>;
