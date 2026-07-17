"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface AppDialogProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function AppDialog({ isOpen, title, children, onClose }: AppDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const appRoot = document.querySelector<HTMLElement>("[data-app-root]");
    const previousAriaHidden = appRoot?.getAttribute("aria-hidden") ?? null;
    const wasInert = appRoot?.hasAttribute("inert") ?? false;
    appRoot?.setAttribute("aria-hidden", "true");
    appRoot?.setAttribute("inert", "");
    closeButtonRef.current?.focus();
    return () => {
      if (appRoot) {
        if (previousAriaHidden === null) appRoot.removeAttribute("aria-hidden");
        else appRoot.setAttribute("aria-hidden", previousAriaHidden);
        if (!wasInert) appRoot.removeAttribute("inert");
      }
      previousFocus.current?.focus();
    };
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!isOpen || typeof document === "undefined") return null;
  return createPortal(
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-labelledby="dialog-title"
        aria-modal="true"
        className="app-dialog"
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="dialog-heading">
          <h2 id="dialog-title">{title}</h2>
          <button aria-label="닫기" className="icon-button" onClick={onClose} ref={closeButtonRef} type="button">×</button>
        </div>
        <div className="dialog-content">{children}</div>
        <button className="button button-secondary" onClick={onClose} type="button">닫기</button>
      </section>
    </div>,
    document.body,
  );
}
