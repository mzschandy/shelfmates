export default function BookClub() {
  return (
    <div className="border rounded-sm p-4 w-auto flex flex-col">
      <div className="size-48 bg-gray-500"></div>
      <div className="flex flex-col mt-2">
        <div className="text-xs text-gray-500">Zach is hosting</div>
        <div className="text-lg font-bold">Book Club Name</div>
        <div className="text-sm text-gray-500">
          Description of the book club goes here. It can be a brief overview of
          what the club is about.
        </div>
      </div>
    </div>
  )
}
