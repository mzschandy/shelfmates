import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function SessionPage() {
  return (
    <div className="p-8">
            <Breadcrumb className="mb-4">
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/club">Book</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Session Name</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
      <div className="flex">
        <div>
          <div>
            <div className="text-xs">Our Rating: 3/5</div>
      <div className="text-3xl">Book Name</div>
      <div className="text-sm">by Author Name</div>
      <div className="w-[200px] h-[310px] bg-gray-600"></div>
          </div>
          <div className="mt-2">
            <Button className="w-full">Read</Button>
          </div>
        </div>
        <div className="ml-8">
          <div className="text-lg font-bold">Publisher Description</div>
          <div>
            <p>
              Just as she and her sister Diviners near the end of their service, a mysterious knight arrives at the cathedral. Rude, heretical, and devilishly handsome, the knight Rodrick has no respect for Sybil's visions. But when Sybil's fellow Diviners begin to vanish one by one, she has no choice but to seek his help in finding them. For the world outside the cathedral’s cloister is wrought with peril. Only the gods have the answers she is seeking, and as much as she d rather avoid Rodrick s dark eyes and sharp tongue, only a heretic can defeat a god. 
            </p>
            <p>
              </p>This is a random product description it has no bearing on what the actual group thinks of this book. I will probably get it from open library api or whatever that is called</div>
        </div>
      </div>
      <hr className="mt-4"/>
      <div>
        <Tabs defaultValue="threads" className="w-full mt-4">
        <div className="flex justify-between">
      <TabsList>
    <TabsTrigger value="threads">Threads</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>
                            <div><Button>Add New Thread</Button></div>

        </div>


  <TabsContent value="threads">
    <div className="flex flex-col mt-2 gap-1">
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">Hey did you guys like this</div>
        <div className="text-sm font-bold">Chapter 5</div>
        <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
        <div className="text-sm">52 Comments</div>
      </div>
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">Romantic interests, jacob vs edward</div>
        <div className="text-sm font-bold">General</div>
        <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
        <div className="text-sm">52 Comments</div>
      </div>
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">the ending</div>
        <div className="text-sm font-bold">Chapter 27</div>
        <div className="">Username: This is an initial comment that serves as a preview of sorts. You are not meant to see the whole thing</div>
        <div className="text-sm">52 Comments</div>
      </div>
    </div>
  </TabsContent>
  <TabsContent value="reviews">
    <div className="flex flex-col mt-2 gap-1">
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">Review by User1</div>
        <div className="">This book was amazing! I loved the characters and the plot twists.</div>
        <div className="text-sm">Rating: 5/5</div>
      </div>
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">Review by User2</div>
        <div className="">I found the book to be quite boring and predictable.</div>
        <div className="text-sm">Rating: 2/5</div>
      </div>
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">Review by User3</div>
        <div className="">An interesting read, but not my favorite.</div>
        <div className="text-sm">Rating: 3/5</div>
      </div>
    </div>
  </TabsContent>
</Tabs>
      </div>
    </div>
  );
}