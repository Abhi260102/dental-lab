import { z } from "zod";

export const warrantyCardSchema = z.object({
  jobId: z
    .string()
    .min(3, "Job ID must be at least 3 characters")
    .max(30, "Job ID must be under 30 characters")
    .regex(/^[a-zA-Z0-9\-_]+$/, "Job ID can only contain alphanumeric characters, hyphens, and underscores"),
  doctorName: z
    .string()
    .min(2, "Doctor name must be at least 2 characters")
    .max(50, "Doctor name must be under 50 characters"),
  patientName: z
    .string()
    .min(2, "Patient name must be at least 2 characters")
    .max(50, "Patient name must be under 50 characters"),
  toothNumber: z
    .string()
    .min(1, "Tooth designation is required")
    .max(150, "Tooth designation is too long"),
  warrantyYears: z
    .number()
    .min(1, "Warranty must be at least 1 year")
    .max(30, "Warranty cannot exceed 30 years"),
  materialType: z
    .string()
    .min(2, "Material type must be at least 2 characters"),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
  notes: z
    .string()
    .max(200, "Notes must be under 200 characters")
    .optional()
    .or(z.literal("")),
  signature: z.string().optional(),
  labLogo: z.string().optional(),
  labPhone: z.string().optional(),
  labEmail: z.string().optional(),
  labWebsite: z.string().optional(),
  labAddress: z.string().optional(),
  cardBgImage: z.string().optional(),
});

export type WarrantyCardInput = z.infer<typeof warrantyCardSchema>;
