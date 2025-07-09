import Session from "@/components/sessions/session"
import Thread from "@/components/comments/thread"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"

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
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params
  const { data, error } = await supabase.auth.getUser()
  const { data: clubData, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", slug)
    .limit(1)
    .single()
  console.log("Club data:", clubData)
  return (
    <div className="p-8">
      <div className="">
        <div className="flex justify-between">
          <h1 className="text-3xl">Example Club</h1>
          {data.user ? <Button>Settings</Button> : null}
        </div>
        <div className="mt-2 flex justify-between">
          <div className="mt-4 flex align-middle">
            <Avatar className="cursor-pointer size-9">
              <AvatarImage alt={""} />
              <AvatarFallback>u</AvatarFallback>
            </Avatar>
            <div className="ml-0 mr-0 mt-auto mb-auto">
              The club admin is username
            </div>
          </div>
          {data.user ? (
            <div>
              <Button>Join Club</Button>
            </div>
          ) : null}
        </div>

        <div>
          Club Description this is a description of the club it could really be
          anything they want
        </div>
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
        {data.user ? <Button>Create New Session</Button> : null}
      </div>
      <div className="grid grid-cols-4 gap-4 cursor-pointer">
        {data.user ? (
          <div className="border border-gray-600 rounded-sm bg-gray-400">
            <div className="flex flex-col items-center justify-center mt-0 mb-0 ml-auto mr-auto h-full">
              <Button>+</Button>
              <div>Add a session</div>
            </div>
          </div>
        ) : null}
        <Session isActive={true} />
        <Session />
        <Session />
      </div>
      <div className="mt-4">
        {data.user ? (
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
