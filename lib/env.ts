function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill in every value.`,
    );
  }
  return value;
}

export function getEnv() {
  const databaseUrl = required("DATABASE_URL");
  if (process.env.NODE_ENV === "production" && !databaseUrl.includes("-pooler")) {
    throw new Error(
      "DATABASE_URL must be Neon's pooled connection string (hostname contains -pooler), not the direct one.",
    );
  }

  return {
    databaseUrl,
    appUrl: getAppUrl(),
    instagramAppId: required("INSTAGRAM_APP_ID"),
    instagramAppSecret: required("INSTAGRAM_APP_SECRET"),
    instagramRedirectUri: required("INSTAGRAM_REDIRECT_URI"),
    tokenEncryptionKey: required("TOKEN_ENCRYPTION_KEY"),
    sessionSecret: required("SESSION_SECRET"),
    cronSecret: required("CRON_SECRET"),
  };
}

export function getAppUrl() {
  const explicit = process.env.APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_URL is not set. Set it to the public https origin with no trailing slash.");
  }
  return "http://localhost:3000";
}

/** Same-origin redirects must use the request host, not APP_URL. */
export function originFromRequest(request: { nextUrl: { origin: string } }) {
  return request.nextUrl.origin.replace(/\/$/, "");
}
