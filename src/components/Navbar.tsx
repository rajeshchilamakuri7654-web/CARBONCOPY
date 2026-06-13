"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Trophy, BookOpen, LogOut,
  Menu, X, Calculator, Activity, Mic, Settings
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, protected: true },
    { name: "Calculator", href: "/calculator", icon: Calculator, protected: false },
    { name: "Voice Agent", href: "/voice-agent", icon: Mic, protected: false },
    { name: "Education", href: "/education", icon: BookOpen, protected: false },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy, protected: false },
  ];

  const filteredNav = navigation.filter((item) => {
    if (item.protected && !session) return false;
    return true;
  });

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none hidden md:block">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          className="floating-nav pointer-events-auto rounded-full px-2 py-2 flex items-center justify-between"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-4 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">CarbonIQ</span>
          </Link>

          {/* Desktop Links with Framer Motion layoutId */}
          <div className="flex items-center gap-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 group"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-slate-100 rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon className={`h-3.5 w-3.5 relative z-10 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span className={`relative z-10 transition-colors ${isActive ? 'text-emerald-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
            {session ? (
              <div className="flex items-center gap-2">
                {session.user?.email === "admin@carbon.com" && (
                  <Link
                    href="/admin"
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Admin Panel"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="glow-btn px-4 py-1.5 rounded-full text-xs font-extrabold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* Mobile Nav Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900">CarbonIQ</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 p-2 -mr-2 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-2"
          >
            {filteredNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-4 rounded-2xl font-semibold transition-all ${
                  pathname === item.href 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-emerald-600' : ''}`} />
                {item.name}
              </Link>
            ))}
            
            <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col gap-4">
              {session ? (
                <>
                  {session.user?.email === "admin@carbon.com" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <Settings className="h-5 w-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-4 text-slate-600 font-bold hover:text-slate-900"
                  >
                    Log in to Account
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="glow-btn text-center py-4 rounded-xl font-extrabold"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
