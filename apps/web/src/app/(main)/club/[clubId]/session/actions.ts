import { createClient } from "@/utils/supabase/server"
import axios from "axios"
import epub from "epubjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface SessionData {
  title: string,
  isActive: boolean,
  createdAt: string,
  id: string,
  bookId: string,
  clubId: string
}

export async function createSession(formData: FormData) {
  "use server"
  console.log("create session action hit")
  console.log("Creating session with formData:", formData)
  const clubId = formData.get("clubId") as string

  const greeting = await axios.get("http://localhost:8787/api/sessions")
  if (greeting) {
    console.log("Greeting from server:", greeting.data)
  }

  const {data} = await axios.post(
    "http://localhost:8787/api/sessions/create-session",
    formData
  )
  if (data) {
    console.log("Session test response:", data)
  }

    redirect(`/club/${clubId}/session/${data.title}`)
}

export async function joinClub(formData: FormData) {
  "use server"

  const supabase = await createClient();
  const userId = formData.get("user_id") as string
  const clubId = formData.get("clubId") as string

  const { data, error } = await supabase
    .from("club_members")
    .insert({ user_id: userId, club_id: clubId, is_admin: false }).select()

  if (error) {
    console.log("Error joining club:", error)
  }

  console.log("Successfully joined club:", data)

  revalidatePath(`/club/${clubId}`)
}