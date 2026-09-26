"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, getSessionUserId } from "@/lib/session";

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

/** Removes the signed-in user and every cascaded Instagram record. */
export async function deleteMyAccount(): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Your session expired. Connect Instagram again, then retry deletion." };

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return { error: "Could not delete the account. Email nine25ive.studios@gmail.com and we will do it." };
  }

  await destroySession();
  redirect("/");
}
