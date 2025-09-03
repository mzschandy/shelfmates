'use client'

import Link from "next/link"
import { Badge } from "../ui/badge"
import { prisma, type Session } from "@shelfmates/db"
import { useQuery } from "@tanstack/react-query"

export default function Session({
  isActive,
  clubId,
  session,
}: {
  isActive: boolean,
  clubId: string,
  session: Session
}) {
  const {data: bookData, isLoading} = useQuery({
    queryKey: ["sessionListerItem", session.id],
    queryFn: () => {
      const data = prisma.book.findFirst({
        where: {
          sessionId: session.id
        }
      })
      return data;
    }
  })
  
  return (
    <div className="border border-gray-600 rounded-sm cursor-pointer">
      <Link href={`/club/${clubId}/session/${session.title}`}>
      <div className="p-4">
        <div className="flex w-full">
          <div className="w-1/3 bg-amber-900">
            <div className="h-48 bg-blue-500 mock-image"></div>
          </div>
          <div className="w-2/3 bg-amber-500">
            {isActive && <Badge className="">Currently reading</Badge>}
            <div className="">{session.title}</div>
            <div className="">{bookData?.author}</div>
            <div>{new Date(session.createdAt).toDateString()}</div>
            <div>Finished xx/xx/xxxx</div>
            <div>Rating: 4/5</div>
          </div>
        </div>
      </div>
      </Link>
      
    </div>
  )
}
