"use server";

import { prisma } from "@shelfmates/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * @deprecated
 * @param formData
 */
export async function createClub(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!title || !description) {
    throw new Error("Name and description are required");
  }
  // const userId = await getUserId();

  // if (!userId) {
  //   console.error("User not authenticated");
  //   redirect("/login");
  // }

  const newClub = await prisma.club.create({
    data: {
      title,
      description,
      isPublic: true,
      creatorId: "",
    },
  });
  if (newClub) {
    redirect(`/club/${newClub.id}`);
  } else {
    console.error("No club data returned after creation");
    revalidatePath("/browse", "page");
    redirect("/browse");
  }
}
