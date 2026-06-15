/**
 * @file src/lib/validators.ts
 * @description Zod validation schemas for all API request bodies.
 * Used server-side to validate incoming requests before processing.
 * Provides type-safe, auto-inferred TypeScript types from schema definitions.
 */

import { z } from "zod";

// ─── Auth Validators ──────────────────────────────────────────────────────────

/**
 * Schema for user registration.
 * Enforces minimum password length and email format.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be under 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Emission Validators ──────────────────────────────────────────────────────

/** Valid food type values */
const FOOD_TYPES = ["vegetarian", "mixed", "non-vegetarian"] as const;

/**
 * Schema for creating a new emission record.
 * All distance/usage values must be non-negative numbers.
 */
export const createEmissionSchema = z.object({
  carDistance: z.number().min(0, "Distance must be non-negative").default(0),
  bikeDistance: z.number().min(0, "Distance must be non-negative").default(0),
  busDistance: z.number().min(0, "Distance must be non-negative").default(0),
  trainDistance: z.number().min(0, "Distance must be non-negative").default(0),
  flightDistance: z.number().min(0, "Distance must be non-negative").default(0),
  electricityKwh: z.number().min(0, "Electricity usage must be non-negative").default(0),
  foodType: z.enum(["vegetarian", "mixed", "non-vegetarian"], {
    message: "Food type must be vegetarian, mixed, or non-vegetarian",
  }).default("mixed"),
  wasteKg: z.number().min(0, "Waste must be non-negative").default(0),
});

export type CreateEmissionInput = z.infer<typeof createEmissionSchema>;

// ─── Goal Validators ──────────────────────────────────────────────────────────

/** Valid goal category values */
const GOAL_CATEGORIES = ["transport", "electricity", "food", "waste", "overall"] as const;

/**
 * Schema for creating a new reduction goal.
 */
export const createGoalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  category: z.enum(["transport", "electricity", "food", "waste", "overall"], {
    message: "Invalid goal category",
  }),
  targetReduction: z.number().min(0).max(100, "Reduction percentage must be 0-100"),
  targetValue: z.number().positive("Target value must be greater than 0"),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  endDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: "End date must be a valid future date" }
  ),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// ─── Article Validators ───────────────────────────────────────────────────────

/** Valid article category values */
const ARTICLE_CATEGORIES = ["General", "Energy", "Food", "Transport", "Waste"] as const;

/**
 * Schema for publishing a new education article (admin only).
 */
export const publishArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(300, "Title must be under 300 characters"),
  category: z.enum(["General", "Energy", "Food", "Transport", "Waste"], {
    message: "Invalid article category",
  }),
  summary: z
    .string()
    .trim()
    .min(20, "Summary must be at least 20 characters")
    .max(500, "Summary must be under 500 characters"),
  content: z
    .string()
    .trim()
    .min(50, "Content must be at least 50 characters")
    .max(50000, "Content must be under 50,000 characters"),
  carbonSaved: z.number().min(0, "Carbon saved must be non-negative").default(0),
});

export type PublishArticleInput = z.infer<typeof publishArticleSchema>;

// ─── Helper Utilities ─────────────────────────────────────────────────────────

/**
 * Safely parse and validate an unknown request body against a Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @param data - Raw data to validate (typically from req.json())
 * @returns Object with `success` flag and either `data` or `error` message
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return {
    success: false,
    error: firstError?.message ?? "Validation failed",
  };
}
