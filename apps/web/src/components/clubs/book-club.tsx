import Link from "next/link"

export default function BookClub({ club }: { club: any }) {
  console.log("Club data:", club)

  if (!club) {
    return <div>Error displaying club</div>
  }

  return (
    <Link href={`/club/${club.id}`} className="no-underline">
      <div className="border rounded-sm p-4 w-auto flex flex-col">
        <div className="size-48 bg-gray-500"></div>
        <div className="flex flex-col mt-2">
          <div className="text-xs text-gray-500">
            {club.creator_id} is hosting
          </div>
          <div className="text-lg font-bold">{club.title}</div>
          <div className="text-sm text-gray-500">
            {club.description || "No description available"}
          </div>
        </div>
      </div>
    </Link>
  )
}
