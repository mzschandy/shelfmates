import BookClub from "@/components/clubs/book-club"
import { createClient } from "@/utils/supabase/server"
import NewClubModal from "@/components/clubs/new-club-modal"
import { client } from "@/utils/client"

const getClubData = async () => {
  const res = await client.api.clubs.all.$get();

  if (!res.ok) {
    throw new Error("failed to get clubs")
  }

  const clubs = await res.json();
  return clubs.data;
}

export default async function Browse() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  const clubs = await getClubData();
  console.log('clubs from hono', clubs)
  return (
    <main className="w-full">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Book Clubs</h1>
          {data.user ? <NewClubModal user={data.user} /> : null}
        </div>
        <div className="grid grid-cols-4 gap-4 h-auto">
          {clubs?.length ? (
            clubs.map((club) => <BookClub key={club.id} club={club} />)
          ) : (
            <div className="col-span-4 text-center">No clubs available</div>
          )}
        </div>
      </div>
    </main>
  )
}
