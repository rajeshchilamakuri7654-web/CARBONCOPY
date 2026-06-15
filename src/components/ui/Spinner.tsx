/**
 * @file src/components/ui/Spinner.tsx
 * @description Accessible loading spinner component.
 * Includes role="status" and visually hidden text for screen readers,
 * meeting WCAG 2.1 SC 4.1.3 (Status Messages).
 */

interface SpinnerProps {
  /** Size in pixels (applied as both width and height via Tailwind) */
  size?: "sm" | "md" | "lg";
  /** Color variant */
  color?: "emerald" | "sky" | "slate" | "white";
  /** Screen reader announcement text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

const colorMap = {
  emerald: "border-emerald-500 border-t-transparent",
  sky: "border-sky-500 border-t-transparent",
  slate: "border-slate-400 border-t-transparent",
  white: "border-white border-t-transparent",
};

/**
 * Accessible loading spinner with screen reader support.
 *
 * @example
 * // Full-page loading state
 * <div role="status" aria-live="polite" aria-label="Loading dashboard">
 *   <Spinner size="lg" color="emerald" label="Loading your data..." />
 * </div>
 */
export function Spinner({
  size = "md",
  color = "emerald",
  label = "Loading...",
  className = "",
}: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`inline-flex ${className}`}>
      <span
        aria-hidden="true"
        className={[
          "rounded-full animate-spin",
          sizeMap[size],
          colorMap[color],
        ].join(" ")}
      />
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </span>
  );
}
