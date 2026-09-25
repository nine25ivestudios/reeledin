"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

/** The only creator-editable setting: whether /[handle] resolves for anyone else. */
export async function setPublicVisibility(isPublic: boolean): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Your session expired. Connect Instagram again to change visibility." };

  try {
    const profile = await prisma.profile.update({
      where: { userId },
      data: { isPublic: Boolean(isPublic) },
      select: { slug: true },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/${profile.slug}`);
    return {};
  } catch {
    return { error: "Could not update visibility. Try again in a moment." };
  }
}
