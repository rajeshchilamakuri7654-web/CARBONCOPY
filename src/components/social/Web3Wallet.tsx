"use client";

import { useState } from "react";
import { Coins, Hexagon, ArrowRightLeft, ShieldCheck, TreePine } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Web3Wallet() {
  const [balance, setBalance] = useState(1450);
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = () => {
    setIsStaking(true);
    setTimeout(() => {
      setBalance((prev) => prev - 500);
      setIsStaking(false);
      alert("Successfully staked 500 $ECO tokens! You just funded 5 real trees. Verify on Polygon Testnet: 0x8aF...2B9");
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border-indigo-500/30 flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
        <Hexagon className="h-64 w-64" />
      </div>

      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-400" />
            Eco Wallet
          </h3>
          <p className="text-sm text-zinc-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Polygon Network
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-400">0x4F...9E2A</span>
        </div>
      </div>

      <div className="z-10 bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase font-black tracking-widest text-zinc-500 mb-2">Available Balance</span>
        <div className="flex items-baseline gap-2">
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            {balance}
          </h2>
          <span className="text-xl font-bold text-yellow-500/50">$ECO</span>
        </div>
        <p className="text-xs text-zinc-400 mt-3 max-w-[200px]">
          Earned automatically via verified carbon reductions.
        </p>
      </div>

      <div className="z-10 grid grid-cols-2 gap-3">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 w-full"
          disabled={balance < 500 || isStaking}
          onClick={handleStake}
        >
          {isStaking ? "Staking..." : (
            <span className="flex items-center gap-2">
              <TreePine className="h-4 w-4" /> Stake (500)
            </span>
          )}
        </Button>
        <Button variant="secondary" className="w-full">
          <ArrowRightLeft className="h-4 w-4 mr-2" /> Swap
        </Button>
      </div>
    </div>
  );
}
