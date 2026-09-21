import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Log in with Connect Instagram before editing your profile." },
      { status: 401 },
    );
  }

  let body: { displayName?: string; niche?: string; bio?: string; isPublic?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Send JSON with displayName, niche, bio, and isPublic." },
      { status: 400 },
    );
  }

  const displayName = (body.displayName ?? "").trim();
  const niche = (body.niche ?? "").trim();
  const bio = (body.bio ?? "").trim();
  const isPublic = Boolean(body.isPublic);

  if (!displayName) {
    return NextResponse.json({ error: "Display name cannot be empty." }, { status: 400 });
  }
  if (displayName.length > 80) {
    return NextResponse.json({ error: "Display name must be 80 characters or fewer." }, { status: 400 });
  }
  if (niche.length > 40) {
    return NextResponse.json({ error: "Niche must be 40 characters or fewer." }, { status: 400 });
  }
  if (bio.length > 280) {
    return NextResponse.json({ error: "Bio must be 280 characters or fewer." }, { status: 400 });
  }

  try {
    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json(
        { error: "No profile exists yet. Connect Instagram again to create one." },
        { status: 404 },
      );
    }

    await prisma.profile.update({
      where: { userId },
      data: { displayName, niche, bio, isPublic },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Could not save profile: ${error.message}`
            : "Could not save profile to the database.",
      },
      { status: 500 },
    );
  }
}
