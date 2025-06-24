import { Button } from "@/components/ui/button"
import BookClub from "./_components/book-club"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Browse() {
  const supabase = await createClient()
  // const { data, error } = await supabase.auth.getUser()
  // if (error || !data?.user) {
  //   redirect("/login")
  // }

  // console.log("User data:", data.user);

  return (
    <main className="w-full">
      <div className="p-4">
        {/* <div><p>Hello {data.user.email}</p></div> */}
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Book Clubs</h1>
          <Button>Create Book Club</Button>
        </div>
        <div className="grid grid-cols-4 gap-4 h-auto">
          <BookClub />
          <BookClub />
          <BookClub />
          <BookClub />
          <BookClub />
          <BookClub />
          <BookClub />
        </div>
      </div>
    </main>
  )
}
