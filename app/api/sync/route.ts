import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { InstagramApiError } from "@/lib/instagram";
import { syncAccount, syncAllAccounts } from "@/lib/sync";

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (auth?.startsWith("Bearer ") && cronSecret && auth.slice(7) === cronSecret) {
    try {
      const result = await syncAllAccounts();
      return NextResponse.json({ synced: true, ...result });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Bulk sync failed: ${error.message}`
              : "Bulk sync failed talking to Instagram or the database.",
        },
        { status: 500 },
      );
    }
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Log in with Connect Instagram before using Sync now." },
      { status: 401 },
    );
  }

  const account = await prisma.connectedAccount.findFirst({
    where: { userId, platform: "instagram" },
  });
  if (!account) {
    return NextResponse.json(
      { error: "No Instagram account is connected. Connect Instagram first." },
      { status: 404 },
    );
  }

  try {
    await syncAccount(account.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof InstagramApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Sync failed talking to Instagram or the database. Try Sync now again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    error: "Use POST. Session cookie for one account, or Authorization: Bearer CRON_SECRET for all.",
  }, { status: 405 });
}
