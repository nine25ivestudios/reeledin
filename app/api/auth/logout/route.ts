import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { originFromRequest } from "@/lib/env";

export async function POST(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL("/", originFromRequest(request)), { status: 303 });
}
