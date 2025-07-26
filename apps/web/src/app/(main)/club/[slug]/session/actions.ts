import { createClient } from "@/utils/supabase/server"
import axios from "axios"
import epub from "epubjs"

export async function createSession(formData: FormData) {
  "use server"
  console.log("create session action hit")
  const supabase = await createClient()

  console.log("Creating session with formData:", formData)
  const greeting = await axios.get("http://localhost:8787/sessions/sessions")
  if (greeting) {
    console.log("Greeting from server:", greeting.data)
  }

  // const epubFile = formData.get("book") as File
  // if (!epubFile) {
  //   console.error("No epub file found in formData")
  //   return { error: "Epub file is required" }
  // }

  // const newBook = epub(epubFile.name)
  // await newBook.opened // Wait for the book to be opened
  // console.log("Creating new book instance:", newBook.loaded.metadata)

  const sesTest = await axios.post(
    "http://localhost:8787/sessions/create-session",
    formData
  )
  if (sesTest) {
    console.log("Session test response:", sesTest.data)
  }
}
