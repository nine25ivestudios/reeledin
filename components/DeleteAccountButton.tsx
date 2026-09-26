"use client";

import { useState, useTransition } from "react";
import { deleteMyAccount } from "@/app/dashboard/actions";

export function DeleteAccountButton({ className }: { className?: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !window.confirm(
        "This permanently deletes your ReeledIn profile, stored Instagram stats, and the encrypted access token. Your public link will stop working. Continue?",
      )
    ) {
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={className ?? "text-sm text-muted-foreground hover:text-destructive"}
      >
        {pending ? "Deleting…" : "Delete my ReeledIn"}
      </button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
