"use client";

import { useId, useState } from "react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="border-t border-border">
      {items.map((item, index) => {
        const expanded = open === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div key={item.q} className="border-b border-border">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-base font-semibold text-foreground sm:text-lg"
              >
                {item.q}
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    expanded ? "rotate-45" : ""
                  }`}
                >
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!expanded}
              className="grid transition-[grid-template-rows,opacity] duration-200 ease-out"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-5 pr-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
