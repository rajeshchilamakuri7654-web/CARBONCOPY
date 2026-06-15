/**
 * @file src/lib/env.ts
 * @description Environment variable validation using Zod.
 * Validates required env vars at module load time, providing clear error messages
 * instead of cryptic runtime failures deep in the application.
 */

import { z } from "zod";

const envSchema = z.object({
  /** NextAuth secret — required for JWT signing */
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  /** NextAuth URL — required for OAuth redirect URLs */
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL").optional(),
  /** Node environment */
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables.
 * Accessing this at module load time will throw a descriptive error if any
 * required variable is missing or malformed.
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues
      .map((e: z.ZodIssue) => `  • ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(
      `\n\n❌ Invalid environment variables:\n${errors}\n\nPlease check your .env file.\n`
    );
  }
  return result.data;
}

export const env = validateEnv();
