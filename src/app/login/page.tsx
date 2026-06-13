"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.refresh();
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none rounded-3xl" />
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-indigo-500/6 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1">Sign in to your CarbonIQ dashboard</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 text-sm font-bold disabled:opacity-50 mt-1 shadow-lg shadow-indigo-500/20 transition-all"
          >
            {loading ? "Signing In..." : "Sign In"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          New to CarbonIQ?{" "}
          <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
            Create an account
          </Link>
        </div>

        {/* Demo credentials */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 text-[11px] text-slate-500 flex flex-col gap-1.5">
          <p className="font-bold text-slate-400">Demo Accounts</p>
          <div className="flex justify-between">
            <span>Standard: <strong className="text-slate-300">user@carbon.com</strong></span>
            <span>Pass: <strong className="text-slate-300">password123</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Admin: <strong className="text-slate-300">admin@carbon.com</strong></span>
            <span>Pass: <strong className="text-slate-300">password123</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
