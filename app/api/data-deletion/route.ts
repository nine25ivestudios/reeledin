import { NextRequest, NextResponse } from "next/server";
import { hmacSign, randomToken } from "@/lib/crypto";
import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { parseSignedRequest } from "@/lib/signed-request";

export async function GET() {
  return NextResponse.json({
    endpoint: "Meta data-deletion callback",
    method: "POST",
    expects: "signed_request from Instagram / Facebook",
    human: "Signed-in users can delete at /data-deletion. Anyone can email nine25ive.studios@gmail.com. Instagram Apps and websites deletion POSTs here; we delete the connected user, tokens, stats, audience snapshots, daily insights, and profile.",
    instructions: `${getAppUrl()}/data-deletion`,
    status_page: `${getAppUrl()}/deletion-status`,
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const signed =
    form?.get("signed_request")?.toString() ??
    (await request.json().catch(() => null) as { signed_request?: string } | null)?.signed_request;

  if (!signed) {
    return NextResponse.json(
      { error: "Meta must POST a signed_request. This endpoint is the data-deletion callback." },
      { status: 400 },
    );
  }

  let userId: string | undefined;
  try {
    userId = parseSignedRequest(signed).user_id;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not verify signed_request.",
      },
      { status: 400 },
    );
  }

  if (userId) {
    try {
      const account = await prisma.connectedAccount.findUnique({
        where: { platform_externalId: { platform: "instagram", externalId: userId } },
      });
      if (account) {
        await prisma.user.delete({ where: { id: account.userId } });
      }
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `Deletion failed in the database: ${error.message}`
              : "Deletion failed in the database.",
        },
        { status: 500 },
      );
    }
  }

  const confirmationCode = randomToken(12);
  const url = `${getAppUrl()}/deletion-status?code=${encodeURIComponent(confirmationCode)}&sig=${encodeURIComponent(hmacSign(confirmationCode))}`;

  return new NextResponse(`{ url: '${url}', confirmation_code: '${confirmationCode}' }`, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
