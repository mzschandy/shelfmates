import Session from "@/components/sessions/session"
import Thread from "@/components/comments/thread"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import NewSessionModal from "@/components/sessions/new-session-modal"
import { joinClub } from "./session/actions"
import {
  checkAuthPermissions,
  getLoggedInUser,
  getUserByUserId,
  getUserId,
} from "@/lib/data"
import { client } from "@/utils/client"

interface ClubMember {
  id: string
  clubId: string
  clubIdOld: number
  createdAt: string
  isAdmin: boolean
}

interface ClubData {
  createdAt: string
  creatorId: string
  description: string
  id: string
  idOld: string
  isPublic: string
  title: string
}

const getClubPermissionsForUser = async (clubTitle: string, userId: string) => {
  const res = await client.api.clubs[":title"].permissions[":userId"].$get({
    param: {
      title: clubTitle,
      userId,
    },
  })

  if (!res.ok) {
    throw new Error("Could not get club permissions")
  }

  const {
    data: { isLoggedIn, isMember, isAdmin },
  } = await res.json()

  return {
    isLoggedIn,
    isMember,
    isAdmin,
  }
}

const getClubData = async (clubTitle: string) => {
  const res = await client.api.clubs[":title"].$get({
    param: {
      title: clubTitle,
    },
  })

  if (!res.ok) {
    throw new Error("Could not get club data")
  }

  const club = await res.json()
  return club.data
}

function ThreadsLister() {
  return (
    <>
      <div className="text-2xl mt-4">Threads</div>
      <div className="flex flex-col mt-2 gap-1">
        <Thread />
        <Thread />
        <Thread />
        <Thread />
        <Thread />
      </div>
    </>
  )
}

function AvatarList() {
  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
      <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/leerob.png" alt="@leerob" />
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit"
          />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ clubId: string }>
}) {
  const { clubId } = await params
  const userId = await getUserId()
  console.log("club Id", clubId)
  console.log("club id combined", clubId.split("-").join(" "))

  if (!userId) {
    throw new Error("User not authorized")
  }

  const clubData = await getClubData(clubId)
  const { isLoggedIn, isMember, isAdmin } = await getClubPermissionsForUser(
    clubId,
    userId
  )

  console.log(
    "auth check w/ prisma, isLoggedIn, isMember, isAdmin",
    isLoggedIn,
    isMember,
    isAdmin
  )

  if (!clubData) {
    return <div>Error fetching club data</div>
  }
  const creator = await getUserByUserId(clubData?.creatorId)
  console.log("prisma club data", clubData)
  console.log("prisma creator", creator ?? "")
  const profile = await getLoggedInUser()
  console.log("prisma profile", profile)

  return (
    <div className="p-8">
      <div className="">
        <div className="flex justify-between">
          <h1 className="text-3xl">{clubData.title}</h1>
          {isAdmin && <Button>Settings</Button>}
        </div>
        <div className="mt-2 flex justify-between">
          <div className="mt-4 flex align-middle">
            <Avatar className="cursor-pointer size-9">
              <AvatarImage alt={""} />
              <AvatarFallback>u</AvatarFallback>
            </Avatar>
            <div className="ml-0 mr-0 mt-auto mb-auto">
              The club admin is <b>{creator?.username}</b>
            </div>
          </div>
          {!isMember && (
            <div>
              <form>
                <input type="hidden" name="user_id" value={profile?.id} />
                <input type="hidden" name="club_id" value={clubData.id} />
                <Button formAction={joinClub} type="submit">
                  Join Club
                </Button>
              </form>
            </div>
          )}
        </div>

        <div>{clubData.description}</div>
        <div className="flex">
          <AvatarList />
          <div className="ml-2 self-center">
            {" "}
            and 35 more are reading current_book_here
          </div>
        </div>
      </div>
      <div className="mt-4 mb-4 flex justify-between">
        <div className="text-xl">Sessions</div>
        {isAdmin && profile && (
          <NewSessionModal clubId={clubData.id} clubMemberId={profile?.id} />
        )}
      </div>
      {clubData.sessions.length === 0 ? (
        <div className="w-full h-24 border border-gray-600 rounded-sm">
          <div>No sessions</div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 cursor-pointer">
          {clubData.sessions.map((session) => (
            <Session
              session={session}
              clubTitle={clubId}
              key={session.id}
              isActive={session.isActive}
            />
          ))}
        </div>
      )}
      <div className="mt-4">
        {isLoggedIn && isMember ? (
          <ThreadsLister />
        ) : (
          <div className="border rounded-sm border-gray-300 p-4">
            You must be a member of the club to see threads and reviews
          </div>
        )}
      </div>
    </div>
  )
}
