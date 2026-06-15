"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { EmissionChartPoint } from "@/types";

export function Sparkline({ data }: { data: EmissionChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="total"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#kpiGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
