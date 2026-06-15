/**
 * @file src/components/dashboard/GoalModal.tsx
 * @description Accessible goal creation modal for the dashboard.
 * Uses the reusable Modal component (with focus trap) and react-hook-form
 * with Zod validation for type-safe form handling.
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGoalSchema, type CreateGoalInput } from "@/lib/validators";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const GOAL_CATEGORIES = [
  { value: "transport", label: "Transport" },
  { value: "electricity", label: "Electricity" },
  { value: "food", label: "Food & Diet" },
  { value: "waste", label: "Waste" },
  { value: "overall", label: "Overall" },
] as const;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalInput) => Promise<void>;
  isSubmitting?: boolean;
}

const inputClass = [
  "w-full rounded-xl border border-slate-200 bg-white p-3",
  "text-slate-900 text-xs placeholder-slate-400",
  "focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30",
  "transition-all aria-invalid:border-red-400",
].join(" ");

/**
 * Modal for creating a new carbon reduction goal.
 * Validates all fields with Zod before submission.
 *
 * @example
 * <GoalModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={handleCreateGoal}
 * />
 */
export function GoalModal({ isOpen, onClose, onSubmit, isSubmitting = false }: GoalModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      category: "transport",
      targetReduction: 15,
      currentValue: 0,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: CreateGoalInput) => {
    await onSubmit(data);
    reset();
  };

  // Format today + 1 day for minimum end date
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Target Initiative">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-5"
        noValidate
        aria-label="Create a new carbon reduction goal"
      >
        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="goal-title"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
          >
            Description <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <input
            id="goal-title"
            type="text"
            placeholder="e.g. Reduce car driving by 20%"
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "goal-title-error" : undefined}
            className={inputClass}
            {...register("title")}
          />
          {errors.title && (
            <p id="goal-title-error" role="alert" className="text-[10px] text-red-500 font-semibold">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Category + Reduction % */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="goal-category"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >
              Category
            </label>
            <select
              id="goal-category"
              aria-label="Goal category"
              className={inputClass}
              {...register("category")}
            >
              {GOAL_CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="goal-reduction"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >
              Reduction %
            </label>
            <input
              id="goal-reduction"
              type="number"
              min={1}
              max={100}
              aria-label="Target reduction percentage"
              aria-invalid={!!errors.targetReduction}
              className={inputClass}
              {...register("targetReduction", { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Target Value + End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="goal-target"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >
              Target Value (kg) <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="goal-target"
              type="number"
              min={1}
              placeholder="100"
              aria-required="true"
              aria-invalid={!!errors.targetValue}
              aria-describedby={errors.targetValue ? "goal-target-error" : undefined}
              className={inputClass}
              {...register("targetValue", { valueAsNumber: true })}
            />
            {errors.targetValue && (
              <p id="goal-target-error" role="alert" className="text-[10px] text-red-500 font-semibold">
                {errors.targetValue.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="goal-enddate"
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >
              End Date <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              id="goal-enddate"
              type="date"
              min={minDateStr}
              aria-required="true"
              aria-invalid={!!errors.endDate}
              aria-describedby={errors.endDate ? "goal-enddate-error" : undefined}
              className={inputClass}
              {...register("endDate")}
            />
            {errors.endDate && (
              <p id="goal-enddate-error" role="alert" className="text-[10px] text-red-500 font-semibold">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Saving..." : "Launch Initiative"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
