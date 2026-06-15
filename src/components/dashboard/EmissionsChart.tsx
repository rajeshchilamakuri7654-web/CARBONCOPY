/**
 * @file src/components/dashboard/EmissionsChart.tsx
 * @description Memoized emissions trajectory area chart for the dashboard.
 * Uses Recharts with custom premium tooltip for stacked area visualization.
 */

"use client";

import React, { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EmissionChartPoint } from "@/types";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

/**
 * Custom styled tooltip for the emissions area chart.
 * Uses glassmorphism styling to match the dashboard aesthetic.
 */
const PremiumTooltip = memo(function PremiumTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      role="tooltip"
      className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-3 shadow-xl"
    >
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 mb-1"
        >
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-xs text-slate-600 capitalize">{entry.name}</span>
          </div>
          <span className="text-xs font-bold text-slate-900">
            {Number(entry.value).toFixed(1)} kg
          </span>
        </div>
      ))}
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface EmissionsChartProps {
  /** Array of chart data points — one per logged record */
  data: EmissionChartPoint[];
}

/**
 * Stacked area chart showing breakdown of emission sources over time.
 * Memoized to prevent re-renders when parent state changes unrelated to chart data.
 *
 * @example
 * <EmissionsChart data={trendData} />
 */
export const EmissionsChart = memo(function EmissionsChart({
  data,
}: EmissionsChartProps) {
  return (
    <section aria-label="Emissions trajectory chart">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Emissions Trajectory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated breakdown of your greenhouse output over time.
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full" role="img" aria-label="Stacked area chart showing transport, electricity, food, and waste emissions over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTransport" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradElectricity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<PremiumTooltip />} />

            <Area
              type="monotone"
              dataKey="transport"
              stackId="1"
              stroke="#10b981"
              fill="url(#gradTransport)"
              name="transport"
            />
            <Area
              type="monotone"
              dataKey="electricity"
              stackId="1"
              stroke="#0ea5e9"
              fill="url(#gradElectricity)"
              name="electricity"
            />
            <Area
              type="monotone"
              dataKey="food"
              stackId="1"
              stroke="#34d399"
              fill="#34d399"
              fillOpacity={0.4}
              name="food"
            />
            <Area
              type="monotone"
              dataKey="waste"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.4}
              name="waste"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
});
