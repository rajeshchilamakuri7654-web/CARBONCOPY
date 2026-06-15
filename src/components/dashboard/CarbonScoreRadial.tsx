/**
 * @file src/components/dashboard/CarbonScoreRadial.tsx
 * @description Memoized radial gauge showing the user's carbon eco-score (0–100).
 * Uses Recharts RadialBarChart with a centered score overlay.
 */

"use client";

import { memo } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

interface CarbonScoreRadialProps {
  /** Score from 0 to 100 — higher is more sustainable */
  score: number;
}

/**
 * Radial progress gauge displaying the user's carbon eco-score.
 * Color transitions from red (low score) to emerald (high score).
 *
 * @example
 * <CarbonScoreRadial score={72} />
 */
export const CarbonScoreRadial = memo(function CarbonScoreRadial({
  score,
}: CarbonScoreRadialProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color =
    clampedScore >= 75 ? "#10b981" : clampedScore >= 40 ? "#f59e0b" : "#ef4444";

  const radialData = [{ name: "Score", value: clampedScore, fill: color }];

  return (
    <section aria-label={`Carbon eco-score: ${clampedScore} out of 100`}>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 w-full text-left">
        Carbon Score
      </h3>

      <div
        className="relative w-40 h-40 flex items-center justify-center mx-auto"
        role="img"
        aria-label={`Carbon eco-score gauge showing ${clampedScore} out of 100`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={12}
            data={radialData}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              background={{ fill: "#f1f5f9" }}
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Centered score overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-4xl font-black text-slate-900">
            {clampedScore.toFixed(0)}
          </span>
          <span className="text-[9px] text-slate-500 font-bold">/ 100</span>
        </div>
      </div>
    </section>
  );
});
