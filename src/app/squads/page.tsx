"use client";

import { useState } from "react";
import { Users, Shield, PlusCircle, Trophy, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MOCK_SQUADS = [
  { id: "1", name: "Tech Innovators", members: 42, avgScore: 92, rank: 1 },
  { id: "2", name: "Green University", members: 120, avgScore: 88, rank: 2 },
  { id: "3", name: "Local Community", members: 15, avgScore: 85, rank: 3 },
];

export default function SquadsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-400" />
            Eco Squads
          </h1>
          <p className="text-zinc-400 mt-2">
            Join forces with friends and colleagues to compete on team leaderboards.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-full px-6">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Squad
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Squads List */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search squads by name or invite code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-4">
            {MOCK_SQUADS.map((squad) => (
              <div key={squad.id} className="glass-panel rounded-3xl p-6 flex items-center justify-between hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-xl text-zinc-500">
                    {squad.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{squad.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400 font-medium">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {squad.members} members</span>
                      <span className="flex items-center gap-1 text-emerald-400"><Shield className="h-3.5 w-3.5" /> Avg Score: {squad.avgScore}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center bg-zinc-900 rounded-xl px-4 py-2 border border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Global Rank</span>
                    <span className="text-xl font-black text-yellow-400 flex items-center gap-1">
                      <Trophy className="h-4 w-4" /> #{squad.rank}
                    </span>
                  </div>
                  <Button variant="secondary" className="rounded-xl px-6">Join</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Your Squad State */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 border-indigo-500/30 flex flex-col items-center text-center gap-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 blur-[50px] rounded-full" />
             
             <div className="h-20 w-20 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center">
               <Users className="h-8 w-8 text-zinc-600" />
             </div>
             
             <div>
               <h3 className="text-lg font-bold text-white">No Squad Yet</h3>
               <p className="text-sm text-zinc-400 mt-1">
                 You are currently operating as a lone wolf. Join a squad to multiply your impact.
               </p>
             </div>
             
             <Button className="w-full rounded-xl bg-white text-black hover:bg-zinc-200 mt-2">
               Find a Squad
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
