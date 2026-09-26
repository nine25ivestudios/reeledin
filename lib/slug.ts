import { prisma } from "./prisma";

const RESERVED = new Set([
  "dashboard",
  "privacy",
  "api",
  "login",
  "logout",
  "deletion-status",
  "connect",
  "demo",
  "sample",
  "terms",
  "contact",
  "data-deletion",
]);

/**
 * The public path is the Instagram handle. Instagram allows letters, digits, `.` and `_`
 * (1–30 characters), so those are kept; only other characters are dropped.
 */
export function slugFromUsername(username: string): string {
  const base = username
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._]+/g, "")
    .slice(0, 30);
  const candidate = /[a-z0-9]/.test(base) ? base : "creator";
  return RESERVED.has(candidate) ? `${candidate}ig` : candidate;
}

export function slugWithSuffix(base: string, attempt: number): string {
  if (attempt === 0) return base;
  return `${base}${attempt}`;
}

export async function uniqueSlug(username: string, userId: string): Promise<string> {
  const base = slugFromUsername(username);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = slugWithSuffix(base, attempt);
    const existing = await prisma.profile.findUnique({ where: { slug } });
    if (!existing || existing.userId === userId) return slug;
  }
  return `${base}${Date.now().toString(36)}`;
}
