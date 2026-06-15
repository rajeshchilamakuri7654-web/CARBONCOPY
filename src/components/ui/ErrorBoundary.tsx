/**
 * @file src/components/ui/ErrorBoundary.tsx
 * @description React class-based Error Boundary component.
 * Catches JavaScript errors in the component tree and renders a fallback UI
 * instead of crashing the entire page.
 *
 * Note: Error boundaries must be class components (React limitation).
 * This wraps a class component with a functional component API.
 */

"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback UI — if not provided, default error card is shown */
  fallback?: React.ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * React Error Boundary — catches errors in child component trees.
 * Place around feature sections to prevent full-page crashes.
 *
 * @example
 * <ErrorBoundary>
 *   <Dashboard />
 * </ErrorBoundary>
 */
class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center"
        >
          <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle
              className="h-7 w-7 text-red-500"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {this.state.error?.message ??
                "An unexpected error occurred. Please try refreshing the page."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundaryClass as ErrorBoundary };
