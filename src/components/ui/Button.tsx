/**
 * @file src/components/ui/Button.tsx
 * @description Accessible, variant-based button component.
 * Supports multiple visual variants with full keyboard support,
 * focus management, and disabled state handling.
 */

import React from "react";

/** Available button variant styles */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** Available button size options */
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Shows loading spinner and disables interaction */
  isLoading?: boolean;
  /** Icon displayed before the button label */
  leftIcon?: React.ReactNode;
  /** Icon displayed after the button label */
  rightIcon?: React.ReactNode;
  /** Accessible label for icon-only buttons */
  "aria-label"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "glow-btn",
    "bg-gradient-to-r from-emerald-500 to-emerald-600",
    "text-white border border-emerald-400/30",
    "hover:from-emerald-400 hover:to-emerald-500",
    "disabled:from-emerald-300 disabled:to-emerald-400 disabled:cursor-not-allowed",
    "focus-visible:ring-emerald-400",
  ].join(" "),

  secondary: [
    "bg-white border border-slate-200",
    "text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-slate-400",
  ].join(" "),

  ghost: [
    "bg-transparent border border-transparent",
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-slate-400",
  ].join(" "),

  danger: [
    "bg-red-50 border border-red-200",
    "text-red-600 hover:bg-red-100 hover:border-red-300",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-red-400",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
};

/**
 * Accessible button component with multiple variants and sizes.
 *
 * @example
 * <Button variant="primary" size="md" leftIcon={<CheckIcon />}>
 *   Save Changes
 * </Button>
 *
 * <Button variant="danger" onClick={handleDelete} aria-label="Delete item">
 *   <TrashIcon />
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={[
          "inline-flex items-center justify-center font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          isDisabled ? "opacity-60 cursor-not-allowed" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <svg
            aria-hidden="true"
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
