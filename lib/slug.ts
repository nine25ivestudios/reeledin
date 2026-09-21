const RESERVED = new Set([
  "dashboard",
  "privacy",
  "api",
  "login",
  "logout",
  "deletion-status",
  "connect",
]);

export function slugFromUsername(username: string): string {
  const base = username
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 30);
  const candidate = base.length > 0 ? base : "creator";
  return RESERVED.has(candidate) ? `${candidate}ig` : candidate;
}

export function slugWithSuffix(base: string, attempt: number): string {
  if (attempt === 0) return base;
  return `${base}${attempt}`;
}
