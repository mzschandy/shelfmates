import { Button } from "@/components/ui/button"
import BookClub from "@/components/clubs/book-club"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClub } from "../club/actions"
import NewClubModal from "@/components/clubs/new-club"

export default async function Browse() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  const { data: clubsData, error: clubsError } = await supabase
    .from("clubs")
    .select("*")
  console.log("clubs data", clubsData)

  return (
    <main className="w-full">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Book Clubs</h1>
          {data.user ? <NewClubModal user={data.user} /> : null}
        </div>
        <div className="grid grid-cols-4 gap-4 h-auto">
          {clubsData?.length ? (
            clubsData.map((club) => <BookClub key={club.id} club={club} />)
          ) : (
            <div className="col-span-4 text-center">No clubs available</div>
          )}
        </div>
      </div>
    </main>
  )
}
