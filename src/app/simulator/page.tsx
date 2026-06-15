"use client";

import { useState } from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from "recharts";
import { Zap, Car, Beef, Settings, Info } from "lucide-react";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { calculateTreesEquivalent } from "@/lib/carbonCalculator";

export default function SimulatorPage() {
  // Base current usage per month
  const baseCarKm = 1000;
  const baseMeatDays = 20;
  const baseElecKwh = 500;

  // Variables
  const [carMode, setCarMode] = useState<"gas" | "ev" | "public">("gas");
  const [meatDays, setMeatDays] = useState(baseMeatDays);
  const [solarPct, setSolarPct] = useState(0);

  // Constants
  const gasEmissionRate = 0.18; // kg/km
  const evEmissionRate = 0.05;
  const publicEmissionRate = 0.08;

  const meatEmissionRate = 4.0; // kg/day
  const vegEmissionRate = 1.5;

  const elecEmissionRate = 0.45; // kg/kwh

  // Calculate Base Emissions (Yearly)
  const baseTransport = baseCarKm * 12 * gasEmissionRate;
  const baseFood = (baseMeatDays * 12 * meatEmissionRate) + ((30 - baseMeatDays) * 12 * vegEmissionRate);
  const baseElec = baseElecKwh * 12 * elecEmissionRate;
  const baseTotal = baseTransport + baseFood + baseElec;

  // Calculate Projected Emissions (Yearly)
  let projTransportRate = gasEmissionRate;
  if (carMode === "ev") projTransportRate = evEmissionRate;
  if (carMode === "public") projTransportRate = publicEmissionRate;
  
  const projTransport = baseCarKm * 12 * projTransportRate;
  const projFood = (meatDays * 12 * meatEmissionRate) + ((30 - meatDays) * 12 * vegEmissionRate);
  const gridKwh = baseElecKwh * (1 - solarPct / 100);
  const projElec = gridKwh * 12 * elecEmissionRate;

  const projTotal = projTransport + projFood + projElec;
  const savingsCo2 = baseTotal - projTotal;
  const treesSaved = calculateTreesEquivalent(savingsCo2);

  const chartData = [
    { name: "Transport", current: baseTransport, projected: projTransport },
    { name: "Food", current: baseFood, projected: projFood },
    { name: "Energy", current: baseElec, projected: projElec },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-indigo-400" />
          Footprint Simulator
        </h1>
        <p className="text-zinc-400 mt-2">
          Ask "What if?" Adjust your lifestyle choices below to instantly see your projected annual carbon savings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-400" />
              Transport Mode
            </h3>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {(["gas", "ev", "public"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCarMode(mode)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-colors ${
                    carMode === mode ? "bg-indigo-600 text-white shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Currently driving 1000km/mo. Swapping to EV or Public Transit dramatically reduces emissions.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Beef className="h-5 w-5 text-red-400" />
              Diet Choices
            </h3>
            <RangeSlider
              label="Meat-eating days / month"
              value={meatDays}
              min={0}
              max={30}
              step={1}
              valueLabel={`${meatDays} days`}
              onChange={setMeatDays}
              valueColor="text-red-400"
            />
          </div>

          <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Home Energy
            </h3>
            <RangeSlider
              label="Solar Energy Usage"
              value={solarPct}
              min={0}
              max={100}
              step={5}
              valueLabel={`${solarPct}%`}
              onChange={setSolarPct}
              valueColor="text-yellow-400"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Percentage of your 500kWh/mo usage offset by rooftop solar.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel rounded-3xl p-6 border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 blur-xl rounded-full" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Yearly Savings</p>
              <h2 className="text-3xl font-black text-emerald-400 mt-1">{savingsCo2 > 0 ? savingsCo2.toFixed(0) : "0"} <span className="text-sm font-medium">kg CO₂</span></h2>
            </div>
            <div className="glass-panel rounded-3xl p-6 border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/10 blur-xl rounded-full" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Projected Total</p>
              <h2 className="text-3xl font-black text-white mt-1">{projTotal.toFixed(0)} <span className="text-sm font-medium text-zinc-400">kg CO₂</span></h2>
            </div>
            <div className="glass-panel rounded-3xl p-6 border-yellow-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-yellow-500/10 blur-xl rounded-full" />
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Trees Equivalent</p>
              <h2 className="text-3xl font-black text-yellow-400 mt-1">{treesSaved > 0 ? treesSaved.toFixed(1) : "0"} <span className="text-sm font-medium">trees</span></h2>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-panel rounded-3xl p-6 h-[400px] flex flex-col">
            <h3 className="text-base font-bold text-white mb-6">Current vs. Projected (Yearly kg CO₂)</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="current" name="Current Lifestyle" fill="#52525b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projected" name="Projected Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
