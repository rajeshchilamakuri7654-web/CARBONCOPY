/**
 * @file src/app/dashboard/page.tsx
 * @description User analytics dashboard page.
 *
 * Refactored to:
 * - Use typed state (no any[])
 * - Decompose into reusable sub-components
 * - Memoize all derived data with useMemo
 * - Add aria-live region for async state announcements
 * - Proper loading / empty states
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import {
  Flame, Trees, TrendingDown, PlusCircle,
  Sparkles, Loader2, Activity, Zap, Coins
} from "lucide-react";
import { calculateTreesEquivalent } from "@/lib/carbonCalculator";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GoalsList } from "@/components/dashboard/GoalsList";
import { GoalModal } from "@/components/dashboard/GoalModal";
import { GridIntelligenceCard } from "@/components/dashboard/GridIntelligenceCard";
import { Web3Wallet } from "@/components/social/Web3Wallet";
import type { EmissionRecord, Goal, EmissionChartPoint } from "@/types";
import type { CreateGoalInput } from "@/lib/validators";

const EmissionsChart = dynamic(() => import("@/components/dashboard/EmissionsChart").then(m => m.EmissionsChart), { ssr: false });
const CarbonScoreRadial = dynamic(() => import("@/components/dashboard/CarbonScoreRadial").then(m => m.CarbonScoreRadial), { ssr: false });
const Sparkline = dynamic(() => import("@/components/dashboard/Sparkline").then(m => m.Sparkline), { ssr: false });

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [entries, setEntries] = useState<EmissionRecord[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [liveSync, setLiveSync] = useState(true);

  // Redirect to login if unauthenticated (backup — middleware handles edge)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Manage sync-paused CSS class on body
  useEffect(() => {
    document.body.classList.toggle("sync-paused", !liveSync);
    return () => document.body.classList.remove("sync-paused");
  }, [liveSync]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [emRes, goalsRes] = await Promise.all([
        fetch("/api/emissions"),
        fetch("/api/goals"),
      ]);

      if (emRes.ok) {
        const emData = await emRes.json() as { entries: EmissionRecord[] };
        setEntries(emData.entries);
      }
      if (goalsRes.ok) {
        const gData = await goalsRes.json() as { goals: Goal[] };
        setGoals(gData.goals);
      }
    } catch {
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, fetchDashboardData]);

  const handleCreateGoal = useCallback(async (data: CreateGoalInput) => {
    setIsCreatingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setGoalModalOpen(false);
        await fetchDashboardData();
      }
    } catch {
      // Error handled by GoalModal form state
    } finally {
      setIsCreatingGoal(false);
    }
  }, [fetchDashboardData]);

  // ─── Memoized derived data ──────────────────────────────────────────────────

  const { latestEntry, prevEmissions, totalEmissions, reductionPercent, treesPlanted } =
    useMemo(() => {
      const latest = entries[entries.length - 1] ?? null;
      const previous = entries[entries.length - 2] ?? null;
      const total = latest?.totalEmissions ?? 0;
      const prev = previous?.totalEmissions ?? 0;
      const reduction =
        prev > 0 ? Number((((prev - total) / prev) * 100).toFixed(1)) : 0;
      const trees = latest
        ? calculateTreesEquivalent(Math.max(0, 450 - total) * 12)
        : 0;
      return {
        latestEntry: latest,
        prevEmissions: prev,
        totalEmissions: total,
        reductionPercent: reduction,
        treesPlanted: trees,
      };
    }, [entries]);

  const trendData = useMemo<EmissionChartPoint[]>(
    () =>
      entries.map((entry) => {
        const d = new Date(entry.date);
        return {
          name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          total: Number(entry.totalEmissions.toFixed(1)),
          transport: Number(entry.transportEmissions.toFixed(1)),
          electricity: Number(entry.electricityEmissions.toFixed(1)),
          food: Number(entry.foodEmissions.toFixed(1)),
          waste: Number(entry.wasteEmissions.toFixed(1)),
        };
      }),
    [entries]
  );

  const scorePercent = useMemo(
    () => (latestEntry ? Math.min(100, Math.max(0, 100 - (totalEmissions / 450) * 100)) : 0),
    [latestEntry, totalEmissions]
  );

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-label="Loading dashboard data"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-500 tracking-widest uppercase">
            Synchronizing Data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4"
      >
        <p className="text-slate-700 font-semibold">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="glow-btn px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const userPoints = session?.user?.points ?? 100;
  const userStreak = session?.user?.streak ?? 1;
  const firstName = session?.user?.name?.split(" ")[0] ?? "User";

  return (
    <>
      {/* Live region for async announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="dashboard-status" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10 pt-24 pb-12 w-full"
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
              Overview
            </h1>
            <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
              Welcome back, {firstName}. Your sustainability metrics and carbon reduction
              trajectory are synchronized.
            </p>
          </div>
          <Link
            href="/calculator"
            className="glow-btn px-6 py-3 rounded-full text-sm font-extrabold flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Log Metric
          </Link>
        </motion.div>

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="Key performance indicators"
        >
          {/* Monthly Footprint */}
          <KpiCard
            label="Monthly Footprint"
            value={totalEmissions}
            unit="kg CO₂"
            sparkline={
              trendData.length > 1 ? (
                <Sparkline data={trendData} />
              ) : undefined
            }
          />

          {/* MoM Reduction */}
          <KpiCard
            label="MoM Reduction"
            value={
              <span className={reductionPercent >= 0 ? "text-emerald-500" : "text-red-500"}>
                {reductionPercent >= 0 ? "+" : ""}{reductionPercent}%
              </span>
            }
            badge={
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <TrendingDown className="h-3 w-3" aria-hidden="true" />
                vs last month
              </div>
            }
          />

          {/* Trees Equivalent */}
          <KpiCard
            label="Offset Equivalent"
            value={treesPlanted}
            unit="Trees/yr"
            icon={<Trees className="h-8 w-8 text-sky-500/80" />}
          />

          {/* Activity & Streak */}
          <KpiCard
            label="Activity & Streak"
            value={userPoints}
            unit="pts"
            accentColor="border-l-amber-400"
            badge={
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                <Flame className="h-3 w-3 fill-amber-500" aria-hidden="true" />
                {userStreak} Days Active
              </div>
            }
          />
        </motion.div>

        {/* ── Grid Intelligence & Web3 ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GridIntelligenceCard />
          <Web3Wallet />
        </motion.div>

        {/* ── Charts Section ────────────────────────────────────────────── */}
        {trendData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main emissions trajectory chart */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8"
            >
              <EmissionsChart data={trendData} />
            </motion.div>

            {/* Sidebar: AI Insights + Carbon Score */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              {/* AI Insights */}
              <div
                className="glass-panel rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border-emerald-100"
                role="region"
                aria-label="AI analysis insights"
              >
                <div aria-hidden="true" className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 blur-3xl" />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-emerald-900 tracking-tight">AI Analysis</h3>
                </div>
                <p className="text-xs text-emerald-800/80 leading-relaxed z-10">
                  {reductionPercent > 5
                    ? "Outstanding progress. Your total footprint decreased significantly compared to your last log. Maintain this trajectory to hit your yearly targets."
                    : "Your emissions remain stable. Consider auditing your electricity usage or implementing a 2-day plant-based diet to force a downward trend."}
                </p>
                <Link
                  href="/voice-agent"
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-widest mt-2 z-10 focus-visible:outline-none focus-visible:underline"
                  aria-label="Speak to your AI sustainability agent"
                >
                  Speak to Agent →
                </Link>
              </div>

              {/* Carbon Score radial */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center flex-1">
                <CarbonScoreRadial score={scorePercent} />
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-6 border-dashed border-2 border-slate-200"
            role="region"
            aria-label="No emissions data yet"
          >
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Activity className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">No metrics logged</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Your analytics dashboard will populate automatically once you submit your first
                carbon footprint calculation.
              </p>
            </div>
            <Link
              href="/calculator"
              className="glow-btn rounded-full px-8 py-3 text-sm font-extrabold mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Calculate Initial Baseline
            </Link>
          </motion.div>
        )}

        {/* ── Goals & Achievements ──────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals timeline */}
          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <GoalsList
              goals={goals}
              onNewGoal={() => setGoalModalOpen(true)}
            />
          </div>

          {/* Achievements */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Achievements
              </h3>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              role="list"
              aria-label="Your earned achievements"
            >
              {[
                {
                  icon: Activity,
                  colorClass: "text-emerald-600",
                  bg: "border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50",
                  iconBg: "bg-emerald-100 border-emerald-200",
                  title: "First Steps",
                  desc: "Platform integrated.",
                },
                {
                  icon: Trees,
                  colorClass: "text-sky-600",
                  bg: "border-sky-100 bg-sky-50/50 hover:bg-sky-50",
                  iconBg: "bg-sky-100 border-sky-200",
                  title: "Eco Explorer",
                  desc: "Logged 3+ metrics.",
                },
              ].map(({ icon: Icon, colorClass, bg, iconBg, title, desc }) => (
                <div
                  key={title}
                  role="listitem"
                  className={`rounded-2xl border ${bg} p-4 flex gap-4 transition-colors group`}
                  aria-label={`Achievement: ${title} — ${desc}`}
                >
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl ${iconBg} border flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{title}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">
                      {desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Live Sync Toggle ──────────────────────────────────────────── */}
        <div
          className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 hover:shadow-2xl transition-all"
          role="region"
          aria-label="Live data sync status"
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
              liveSync ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {liveSync && (
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
            {liveSync ? "Live Sync Active" : "Sync Paused"}
          </span>
          <button
            onClick={() => setLiveSync((v) => !v)}
            role="switch"
            aria-checked={liveSync}
            aria-label={liveSync ? "Pause live data sync" : "Resume live data sync"}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-inner ${
              liveSync ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                liveSync ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* ── Goal Creation Modal ─────────────────────────────────────────── */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={handleCreateGoal}
        isSubmitting={isCreatingGoal}
      />
    </>
  );
}
