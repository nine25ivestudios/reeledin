"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Props = {
  displayName: string;
  niche: string;
  bio: string;
  isPublic: boolean;
};

export function ProfileForm({ displayName, niche, bio, isPublic }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("pending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: String(form.get("displayName") ?? ""),
          niche: String(form.get("niche") ?? ""),
          bio: String(form.get("bio") ?? ""),
          isPublic: form.get("isPublic") === "on",
        }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setState("error");
        setMessage(body.error ?? "Profile did not save. Fix the fields and save again.");
        return;
      }
      setState("success");
      setMessage("Profile saved. Your public link shows the new copy.");
      router.refresh();
      window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setMessage("Could not reach Reeledin to save. Check your connection and try again.");
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="block">
        <span className="text-sm text-muted-foreground">Display name</span>
        <input name="displayName" defaultValue={displayName} required maxLength={80} className={field} />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">Niche</span>
        <input
          name="niche"
          defaultValue={niche}
          maxLength={40}
          placeholder="Food, fashion, fitness…"
          className={field}
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted-foreground">Bio</span>
        <textarea name="bio" defaultValue={bio} maxLength={280} rows={4} className={field} />
      </label>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={isPublic}
          className="h-4 w-4 rounded border-border"
        />
        Public link is visible
      </label>
      <button
        type="submit"
        disabled={state === "pending"}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[#0086dd] disabled:opacity-60"
      >
        {state === "pending" ? "Saving…" : "Save profile"}
      </button>
      {state === "success" ? <p className="text-sm text-success">{message}</p> : null}
      {state === "error" ? <p className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
