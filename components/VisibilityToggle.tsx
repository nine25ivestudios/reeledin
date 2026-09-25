"use client";

import { useState, useTransition } from "react";
import { setPublicVisibility } from "@/app/dashboard/actions";

export function VisibilityToggle({ initial }: { initial: boolean }) {
  const [isPublic, setIsPublic] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isPublic;
    setIsPublic(next);
    setError("");
    startTransition(async () => {
      const result = await setPublicVisibility(next);
      if (result.error) {
        setIsPublic(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p id="visibility-label" className="text-sm font-medium text-foreground">
            Public link is visible
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isPublic
              ? "Anyone with your link can see this profile."
              : "Only you can see this profile. Your link shows a not-found page."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-labelledby="visibility-label"
          onClick={toggle}
          disabled={pending}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
            isPublic ? "border-primary bg-primary" : "border-border bg-background"
          }`}
        >
          <span
            aria-hidden
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
