/**
 * @file src/components/ui/RangeSlider.tsx
 * @description Accessible range slider component.
 * Meets WCAG 2.1 SC 4.1.2 (Name, Role, Value) requirements for
 * range inputs with full ARIA attributes for screen reader accessibility.
 */

"use client";

import React, { useId } from "react";

interface RangeSliderProps {
  /** Field label */
  label: string;
  /** Current numeric value */
  value: number;
  /** Minimum allowed value */
  min: number;
  /** Maximum allowed value */
  max: number;
  /** Step increment */
  step?: number;
  /** Formatted value display string (e.g. "300 km") */
  valueLabel: string;
  /** Unit label displayed after the value (e.g. "km") */
  unit?: string;
  /** Human-readable description of the value for screen readers */
  ariaValueText?: string;
  /** Secondary label shown below slider (left side) */
  hint?: string;
  /** CO₂ equivalent shown below slider (right side) */
  co2Label?: string;
  /** Color accent for the value display */
  valueColor?: string;
  /** onChange callback */
  onChange: (value: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible range slider with ARIA label, value text, and CO₂ annotation.
 *
 * @example
 * <RangeSlider
 *   label="Monthly Driving"
 *   value={carDistance}
 *   min={0}
 *   max={3000}
 *   step={50}
 *   valueLabel={`${carDistance} km`}
 *   ariaValueText={`${carDistance} kilometers per month`}
 *   co2Label={`${(carDistance * 0.18).toFixed(0)} kg CO₂`}
 *   onChange={setCarDistance}
 * />
 */
export function RangeSlider({
  label,
  value,
  min,
  max,
  step = 1,
  valueLabel,
  ariaValueText,
  hint,
  co2Label,
  valueColor = "text-emerald-600",
  onChange,
  className = "",
}: RangeSliderProps) {
  const sliderId = useId();

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label row */}
      <div className="flex justify-between items-center text-xs font-semibold">
        <label htmlFor={sliderId} className="text-slate-600">
          {label}
        </label>
        <span className={valueColor} aria-live="polite" aria-atomic="true">
          {valueLabel}
        </span>
      </div>

      {/* Range input with full ARIA attributes */}
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={ariaValueText ?? valueLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500 bg-slate-200"
      />

      {/* Annotation row */}
      {(hint || co2Label) && (
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span>{hint}</span>
          {co2Label && (
            <span
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Carbon equivalent: ${co2Label}`}
            >
              {co2Label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
