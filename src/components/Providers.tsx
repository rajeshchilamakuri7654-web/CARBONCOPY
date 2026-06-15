/**
 * @file src/components/Providers.tsx
 * @description Application-level providers wrapper.
 * Includes NextAuth SessionProvider and global ErrorBoundary.
 */

"use client";

import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers component — wraps the entire application.
 * Order: ErrorBoundary → SessionProvider → children
 *
 * The ErrorBoundary at this level ensures session errors are caught
 * and shown as recoverable UI rather than a blank crash.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>{children}</SessionProvider>
    </ErrorBoundary>
  );
}
