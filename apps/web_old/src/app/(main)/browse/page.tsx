import BookClub from "@/components/clubs/book-club";
import NewClubModal from "@/components/clubs/new-club-modal";
import { serverClient } from "@/utils/server";

const getClubData = async () => {
  const res = await serverClient.api.clubs.all.$get();

  if (!res.ok) {
    throw new Error("failed to get clubs");
  }

  const clubs = await res.json();
  return clubs.data;
};

const getLoggedInUser = async () => {
  const res = await serverClient.api.users["current-user"].$get();

  if (!res.ok) {
    throw new Error("Could not get user");
  }

  const user = await res.json();

  return { isUser: !!user.data, user: user.data ?? null };
};

export default async function Browse() {
  const { isUser, user } = await getLoggedInUser();
  const clubs = await getClubData();
  console.log("clubs from hono", clubs);
  return (
    <main className="w-full">
      <div className="p-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-4">Book Clubs</h1>
          {isUser ? <NewClubModal user={user} /> : null}
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
  );
}
