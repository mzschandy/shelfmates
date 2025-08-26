import { createClient } from "@/utils/supabase/server"
import axios from "axios"
import epub from "epubjs"
import { revalidatePath } from "next/cache"

export async function createSession(formData: FormData) {
  "use server"
  console.log("create session action hit")
  const supabase = await createClient()

  console.log("Creating session with formData:", formData)
  const greeting = await axios.get("http://localhost:8787/sessions/sessions")
  if (greeting) {
    console.log("Greeting from server:", greeting.data)
  }

  const sesTest = await axios.post(
    "http://localhost:8787/sessions/create-session",
    formData
  )
  if (sesTest) {
    console.log("Session test response:", sesTest.data)
  }
}

export async function joinClub(formData: FormData) {
  "use server"

  const supabase = await createClient();
  const userId = formData.get("user_id") as string
  const clubId = formData.get("club_id") as string

  const { data, error } = await supabase
    .from("club_members")
    .insert({ user_id: userId, club_id: clubId, is_admin: false }).select()

  if (error) {
    console.log("Error joining club:", error)
  }

  console.log("Successfully joined club:", data)

  revalidatePath(`/club/${clubId}`)
}