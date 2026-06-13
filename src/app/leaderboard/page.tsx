"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Flame, Sparkles, Award, Star, ShieldAlert, ArrowUp, Zap } from "lucide-react";

export default function Leaderboard() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find current logged-in user in leaderboard
  const currentUserRank = leaderboard.find((u) => u.id === (session?.user as any)?.id);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="h-6 w-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-extrabold flex items-center justify-center text-xs">1st</span>;
      case 2:
        return <span className="h-6 w-6 rounded-full bg-zinc-400/20 border border-zinc-400/40 text-zinc-350 font-extrabold flex items-center justify-center text-xs">2nd</span>;
      case 3:
        return <span className="h-6 w-6 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 font-extrabold flex items-center justify-center text-xs">3rd</span>;
      default:
        return <span className="text-zinc-500 font-bold pl-2">{rank}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-10 py-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="h-7 w-7 text-indigo-400" />
          Eco Champion Leaderboard
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Compete with fellow members. Rank is determined by accumulated eco points, login streaks, and goals achieved.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Side: Leaderboard Table */}
          <div className="flex-1 w-full glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400/20" />
              Global Standings
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Eco Points</th>
                    <th className="pb-3">Streak</th>
                    <th className="pb-3">Badges</th>
                    <th className="pb-3 pr-2 text-right">Latest Footprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {leaderboard.map((user) => {
                    const isSelf = user.id === (session?.user as any)?.id;
                    return (
                      <tr
                        key={user.id}
                        className={`transition-all duration-150 ${
                          isSelf
                            ? "bg-indigo-500/5 text-indigo-400 font-semibold"
                            : "hover:bg-zinc-950/20 text-zinc-300"
                        }`}
                      >
                        <td className="py-4 pl-2 font-bold">{getRankBadge(user.rank)}</td>
                        <td className="py-4 font-bold flex items-center gap-2">
                          <span className="truncate max-w-[120px]">{user.name}</span>
                          {user.role === "ADMIN" && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 text-[8px] font-black uppercase text-amber-500">
                              Staff
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-white font-extrabold">{user.points} pts</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1 text-orange-400 text-xs">
                            <Flame className="h-3.5 w-3.5 fill-orange-400/10" />
                            {user.streak}d
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1 text-blue-400 text-xs">
                            <Award className="h-3.5 w-3.5" />
                            {user.badgeCount}
                          </span>
                        </td>
                        <td className="py-4 pr-2 text-right text-zinc-400 font-bold">
                          {user.latestFootprint > 0 ? `${user.latestFootprint.toFixed(0)} kg` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Side: User Stats highlight Card */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            
            {currentUserRank ? (
              <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 relative border-indigo-500/30">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl" />
                
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Your Position</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Personal Standing</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-zinc-950/40 border border-zinc-900 p-4">
                    <span className="text-[10px] font-bold text-zinc-500 block">GLOBAL RANK</span>
                    <span className="text-2xl font-black text-white">#{currentUserRank.rank}</span>
                  </div>

                  <div className="rounded-2xl bg-zinc-950/40 border border-zinc-900 p-4">
                    <span className="text-[10px] font-bold text-zinc-500 block">TOTAL POINTS</span>
                    <span className="text-2xl font-black text-indigo-400">{currentUserRank.points}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-450 leading-relaxed">
                  Log your carbon emissions regularly and achieve reduction goals to gain points and rise in global ranking standings.
                </p>

                <div className="flex items-center gap-2 rounded-2xl bg-orange-500/5 border border-orange-500/10 p-3 text-xs text-orange-400 font-semibold">
                  <Flame className="h-4 w-4 fill-orange-400/20" />
                  <span>Maintain your {currentUserRank.streak}d streak for +20 bonus points!</span>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 text-center items-center">
                <ShieldAlert className="h-10 w-10 text-zinc-700" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-400">Join the Leaderboard</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Sign in and complete your first calculation to register your position on the global standings.
                  </p>
                </div>
              </div>
            )}

            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-3">
              <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500/15" />
                How to Earn Points
              </h4>
              <ul className="text-[11px] text-zinc-400 flex flex-col gap-2 list-disc list-inside">
                <li>Create an account: <strong className="text-white">+100 pts</strong></li>
                <li>Submit daily emission log: <strong className="text-white">+50 pts</strong></li>
                <li>Maintain consecutive streak: <strong className="text-white">+20 pts / log</strong></li>
                <li>Configure new goal: <strong className="text-white">+25 pts</strong></li>
                <li>Achieve a goal: <strong className="text-white">+100 pts</strong></li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
