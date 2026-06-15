/**
 * @file src/app/register/page.tsx
 * @description User registration page.
 * Uses react-hook-form + Zod for client-side validation with real-time
 * password strength feedback and full ARIA accessibility compliance.
 */

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Lock, Mail, User, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Extended registration schema with password confirmation */
const registerFormSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

/** Password strength calculation */
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "bg-slate-200" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-400" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

const inputBaseClass = [
  "w-full rounded-xl border border-slate-700/60 bg-slate-900/50",
  "py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600",
  "transition-all focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30",
  "aria-invalid:border-red-500/60",
].join(" ");

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  });

  const passwordValue = watch("password", "");
  const strength = useMemo(() => getPasswordStrength(passwordValue), [passwordValue]);

  const onSubmit = async (data: RegisterFormInput) => {
    setServerError(null);
    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      const registerData = await registerRes.json() as { error?: string };

      if (!registerRes.ok) {
        setServerError(registerData.error ?? "Failed to create account");
        return;
      }

      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        setServerError("Account created. Please log in manually.");
        router.push("/login");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none rounded-3xl"
        />

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-violet-500/25"
          >
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Join CarbonIQ</h1>
            <p className="text-sm text-slate-400 mt-1">
              Calculate, track, and reduce your carbon footprint.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
          aria-label="Create a CarbonIQ account"
        >
          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-name" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Full Name <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "reg-name-error" : undefined}
                className={inputBaseClass}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p id="reg-name-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-email" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Email Address <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "reg-email-error" : undefined}
                className={inputBaseClass}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p id="reg-email-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-password" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Password <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={[
                  "reg-password-strength",
                  errors.password ? "reg-password-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                className={inputBaseClass}
                {...register("password")}
              />
            </div>

            {/* Password strength indicator */}
            {passwordValue && (
              <div id="reg-password-strength" aria-live="polite" aria-atomic="true">
                <div className="flex gap-1 mt-1" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength.score ? strength.color : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Password strength:{" "}
                  <span className="font-bold text-slate-300">{strength.label}</span>
                </p>
              </div>
            )}

            {errors.password && (
              <p id="reg-password-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-confirm" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Confirm Password <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "reg-confirm-error" : undefined}
                className={inputBaseClass}
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <p id="reg-confirm-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            className="w-full mt-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
