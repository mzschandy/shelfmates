import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ClubPage() {
  return (
    <div className="p-8">

      <div className="">
        <div className="flex justify-between">
          <h1 className="text-3xl">Example Club</h1>
          <Button>Settings</Button>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="mt-4 flex align-middle">
                  <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={""} />
          <AvatarFallback>u</AvatarFallback>
        </Avatar>
          <div className="ml-0 mr-0 mt-auto mb-auto">The club admin is username</div>
        </div>
        <div><Button>Join Club</Button></div>
        </div>

        <div>Club Description this is a description of the club it could really be anything they want</div>
        <div className="flex">
          <div>
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
          <div className="ml-2 self-center"> and 35 more are reading current_book_here</div>
        </div>
      </div>
      <div className="mt-4 mb-4 flex justify-between">
        <div className="text-xl">Sessions</div>
        <Button>Create New Session</Button>
      </div>
      <div className="grid grid-cols-4 gap-4 cursor-pointer">
        <div className="border border-gray-600 rounded-sm bg-gray-400">
          <div className="flex flex-col items-center justify-center mt-0 mb-0 ml-auto mr-auto h-full">
            <Button>+</Button>
            <div>Add a session</div>
          </div>
        </div>
        <div className="border border-gray-600 rounded-sm cursor-pointer">
          <div className="p-4">
            <div className="flex w-full">
              <div className="w-1/3 bg-amber-900">
              <div className="h-48 bg-blue-500 mock-image"></div></div>
              <div className="w-2/3 bg-amber-500">
                <Badge className="">Currently reading</Badge>
                <div className="">Book Name</div>
                <div className="">Author</div>
                <div>Started xx/xx/xxxx</div>
                <div>Finished xx/xx/xxxx</div>
                <div>Rating: 4/5</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-gray-600 rounded-sm">
          <div className="p-4">
            <div className="flex w-full">
              <div className="w-1/3 bg-amber-900">
              <div className="h-48 bg-blue-500 mock-image"></div></div>
              <div className="w-2/3 bg-amber-500">
                <div className="">Book Name</div>
                <div className="">Author</div>
                <div>Started xx/xx/xxxx</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-gray-600 rounded-sm">
          <div className="p-4">
            <div className="flex w-full">
              <div className="w-1/3 bg-amber-900">
              <div className="h-48 bg-blue-500 mock-image"></div></div>
              <div className="w-2/3 bg-amber-500">
                <div className="">Book Name</div>
                <div className="">Author</div>
                <div>Started xx/xx/xxxx</div>
              </div>
            </div>
          </div>
        </div>
        <div className="border border-gray-600 rounded-sm">
          <div className="p-4">
            <div className="flex w-full">
              <div className="w-1/3 bg-amber-900">
              <div className="h-48 bg-blue-500 mock-image"></div></div>
              <div className="w-2/3 bg-amber-500">
                <div className="">Book Name</div>
                <div className="">Author</div>
                <div>Started xx/xx/xxxx</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-2xl mt-4">Threads</div>
        <div className="flex flex-col mt-2 gap-1">
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
          <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
            <div className="text-lg">General Discussion</div>
            <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
            <div className="text-sm">52 Comments</div>
          </div>
        </div>
      </div>
    </div>
  )
}