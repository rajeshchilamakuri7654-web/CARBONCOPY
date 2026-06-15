"use client";

import { useState, useEffect } from "react";
import { Zap, Wind, AlertTriangle, CloudRain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

type GridState = "clean" | "dirty" | "mixed";

export function GridIntelligenceCard() {
  const [gridState, setGridState] = useState<GridState>("clean");
  const [loading, setLoading] = useState(true);

  // Simulate pinging WattTime/Electricity Maps API on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setGridState("clean"); // In a real app, this is fetched from the API
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const Config = {
    clean: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      icon: <Wind className="h-10 w-10 text-emerald-400" />,
      title: "Renewable Energy Peak",
      desc: "Local wind and solar output is currently exceptionally high.",
      recommendation: "Perfect time to run the dishwasher, washing machine, or charge your EV!",
    },
    dirty: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
      icon: <AlertTriangle className="h-10 w-10 text-red-400" />,
      title: "High Grid Carbon Intensity",
      desc: "Grid is relying heavily on fossil fuels to meet peak demand.",
      recommendation: "Delay heavy appliance usage if possible. Conserve energy for the next 2 hours.",
    },
    mixed: {
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/30",
      icon: <CloudRain className="h-10 w-10 text-yellow-400" />,
      title: "Moderate Carbon Mix",
      desc: "Standard mix of natural gas and some renewables online.",
      recommendation: "Normal energy usage is fine, but reducing draw always helps the planet.",
    }
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-6 h-48 flex items-center justify-center border-dashed border-zinc-700">
        <Zap className="h-6 w-6 text-indigo-400 animate-pulse" />
        <span className="ml-3 text-zinc-400 font-bold">Pinging Grid APIs...</span>
      </div>
    );
  }

  const active = Config[gridState];

  return (
    <div className={`rounded-3xl p-6 border ${active.bg} relative overflow-hidden transition-all duration-500`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {active.icon}
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`h-5 w-5 ${active.color}`} />
          <span className="text-xs uppercase font-black tracking-widest text-zinc-300">Live Grid Intelligence</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
          <ShieldCheck className="h-3 w-3" /> API Active
        </span>
      </div>

      <div className="flex items-center gap-4 z-10 relative mt-2">
        <div className={`p-3 rounded-2xl bg-zinc-950/50 backdrop-blur`}>
          {active.icon}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${active.color}`}>{active.title}</h3>
          <p className="text-sm text-zinc-300 mt-1">{active.desc}</p>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 backdrop-blur z-10 relative">
        <p className="text-sm text-white font-medium flex gap-2">
          <span className="font-bold text-indigo-400">AI Recommendation:</span>
          {active.recommendation}
        </p>
      </div>
    </div>
  );
}
