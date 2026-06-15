/**
 * @file src/components/dashboard/KpiCard.tsx
 * @description KPI (Key Performance Indicator) metric card for the dashboard.
 * Displays a metric with label, value, unit, and optional sparkline trend area.
 * Uses framer-motion for hover animations.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

interface KpiCardProps {
  /** Accessible label for the metric (uppercase) */
  label: string;
  /** Primary numeric or string value to display */
  value: React.ReactNode;
  /** Unit displayed after the value (e.g., "kg CO₂", "pts") */
  unit?: string;
  /** Optional colored left border accent */
  accentColor?: string;
  /** Optional secondary badge/chip below the value */
  badge?: React.ReactNode;
  /** Icon displayed alongside metric */
  icon?: React.ReactNode;
  /** Optional sparkline chart component rendered inside the card */
  sparkline?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated KPI metric card for dashboard overview.
 * Lifts on hover with a smooth spring animation.
 *
 * @example
 * <KpiCard
 *   label="Monthly Footprint"
 *   value={totalEmissions}
 *   unit="kg CO₂"
 *   sparkline={<MiniAreaChart data={trendData} />}
 * />
 */
export const KpiCard = React.memo(function KpiCard({
  label,
  value,
  unit,
  accentColor,
  badge,
  icon,
  sparkline,
  className = "",
}: KpiCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={[
        "glass-panel rounded-2xl p-6 relative overflow-hidden",
        "flex flex-col justify-between h-40 group",
        accentColor ? `border-l-4 ${accentColor}` : "",
        className,
      ].join(" ")}
    >
      <div className="z-10 relative">
        {/* Metric label */}
        <span
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
          aria-label={label}
        >
          {label}
        </span>

        {/* Value row */}
        <div className="flex items-baseline gap-2 mt-2">
          {icon && (
            <span aria-hidden="true" className="text-slate-400">
              {icon}
            </span>
          )}
          <span
            className="text-3xl font-black text-slate-900"
            aria-label={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-500" aria-hidden="true">
              {unit}
            </span>
          )}
        </div>

        {/* Optional badge/chip */}
        {badge && <div className="mt-3">{badge}</div>}
      </div>

      {/* Optional sparkline chart — overlaid at bottom */}
      {sparkline && (
        <div
          aria-hidden="true"
          className="absolute -bottom-2 left-0 right-0 h-16 opacity-40 group-hover:opacity-100 transition-opacity"
        >
          {sparkline}
        </div>
      )}
    </motion.div>
  );
});
