'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { use } from "react";

export async function createClub(formData: FormData) {
  console.log("server action hit")
  const supabase = await createClient();

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  if (!title || !description) {
    throw new Error("Name and description are required")
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    redirect("/login");
  }

  console.log("Creating club with user:", user);

  const { data, error } = await supabase.from("clubs").insert({
    title,
    description,
    is_public: true,
    creator_id: user?.id,
  }).select()

  console.log("Club created:", data);

  if (error) {
    console.log("Error creating club:", error);
    redirect("/browse");
  }

  if (data && data.length > 0) {
    redirect(`/club/${data[0]?.id}`)
  } else {
    console.error("No club data returned after creation");
    revalidatePath("/browse", "page"); 
    redirect("/browse");
  }

}