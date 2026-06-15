"use client";

import { Building2, FileText, Users, Globe, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock Data for the B2B ESG Dashboard
const ORG_STATS = {
  name: "Acme Corp",
  employees: 1450,
  scope3Emissions: 420.5, // metric tons
  offsetCredits: 200,
  complianceScore: 92
};

const DEPARTMENTS = [
  { name: "Engineering", headcount: 450, avgFootprint: 1.2, rank: 1 },
  { name: "Sales", headcount: 600, avgFootprint: 2.8, rank: 3 },
  { name: "Operations", headcount: 400, avgFootprint: 1.5, rank: 2 },
];

export default function EnterpriseDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm text-indigo-400 font-bold uppercase tracking-wider">
            <Building2 className="h-4 w-4" /> Enterprise ESG Suite
          </div>
          <h1 className="text-4xl font-extrabold text-white">{ORG_STATS.name} Overview</h1>
          <p className="text-zinc-400 mt-1">Scope 3 Emissions & Corporate Compliance Analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="rounded-xl">
            <Globe className="h-4 w-4 mr-2" /> Buy Offsets
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl">
            <FileText className="h-4 w-4 mr-2" /> Generate SEC Report
          </Button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-3xl p-6 border-indigo-500/30">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Employees</p>
          <h2 className="text-3xl font-black text-white mt-1 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" /> {ORG_STATS.employees}
          </h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 blur-xl rounded-full" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Compliance Score</p>
          <h2 className="text-3xl font-black text-emerald-400 mt-1">{ORG_STATS.complianceScore} / 100</h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 border-red-500/30">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Scope 3 (Employee) Emissions</p>
          <h2 className="text-3xl font-black text-white mt-1">{ORG_STATS.scope3Emissions} <span className="text-sm text-zinc-400 font-medium">tons CO₂</span></h2>
        </div>
        <div className="glass-panel rounded-3xl p-6 border-yellow-500/30">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Offsets Active</p>
          <h2 className="text-3xl font-black text-yellow-400 mt-1">{ORG_STATS.offsetCredits} <span className="text-sm font-medium">Credits</span></h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Department Leaderboard */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Department Leaderboard</h3>
            <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">View All <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="flex flex-col gap-4">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.name} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{dept.name}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{dept.headcount} employees onboarded</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">{dept.avgFootprint} tons</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Avg. per employee</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ESG Audit Section */}
        <div className="glass-panel rounded-3xl p-6 border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Automated ESG Audit</h3>
            <p className="text-sm text-zinc-400">
              CarbonIQ continuously aggregates your workforce's remote and commute footprint to ensure SEC and European CSRD compliance.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3 text-sm">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-emerald-300">Q3 Data collection is <strong className="text-emerald-400">100% complete</strong>. Ready for auditor review.</p>
            </div>
            <Button className="w-full mt-2 rounded-xl bg-white text-black hover:bg-zinc-200">
              <Download className="h-4 w-4 mr-2" /> Download Q3 Audit
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
