/**
 * @file src/components/ui/Modal.tsx
 * @description Accessible modal dialog component.
 *
 * Meets WCAG 2.1 requirements:
 * - SC 1.3.1: role="dialog" with aria-modal="true"
 * - SC 2.1.1: Keyboard dismissible via Escape key
 * - SC 2.4.3: Focus management — moves focus to modal on open, restores on close
 * - SC 4.1.2: Labeled via aria-labelledby
 *
 * Uses a focus trap to prevent keyboard focus from leaving the modal.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Called when the modal should close (Escape key, backdrop click, close button) */
  onClose: () => void;
  /** Modal heading text — used for aria-labelledby */
  title: string;
  /** Optional modal body content */
  children: React.ReactNode;
  /** Maximum width class (default: max-w-md) */
  maxWidth?: string;
  /** Whether clicking the backdrop should close the modal */
  closeOnBackdrop?: boolean;
}

/** Focusable element selectors for focus trap */
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Fully accessible modal dialog with focus trap, keyboard dismissal,
 * and proper ARIA attributes.
 *
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Create New Goal"
 * >
 *   <GoalForm onSubmit={handleSubmit} />
 * </Modal>
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // Store element that triggered modal and restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the dialog container on open
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else {
      // Restore focus to the triggering element when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard event handler: Escape to close, Tab for focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: wrap focus to last element
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: wrap focus to first element
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      // Backdrop
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden="false"
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          "relative z-10 w-full",
          maxWidth,
          "bg-white rounded-3xl shadow-2xl border border-slate-100",
          "flex flex-col",
          "focus:outline-none",
          "animate-in fade-in zoom-in-95 duration-200",
        ].join(" ")}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2
            id={titleId}
            className="text-lg font-bold text-slate-900"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={[
              "rounded-xl p-1.5 text-slate-400",
              "hover:text-slate-700 hover:bg-slate-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
              "transition-colors",
            ].join(" ")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
