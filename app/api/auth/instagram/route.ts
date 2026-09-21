import { NextRequest, NextResponse } from "next/server";
import { instagramAuthorizeUrl } from "@/lib/instagram";
import { setOAuthState } from "@/lib/session";
import { originFromRequest } from "@/lib/env";

export async function GET(request: NextRequest) {
  try {
    const state = await setOAuthState();
    return NextResponse.redirect(instagramAuthorizeUrl(state));
  } catch (error) {
    const message = error instanceof Error ? error.message : "config";
    const url = new URL("/", originFromRequest(request));
    url.searchParams.set("error", message.includes("not set") ? "config" : message);
    return NextResponse.redirect(url);
  }
}
