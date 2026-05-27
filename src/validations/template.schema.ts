import { z } from "zod";

export const templateSchema = z.object({
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(50, "Template name must be under 50 characters"),
  doctorName: z
    .string()
    .max(50, "Doctor name must be under 50 characters")
    .optional()
    .or(z.literal("")),
  warrantyYears: z
    .number()
    .min(1)
    .max(30)
    .optional(),
  materialType: z
    .string()
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(200, "Notes must be under 200 characters")
    .optional()
    .or(z.literal("")),
  cardBgImage: z.string().optional(),
  layoutFront: z.string().optional(),
  layoutBack: z.string().optional(),
  fontStyle: z.string().optional(),
  primaryColor: z.string().optional(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
