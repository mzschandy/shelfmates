import { Badge } from "../ui/badge"

export default function Session({
  isActive,
  session,
}: {
  isActive?: boolean
  session?: any
}) {
  return (
    <div className="border border-gray-600 rounded-sm cursor-pointer">
      <div className="p-4">
        <div className="flex w-full">
          <div className="w-1/3 bg-amber-900">
            <div className="h-48 bg-blue-500 mock-image"></div>
          </div>
          <div className="w-2/3 bg-amber-500">
            {isActive ? <Badge className="">Currently reading</Badge> : null}
            <div className="">Book Name</div>
            <div className="">Author</div>
            <div>Started xx/xx/xxxx</div>
            <div>Finished xx/xx/xxxx</div>
            <div>Rating: 4/5</div>
          </div>
        </div>
      </div>
    </div>
  )
}
