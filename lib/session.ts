import { cookies } from "next/headers";
import { hmacSign, hmacVerify, randomToken } from "./crypto";

const SESSION_COOKIE = "reeledin_session";
const OAUTH_STATE_COOKIE = "ig_oauth_state";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;
const STATE_MAX_AGE_SEC = 60 * 10;

type SessionPayload = {
  userId: string;
  exp: number;
};

export async function createSession(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${body}.${hmacSign(body)}`;
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    if (!hmacVerify(body, sig)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export async function setOAuthState(): Promise<string> {
  const state = randomToken(24);
  cookies().set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SEC,
  });
  return state;
}

export async function consumeOAuthState(incoming: string | null): Promise<boolean> {
  const stored = cookies().get(OAUTH_STATE_COOKIE)?.value;
  cookies().delete(OAUTH_STATE_COOKIE);
  if (!incoming || !stored) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(incoming);
  if (a.length !== b.length) return false;
  const { timingSafeEqual } = await import("crypto");
  return timingSafeEqual(a, b);
}
