/**
 * @file src/components/ui/SkipNav.tsx
 * @description Skip-to-content navigation link for keyboard accessibility.
 * Provides WCAG 2.1 SC 2.4.1 (Bypass Blocks) compliance by allowing
 * keyboard users to skip repeated navigation links.
 *
 * Place at the very top of <body> before the Navbar.
 */

"use client";

/**
 * Skip navigation link — visible only on keyboard focus.
 * Must be the first focusable element on the page.
 *
 * @example
 * // In layout.tsx, above <Navbar />:
 * <SkipNav />
 * <Navbar />
 * <main id="main-content">...</main>
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className={[
        // Hidden by default, visible on keyboard focus
        "sr-only focus:not-sr-only",
        "focus:fixed focus:top-4 focus:left-4 focus:z-[9999]",
        "focus:inline-flex focus:items-center focus:gap-2",
        "focus:rounded-xl focus:px-4 focus:py-2",
        "focus:bg-emerald-600 focus:text-white focus:font-bold focus:text-sm",
        "focus:shadow-xl focus:outline-none",
        "transition-all",
      ].join(" ")}
    >
      Skip to main content
    </a>
  );
}
