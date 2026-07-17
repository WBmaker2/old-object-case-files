"use client";

import { type ReactNode, useId, useState } from "react";

interface CollapsibleSectionProps {
  className: string;
  label: string;
  children: ReactNode;
}

export function CollapsibleSection({ className, label, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  return (
    <section className={className}>
      <button aria-controls={contentId} aria-expanded={isOpen} className="disclosure-button" onClick={() => setIsOpen((current) => !current)} type="button">
        {label} {isOpen ? "접기" : "펼치기"}
      </button>
      <div hidden={!isOpen} id={contentId}>{children}</div>
    </section>
  );
}
