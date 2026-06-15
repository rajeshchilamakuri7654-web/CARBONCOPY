"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity, Sparkles, BarChart3, Trophy, ArrowRight,
  Shield, Globe, Users, Zap, Flame, Calculator, Mic
} from "lucide-react";
import { calculateTreesEquivalent } from "@/lib/carbonCalculator";

export default function Home() {
  const [carDistance, setCarDistance] = useState(300);
  const [electricity, setElectricity] = useState(200);
  const [food, setFood] = useState("mixed");

  const carCO2 = carDistance * 0.18;
  const electCO2 = electricity * 0.45;
  const foodCO2 =
    food === "vegetarian" ? 1.5 * 30.5 : food === "non-vegetarian" ? 4.0 * 30.5 : 2.5 * 30.5;
  const totalQuickCO2 = Number((carCO2 + electCO2 + foodCO2).toFixed(1));
  const typicalAverage = 450;
  const savedCO2 = Math.max(0, typicalAverage - totalQuickCO2);
  const treesEquiv = calculateTreesEquivalent(savedCO2 * 12);

  const impactLevel =
    totalQuickCO2 < 200 ? { label: "Low Impact", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" } :
    totalQuickCO2 < 400 ? { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" } :
    { label: "High Impact", color: "text-red-600", bg: "bg-red-50 border-red-200" };

  return (
    <div className="flex flex-col gap-24 py-8">

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col lg:flex-row items-center gap-14 pt-4">

        {/* Left: Copy */}
        <div className="flex-1 flex flex-col gap-7 text-left">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-700">CarbonIQ v1.0 — Now Available</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
            Measure, Monitor &amp;<br />
            <span className="bg-gradient-to-r from-emerald-500 via-mint-500 to-sky-500 bg-clip-text text-transparent">
              Reduce Your Carbon
            </span>
          </h1>

          <p className="text-slate-500 text-lg md:text-xl max-w-xl font-normal leading-relaxed">
            The enterprise-grade ESG carbon footprint intelligence platform. Calculate
            daily activity emissions, unlock AI-powered reduction plans, and track
            progress with rich analytics dashboards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-1">
            <Link
              href="/register"
              className="glow-btn flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold transition-all"
            >
              Start Free Tracking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/calculator"
              className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-600 shadow-sm px-7 py-3.5 text-base font-semibold transition-all"
            >
              <Calculator className="h-4 w-4" />
              Carbon Calculator
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap gap-8 items-center mt-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-600">10,000+ Tonnes CO₂ Tracked</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-semibold text-slate-600">50,000+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-semibold text-slate-600">ESG Compliant</span>
            </div>
          </div>
        </div>

        {/* Right: Live Estimator Widget */}
        <div className="flex-1 w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl relative rounded-3xl p-7 md:p-8 flex flex-col gap-6 overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-500" />
                  Live Carbon Estimator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Drag sliders — no sign-up required.</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${impactLevel.bg} ${impactLevel.color}`}>
                {impactLevel.label}
              </span>
            </div>

            {/* Driving slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Monthly Driving</span>
                <span className="text-emerald-600">{carDistance} km</span>
              </div>
              <input type="range" min="0" max="2000" step="50" value={carDistance}
                onChange={(e) => setCarDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{carCO2.toFixed(0)} kg CO₂</span>
            </div>

            {/* Electricity slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Monthly Electricity</span>
                <span className="text-sky-600">{electricity} kWh</span>
              </div>
              <input type="range" min="0" max="800" step="20" value={electricity}
                onChange={(e) => setElectricity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer" />
              <span className="text-[10px] text-slate-500 text-right">{electCO2.toFixed(0)} kg CO₂</span>
            </div>

            {/* Diet selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-600">Primary Diet</span>
              <div className="grid grid-cols-3 gap-2">
                {["vegetarian", "mixed", "non-vegetarian"].map((option) => (
                  <button key={option} onClick={() => setFood(option)}
                    className={`rounded-xl py-2 px-1 text-xs font-bold capitalize transition-all border ${
                      food === option
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {option.split("-")[0]}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 text-right">{foodCO2.toFixed(0)} kg CO₂</span>
            </div>

            {/* Results grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
              <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">Est. Footprint</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {totalQuickCO2} <span className="text-xs font-normal text-slate-500">kg/mo</span>
                </span>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 shadow-sm">
                <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wide flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Offset Trees
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {treesEquiv} <span className="text-xs font-normal text-emerald-500/80">/ yr</span>
                </span>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 italic">
              Based on IPCC & EPA global emission factors.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto">Platform Features</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Everything you need to reach net-zero
          </h2>
          <p className="text-slate-500">
            A comprehensive analytics suite built to visualize, gamify, and drive
            sustainability for individuals and enterprises alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Calculator, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", title: "Precision Calculator", desc: "Standardized, math-accurate tracking covering transportation, flights, utility meters, dietary splits, and municipal waste." },
            { icon: BarChart3, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-100", title: "Interactive Analytics", desc: "Premium dashboards with Recharts — carbon breakdown pie charts, monthly trends, and reduction curves." },
            { icon: Mic, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100", title: "AI Voice Agent", desc: "Speak directly to your personal AI sustainability assistant. Get real-time carbon reduction advice through voice interaction." },
            { icon: Flame, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", title: "Streak Achievements", desc: "Consecutive login streaks, progressive eco-points rewards, and collectible achievement badges to keep you engaged." },
            { icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", title: "Community Leaderboard", desc: "Rankings based on carbon reduction values, eco-points earned, and milestones met for friendly sustainability challenges." },
            { icon: Shield, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", title: "Admin Controls", desc: "Administrative panels to monitor platform engagement, publish articles, review user logs, and audit scores." },
          ].map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} ${border} border flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 pb-4 text-center text-xs text-slate-400">
        <p>© 2026 CarbonIQ Intelligence. Powered by Earth.</p>
      </footer>
    </div>
  );
}
