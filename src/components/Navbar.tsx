/**
 * @file src/components/Navbar.tsx
 * @description Main application navigation bar.
 *
 * Accessibility features:
 * - WCAG 2.1 SC 2.4.3: Logical focus order
 * - WCAG 2.1 SC 4.1.2: aria-current="page" on active links
 * - Mobile menu: aria-expanded, aria-controls, aria-label on toggle button
 * - Role check uses session.user.role (not hardcoded email string)
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Trophy, BookOpen, LogOut,
  Menu, X, Calculator, Activity, Mic, Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

/** All navigation items with optional authentication guard */
const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, protected: true },
  { name: "Calculator", href: "/calculator", icon: Calculator, protected: false },
  { name: "Voice Agent", href: "/voice-agent", icon: Mic, protected: false },
  { name: "Education", href: "/education", icon: BookOpen, protected: false },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy, protected: false },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.protected || !!session
  );

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      {/* ─── Desktop Floating Nav ─────────────────────────────────────── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none hidden md:block">
        <motion.nav
          aria-label="Main navigation"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="floating-nav pointer-events-auto rounded-full px-2 py-2 flex items-center justify-between"
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="CarbonIQ — go to home page"
            className="flex items-center gap-2.5 px-4 group"
          >
            <div
              aria-hidden="true"
              className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow"
            >
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              CarbonIQ
            </span>
          </Link>

          {/* Desktop links */}
          <div role="list" className="flex items-center gap-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  role="listitem"
                  aria-current={isActive ? "page" : undefined}
                  className="relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-slate-100 rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon
                    aria-hidden="true"
                    className={`h-3.5 w-3.5 relative z-10 transition-colors ${
                      isActive ? "text-emerald-600" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-emerald-700" : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            {session ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    aria-label="Open admin panel"
                    aria-current={pathname === "/admin" ? "page" : undefined}
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  aria-label="Sign out of your account"
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="glow-btn px-4 py-1.5 rounded-full text-xs font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* ─── Mobile Header ────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="CarbonIQ — go to home page"
          className="flex items-center gap-2.5 group"
        >
          <div
            aria-hidden="true"
            className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20"
          >
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900">CarbonIQ</span>
        </Link>

        <button
          id="mobile-menu-trigger"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          className="text-slate-600 p-2 -mr-2 rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* ─── Mobile Menu Overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-2 overflow-y-auto"
          >
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 p-4 rounded-2xl font-semibold transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <item.icon
                    aria-hidden="true"
                    className={`h-5 w-5 ${isActive ? "text-emerald-600" : ""}`}
                  />
                  {item.name}
                </Link>
              );
            })}

            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col gap-4">
              {session ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      aria-current={pathname === "/admin" ? "page" : undefined}
                      className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <Settings className="h-5 w-5" aria-hidden="true" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    aria-label="Sign out of your account"
                    className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-red-500 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-center py-4 text-slate-600 font-bold hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
                  >
                    Log in to Account
                  </Link>
                  <Link
                    href="/register"
                    className="glow-btn text-center py-4 rounded-xl font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
