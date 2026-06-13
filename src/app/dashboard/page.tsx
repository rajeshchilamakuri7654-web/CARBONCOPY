"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import {
  Flame, Trophy, Trees, Calendar, ArrowUpRight, Target, Activity, CheckCircle2,
  TrendingDown, PlusCircle, Sparkles, Loader2, Compass, Shield
} from "lucide-react";
import { calculateTreesEquivalent } from "@/lib/carbonCalculator";

// Animation Variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Premium Tooltip for Recharts (Eco-Light Mode)
const PremiumTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-xs text-slate-600 capitalize">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{Number(entry.value).toFixed(1)} kg</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [entries, setEntries] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveSync, setLiveSync] = useState(true);

  // Modals
  const [newGoalModal, setNewGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("transport");
  const [goalTargetReduction, setGoalTargetReduction] = useState(15);
  const [goalTargetValue, setGoalTargetValue] = useState(100);
  const [goalEndDate, setGoalEndDate] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (!liveSync) {
        document.body.classList.add("sync-paused");
      } else {
        document.body.classList.remove("sync-paused");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("sync-paused");
      }
    };
  }, [liveSync]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [emRes, goalsRes] = await Promise.all([
        fetch("/api/emissions"),
        fetch("/api/goals")
      ]);

      if (emRes.ok) {
        const emData = await emRes.json();
        const sortedEntries = [...emData.entries].reverse();
        setEntries(sortedEntries);
      }
      if (goalsRes.ok) {
        const gData = await goalsRes.json();
        setGoals(gData.goals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTargetValue || !goalEndDate) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle, category: goalCategory, targetReduction: Number(goalTargetReduction),
          targetValue: Number(goalTargetValue), currentValue: 90, endDate: goalEndDate,
        }),
      });
      if (res.ok) {
        setGoalTitle(""); setNewGoalModal(false); fetchDashboardData();
      }
    } catch (err) { console.error(err); }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <span className="text-sm font-semibold text-slate-500 tracking-widest uppercase">Synchronizing Data...</span>
        </div>
      </div>
    );
  }

  const totalLogs = entries.length;
  const latestEntry = entries[entries.length - 1] || null;
  const previousEntry = entries[entries.length - 2] || null;

  const totalEmissions = latestEntry ? latestEntry.totalEmissions : 0;
  const prevEmissions = previousEntry ? previousEntry.totalEmissions : 0;

  let reductionPercent = 0;
  if (prevEmissions > 0) {
    reductionPercent = Number((((prevEmissions - totalEmissions) / prevEmissions) * 100).toFixed(1));
  }

  const treesPlanted = latestEntry ? calculateTreesEquivalent(Math.max(0, 450 - totalEmissions) * 12) : 0;

  // Recharts Data Parsing
  const trendData = entries.map((entry) => {
    const d = new Date(entry.date);
    return {
      name: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: Number(entry.totalEmissions.toFixed(1)),
      transport: Number(entry.transportEmissions.toFixed(1)),
      electricity: Number(entry.electricityEmissions.toFixed(1)),
      food: Number(entry.foodEmissions.toFixed(1)),
      waste: Number(entry.wasteEmissions.toFixed(1)),
    };
  });

  const pieData = latestEntry ? [
    { name: "Transport", value: latestEntry.transportEmissions, color: "#10b981" }, // Emerald
    { name: "Electricity", value: latestEntry.electricityEmissions, color: "#0ea5e9" }, // Sky Blue
    { name: "Food", value: latestEntry.foodEmissions, color: "#34d399" }, // Mint
    { name: "Waste", value: latestEntry.wasteEmissions, color: "#f59e0b" }, // Amber
  ].filter(i => i.value > 0) : [];

  const scorePercent = latestEntry ? Math.min(100, Math.max(0, 100 - ((totalEmissions / 450) * 100))) : 0;
  const radialData = [{ name: "Score", value: scorePercent, fill: "#10b981" }];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={`flex flex-col gap-10 pt-24 pb-12 w-full max-w-7xl mx-auto px-4 ${!liveSync ? "sync-paused" : ""}`}
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            Overview
          </h1>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}. Your sustainability metrics and carbon reduction trajectory are synchronized.
          </p>
        </div>
        
        <Link
          href="/calculator"
          className="glow-btn px-6 py-3 rounded-full text-sm font-extrabold flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Log Metric
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Footprint with Sparkline */}
        <motion.div whileHover={{ y: -4 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group h-40">
          <div className="z-10 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Footprint</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{totalEmissions}</span>
              <span className="text-xs font-semibold text-slate-500">kg CO₂</span>
            </div>
          </div>
          {totalLogs > 1 && (
            <div className="absolute -bottom-2 left-0 right-0 h-16 opacity-40 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Reduction with Sparkline */}
        <motion.div whileHover={{ y: -4 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group h-40">
          <div className="z-10 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MoM Reduction</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-black ${reductionPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {reductionPercent >= 0 ? `${reductionPercent}%` : `${Math.abs(reductionPercent)}%`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2">
              <TrendingDown className="h-3 w-3" /> vs last month
            </div>
          </div>
        </motion.div>

        {/* Tree Offset */}
        <motion.div whileHover={{ y: -4 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group h-40">
          <div className="z-10 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offset Equivalent</span>
            <div className="flex items-center gap-3 mt-2">
              <Trees className="h-8 w-8 text-sky-500/80" />
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{treesPlanted}</span>
                <span className="text-xs font-semibold text-slate-500">Trees/yr</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Score & Streak */}
        <motion.div whileHover={{ y: -4 }} className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group h-40 border-l-4 border-l-amber-400">
          <div className="z-10 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity & Streak</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{(session?.user as any)?.points || 100}</span>
              <span className="text-xs font-semibold text-slate-500">pts</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              <Flame className="h-3 w-3 fill-amber-500" />
              {(session?.user as any)?.streak || 1} Days Active
            </div>
          </div>
        </motion.div>

      </motion.div>

      {totalLogs > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Emissions Trajectory</h3>
                <p className="text-xs text-slate-500 mt-1">Aggregated breakdown of your greenhouse output.</p>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTransport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="gradElectricity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<PremiumTooltip />} />
                  <Area type="monotone" dataKey="transport" stackId="1" stroke="#10b981" fill="url(#gradTransport)" />
                  <Area type="monotone" dataKey="electricity" stackId="1" stroke="#0ea5e9" fill="url(#gradElectricity)" />
                  <Area type="monotone" dataKey="food" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="waste" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sidebar Area: Radial Gauge & Insights */}
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            
            {/* AI Insights Panel */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 blur-3xl" />
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-emerald-900 tracking-tight">AI Analysis</h3>
              </div>
              <p className="text-xs text-emerald-800/80 leading-relaxed z-10">
                {reductionPercent > 5 
                  ? "Outstanding progress. Your total footprint decreased significantly compared to your last log. Maintain this trajectory to hit your yearly targets."
                  : "Your emissions remain stable. Consider auditing your electricity usage or implementing a 2-day plant-based diet to force a downward trend."}
              </p>
              <Link href="/voice-agent" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-widest mt-2 z-10">
                Speak to Agent →
              </Link>
            </div>

            {/* Carbon Score Radial */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 w-full text-left">Carbon Score</h3>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={radialData}
                    startAngle={180} endAngle={-180}
                  >
                    <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900">{scorePercent.toFixed(0)}</span>
                  <span className="text-[9px] text-slate-500 font-bold">/ 100</span>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      ) : (
        <motion.div variants={itemVariants} className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-6 border-dashed border-2 border-slate-200">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">No metrics logged</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Your analytics dashboard will populate automatically once you submit your first carbon footprint calculation.
            </p>
          </div>
          <Link
            href="/calculator"
            className="glow-btn rounded-full px-8 py-3 text-sm font-extrabold mt-4"
          >
            Calculate Initial Baseline
          </Link>
        </motion.div>
      )}

      {/* Gamification & Goals Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Progress Timeline (Goals) */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-4.5 w-4.5 text-emerald-500" />
                Target Initiatives
              </h3>
            </div>
            <button
              onClick={() => setNewGoalModal(true)}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 uppercase tracking-widest transition-colors"
            >
              + New Initiative
            </button>
          </div>

          <div className="flex flex-col gap-5 mt-2 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
            {goals.length > 0 ? (
              goals.map((goal, i) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 bg-white text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <div className={`w-2 h-2 rounded-full ${goal.completed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-emerald-400'}`} />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-900 truncate pr-2">{goal.title}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${goal.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          {goal.completed ? "Done" : "Active"}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
                        <div className={`h-full rounded-full transition-all duration-1000 ${goal.completed ? 'bg-emerald-500' : 'bg-emerald-400'}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="text-[9px] text-slate-500 flex justify-between">
                        <span className="uppercase">{goal.category}</span>
                        <span>{percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-slate-400 italic py-8">No initiatives active.</div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              Achievements
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {session?.user && (
              <>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex gap-4 hover:bg-emerald-50 transition-colors group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">First Steps</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">Platform integrated.</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 flex gap-4 hover:bg-sky-50 transition-colors group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Eco Explorer</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">Logged 3+ metrics.</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 flex gap-4 hover:bg-purple-50 transition-colors group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Carbon Warrior</span>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-1">Sub-250kg achieved.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </motion.div>

      {/* Goal Modal */}
      {newGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-white rounded-3xl p-8 flex flex-col gap-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">New Target Initiative</h3>
            <form onSubmit={handleCreateGoal} className="flex flex-col gap-5 text-xs">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Description</label>
                <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Category</label>
                  <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:border-emerald-500">
                    <option value="transport">Transport</option>
                    <option value="electricity">Electricity</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Reduction %</label>
                  <input type="number" min="1" max="100" value={goalTargetReduction} onChange={(e) => setGoalTargetReduction(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Target Value</label>
                  <input type="number" value={goalTargetValue} onChange={(e) => setGoalTargetValue(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:border-emerald-500" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">End Date</label>
                  <input type="date" value={goalEndDate} onChange={(e) => setGoalEndDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:outline-none focus:border-emerald-500" required />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setNewGoalModal(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl text-slate-600 font-bold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 glow-btn py-3 rounded-xl font-extrabold transition-colors">Launch Initiative</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Widget: Live Sync Toggle */}
      <div className="fixed bottom-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 hover:shadow-2xl transition-all">
        <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${liveSync ? 'text-emerald-600' : 'text-slate-500'}`}>
          {liveSync && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          {liveSync ? "Live Sync Active" : "Sync Paused"}
        </span>
        <button 
          onClick={() => setLiveSync(!liveSync)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shadow-inner ${liveSync ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${liveSync ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

    </motion.div>
  );
}
