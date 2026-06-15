/**
 * @file src/components/dashboard/GoalsList.tsx
 * @description Goals timeline component for the dashboard.
 * Displays user goals with progress bars in a timeline layout.
 */

"use client";

import { memo } from "react";
import { Target } from "lucide-react";
import type { Goal } from "@/types";

interface GoalsListProps {
  /** Array of user goals to display */
  goals: Goal[];
  /** Called when "New Initiative" is clicked */
  onNewGoal: () => void;
}

/**
 * Timeline-style goals list with progress bars and completion status badges.
 * Memoized to prevent re-renders when parent dashboard state changes.
 *
 * @example
 * <GoalsList goals={goals} onNewGoal={() => setShowModal(true)} />
 */
export const GoalsList = memo(function GoalsList({
  goals,
  onNewGoal,
}: GoalsListProps) {
  return (
    <section aria-labelledby="goals-heading">
      {/* Section header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-5">
        <h3
          id="goals-heading"
          className="text-base font-bold text-slate-900 flex items-center gap-2"
        >
          <Target className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          Target Initiatives
        </h3>
        <button
          onClick={onNewGoal}
          aria-label="Add new goal initiative"
          className={[
            "text-[10px] font-bold text-emerald-600 uppercase tracking-widest",
            "hover:text-emerald-800 transition-colors",
            "focus-visible:outline-none focus-visible:underline",
          ].join(" ")}
        >
          + New Initiative
        </button>
      </div>

      {/* Goals timeline */}
      <ol
        aria-label="Your active goals"
        className="flex flex-col gap-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent"
      >
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round((goal.currentValue / goal.targetValue) * 100)
            );
            return (
              <li
                key={goal.id}
                className="relative flex items-start gap-4"
                aria-label={`Goal: ${goal.title}, ${percent}% complete, status: ${goal.completed ? "completed" : "active"}`}
              >
                {/* Timeline dot */}
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 bg-white shrink-0 shadow-sm z-10 mt-1"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      goal.completed
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : "bg-emerald-400"
                    }`}
                  />
                </div>

                {/* Goal card */}
                <div className="flex-1 bg-white border border-slate-100 shadow-sm p-4 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-900 pr-2 leading-tight">
                      {goal.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase shrink-0 ${
                        goal.completed
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      {goal.completed ? "Done" : "Active"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-1"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${goal.title} progress: ${percent}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        goal.completed ? "bg-emerald-500" : "bg-emerald-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-[9px] text-slate-500 flex justify-between">
                    <span className="uppercase">{goal.category}</span>
                    <span aria-label={`${percent} percent complete`}>{percent}%</span>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li
            className="text-center text-xs text-slate-400 italic py-8"
            aria-label="No active goals"
          >
            No initiatives active. Create your first goal to start tracking progress.
          </li>
        )}
      </ol>
    </section>
  );
});
