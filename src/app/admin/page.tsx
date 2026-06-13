"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, BarChart3, HelpCircle, Sparkles, ShieldCheck, ArrowRight,
  TrendingDown, Globe, PlusCircle, AlertCircle, FileText, Send, UserX
} from "lucide-react";

export default function AdminPanel() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalLogs: 0,
    totalArticles: 0,
    avgEmissions: 0,
    totalPoints: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Article states
  const [artTitle, setArtTitle] = useState("");
  const [artCategory, setArtCategory] = useState("General");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artCarbonSaved, setArtCarbonSaved] = useState(15);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "ADMIN") {
        setError("Access Denied: You must be an administrator to view this page.");
        setLoading(false);
      } else {
        fetchAdminData();
      }
    }
  }, [status]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setUsers(data.users);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load admin dashboard data");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artSummary || !artContent) return;

    setPublishing(true);
    setPublishSuccess(false);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: artTitle,
          category: artCategory,
          summary: artSummary,
          content: artContent,
          carbonSaved: Number(artCarbonSaved),
        }),
      });

      if (res.ok) {
        setArtTitle("");
        setArtSummary("");
        setArtContent("");
        setPublishSuccess(true);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-6 mt-10">
        <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <UserX className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Access Prohibited</h2>
          <p className="text-xs text-zinc-400 mt-2">{error}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="glow-btn w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-black py-3 rounded-xl font-bold text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 py-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-amber-500" />
          Administrative Portal
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Monitor platform metrics, review member counts, and publish environmental awareness articles.
        </p>
      </div>

      {/* Admin KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel rounded-2xl p-6">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Total Registered Users</span>
          <span className="text-3xl font-black text-white block mt-2">{metrics.totalUsers}</span>
          <span className="text-[10px] text-zinc-500 block mt-3">Active members in database</span>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Footprints Logged</span>
          <span className="text-3xl font-black text-white block mt-2">{metrics.totalLogs}</span>
          <span className="text-[10px] text-zinc-500 block mt-3">Calculations saved by members</span>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Platform Average Footprint</span>
          <span className="text-3xl font-black text-indigo-400 block mt-2">
            {metrics.avgEmissions} <span className="text-xs font-normal text-zinc-400">kg/mo</span>
          </span>
          <span className="text-[10px] text-zinc-500 block mt-3">Compared to global 450 kg avg</span>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block">Points Awarded</span>
          <span className="text-3xl font-black text-yellow-500 block mt-2">{metrics.totalPoints}</span>
          <span className="text-[10px] text-zinc-500 block mt-3">Total points distributed to spur habits</span>
        </div>

      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: User Directory */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            Registered User Database
          </h3>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Streak</th>
                  <th className="pb-3 pr-2 text-right">Logs Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-950/20 text-zinc-300">
                    <td className="py-3.5 font-bold text-white">{u.name || "Citizen"}</td>
                    <td className="py-3.5 text-zinc-400 font-mono">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${
                        u.role === "ADMIN" 
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-500"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 font-extrabold text-white">{u.points}</td>
                    <td className="py-3.5 text-orange-400 font-bold">{u.streak}d</td>
                    <td className="py-3.5 pr-2 text-right font-bold text-zinc-450">{u._count.emissionRecords}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Create Article tool */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-indigo-400" />
            Publish Eco Article
          </h3>

          <form onSubmit={handlePublishArticle} className="flex flex-col gap-4 text-xs">
            
            {publishSuccess && (
              <div className="flex items-center gap-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-xs text-indigo-400 font-bold">
                <span>Article published successfully!</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase">Article Title</label>
              <input
                type="text"
                placeholder="e.g. Benefits of Solar Panels"
                value={artTitle}
                onChange={(e) => setArtTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950/40 p-3 text-white placeholder-zinc-650 focus:border-indigo-500/40 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase">Category Tag</label>
                <select
                  value={artCategory}
                  onChange={(e) => setArtCategory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-950/40 p-3 text-white focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Energy">Energy</option>
                  <option value="Food">Food Habits</option>
                  <option value="Transport">Transport</option>
                  <option value="Waste">Waste</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-zinc-400 uppercase">CO₂ Saved (kg)</label>
                <input
                  type="number"
                  value={artCarbonSaved}
                  onChange={(e) => setArtCarbonSaved(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-850 bg-zinc-950/40 p-3 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase">Short Summary</label>
              <textarea
                placeholder="Brief summary of the article..."
                value={artSummary}
                onChange={(e) => setArtSummary(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950/40 p-3 text-white placeholder-zinc-650 focus:border-indigo-500/40 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-zinc-400 uppercase">Article Content (Markdown support)</label>
              <textarea
                placeholder="Write full article here..."
                value={artContent}
                onChange={(e) => setArtContent(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-zinc-850 bg-zinc-950/40 p-3 text-white placeholder-zinc-650 focus:border-indigo-500/40 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="glow-btn bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-green-600 hover:to-emerald-600 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              <Send className="h-3.5 w-3.5" />
              {publishing ? "Publishing..." : "Publish Article"}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
