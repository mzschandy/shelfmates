"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Logging in with email:", email)
  console.log("Logging in with password:", password)

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/browse")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string

  console.log("Signing up with email:", email)
  console.log("Signing up with username:", username)
  console.log("Signing up with password:", password)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })


  if (error) {
    console.log('error signing up:', error)
    console.log('data:', data)
    redirect("/error")
  } else {
    console.log('data:', data)
    console.log("User signed up successfully")
  }

  revalidatePath("/", "layout")
  redirect("/browse")
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/")
}
