import { NextRequest, NextResponse } from "next/server";
import { connectFromAuthorizationCode } from "@/lib/connect";
import { InstagramApiError } from "@/lib/instagram";
import { consumeOAuthState, createSession } from "@/lib/session";
import { originFromRequest } from "@/lib/env";

function redirectHome(request: NextRequest, error: string) {
  const url = new URL("/", originFromRequest(request));
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const origin = originFromRequest(request);
  const params = request.nextUrl.searchParams;
  const igError = params.get("error");
  if (igError === "access_denied") {
    return redirectHome(request, "denied");
  }
  if (igError) {
    return redirectHome(
      request,
      params.get("error_description") || "Instagram returned an error. Connect Instagram again.",
    );
  }

  const state = params.get("state");
  const valid = await consumeOAuthState(state);
  if (!valid) {
    return redirectHome(request, "csrf");
  }

  const rawCode = params.get("code");
  if (!rawCode) {
    return redirectHome(request, "missing_code");
  }
  const code = rawCode.replace(/#_+$/, "");

  try {
    const { userId } = await connectFromAuthorizationCode(code);
    await createSession(userId);
    return NextResponse.redirect(new URL("/dashboard", origin));
  } catch (error) {
    if (error instanceof InstagramApiError) {
      const personal = error.message.toLowerCase().includes("business or creator");
      return redirectHome(request, personal ? "personal" : error.message);
    }
    const message =
      error instanceof Error
        ? error.message
        : "Could not finish Connect Instagram. Try again.";
    return redirectHome(request, message);
  }
}
