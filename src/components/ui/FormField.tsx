/**
 * @file src/components/ui/FormField.tsx
 * @description Accessible form field wrapper component.
 * Combines label + input + error message with proper ARIA associations
 * to meet WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 3.3.1 (Error Identification).
 */

import React, { useId } from "react";

interface FormFieldProps {
  /** Label text displayed above the input */
  label: string;
  /** Error message — when present, input is marked invalid */
  error?: string;
  /** Help text displayed below the input */
  hint?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Input element — receives id, aria-describedby, aria-invalid, aria-required */
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean;
    "aria-required": boolean;
  }) => React.ReactNode;
  /** Additional wrapper CSS classes */
  className?: string;
}

/**
 * Accessible form field with linked label, error, and hint.
 *
 * @example
 * <FormField label="Email Address" error={errors.email?.message} required>
 *   {(fieldProps) => (
 *     <input
 *       type="email"
 *       {...register("email")}
 *       {...fieldProps}
 *       className="..."
 *     />
 *   )}
 * </FormField>
 */
export function FormField({
  label,
  error,
  hint,
  required = false,
  children,
  className = "",
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="text-xs font-bold text-slate-500 uppercase tracking-wide"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {/* Input via render prop */}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": !!error,
        "aria-required": required,
      })}

      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-slate-400">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-[11px] font-semibold text-red-500 flex items-center gap-1"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
