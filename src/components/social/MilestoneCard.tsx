"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Award, Share2, Download, Trees, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MilestoneCardProps {
  userName: string;
  milestoneTitle: string;
  points: number;
  treesSaved: number;
}

export function MilestoneCard({ userName, milestoneTitle, points, treesSaved }: MilestoneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `CarbonIQ-Milestone-${userName.replace(/\s+/g, "")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export milestone card", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Exportable Card Area */}
      <div 
        ref={cardRef} 
        className="w-[400px] h-[400px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-[2rem] p-8 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col justify-between"
      >
        {/* Decorative background blurs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
        
        {/* Header */}
        <div className="flex justify-between items-start z-10">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-white tracking-tight text-lg">CarbonIQ</span>
          </div>
          <Award className="h-10 w-10 text-yellow-400" />
        </div>

        {/* Content */}
        <div className="z-10 flex flex-col gap-2">
          <p className="text-zinc-400 font-medium text-sm">Achievement Unlocked!</p>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {milestoneTitle}
          </h2>
          <p className="text-zinc-300 mt-2 font-medium">
            <strong className="text-white">{userName}</strong> is making a massive difference in the fight against climate change.
          </p>
        </div>

        {/* Footer Stats */}
        <div className="z-10 flex items-center justify-between bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Eco Points</span>
            <span className="text-2xl font-black text-indigo-400">{points}</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Trees Saved</span>
            <span className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <Trees className="h-5 w-5" /> {treesSaved.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleExport} disabled={isExporting} className="flex-1 bg-white text-black hover:bg-zinc-200">
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Download Card"}
        </Button>
        <Button variant="secondary" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
