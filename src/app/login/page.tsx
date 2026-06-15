/**
 * @file src/app/login/page.tsx
 * @description User login page.
 * Uses react-hook-form with Zod validation for type-safe form handling.
 * Full accessibility: aria-describedby error links, autocomplete attributes,
 * and live error announcements.
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Activity, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/Button";

const inputBaseClass = [
  "w-full rounded-xl border border-slate-700/60 bg-slate-900/50",
  "py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600",
  "transition-all focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30",
  "aria-invalid:border-red-500/60 aria-invalid:ring-red-500/20",
].join(" ");

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setServerError("Invalid email or password. Please try again.");
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none rounded-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-indigo-500/6 blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25"
          >
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your CarbonIQ dashboard</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
          aria-label="Sign in to CarbonIQ"
        >
          {/* Server-side error alert */}
          {serverError && (
            <div
              id="login-server-error"
              role="alert"
              aria-live="assertive"
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-bold text-slate-400 uppercase tracking-wide"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={inputBaseClass}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p id="login-email-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-bold text-slate-400 uppercase tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                className={inputBaseClass}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p id="login-password-error" role="alert" className="text-[11px] text-red-400 font-semibold">
                {errors.password.message}
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
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          New to CarbonIQ?{" "}
          <Link
            href="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded"
          >
            Create an account
          </Link>
        </div>

        {/* Demo credentials — collapsed details element for accessibility */}
        <details className="rounded-2xl border border-slate-800/60 bg-slate-900/30 text-[11px] text-slate-500">
          <summary
            className="cursor-pointer px-4 py-3 font-bold text-slate-400 list-none flex items-center justify-between select-none hover:text-slate-300 transition-colors"
            aria-label="Show demo account credentials"
          >
            <span>Demo Accounts</span>
            <span aria-hidden="true" className="text-slate-600">▾</span>
          </summary>
          <div className="px-4 pb-3 flex flex-col gap-1.5 border-t border-slate-800/40 pt-3">
            <div className="flex justify-between">
              <span>Standard: <strong className="text-slate-300">user@carbon.com</strong></span>
              <span>Pass: <strong className="text-slate-300">password123</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Admin: <strong className="text-slate-300">admin@carbon.com</strong></span>
              <span>Pass: <strong className="text-slate-300">password123</strong></span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
