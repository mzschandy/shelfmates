import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SessionMetadata from "@/components/sessions/session-metadata";
import { serverClient } from "@/utils/server";
import Link from "next/link";
import NewThreadModal from "@/components/threads/new-thread-modal";

const getSessionData = async (sessionId: string) => {
  const res = await serverClient.api.sessions[":title"].$get({
    param: {
      title: sessionId,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get session data");
  }
  const sessionData = await res.json();
  return sessionData.data;
};

const getBookData = async (bookId: string) => {
  const res = await serverClient.api.sessions.book[":id"].$get({
    param: {
      id: bookId,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to get book data");
  }

  const bookData = await res.json();
  return bookData.data;
};

const getSessionThreads = async (sessionId: string) => {
  const res = await serverClient.api.sessions[":id"].threads.$get({
    param: {
      id: sessionId,
    },
  });

  if (!res.ok) {
    throw new Error("failed to get threads");
  }

  const threadsData = await res.json();
  return threadsData.data;
};

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  console.log("session id", sessionId);
  const sessionData = await getSessionData(sessionId);
  const bookData = await getBookData(sessionData.bookId ?? "");
  const threadsData = await getSessionThreads(sessionData.id);
  const threads = sessionData.threads;

  const createParam = () => {
    const title = sessionData.club.title.toLowerCase().split(" ");
    if (title.length > 1) {
      return title.join("-");
    }
    return title;
  };
  console.log("sess data", sessionData);
  console.log("book data", bookData);
  console.log("threads", threadsData);
  console.log("threads from sessionData", threads);
  return (
    <div className="p-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/club">
              {sessionData.club.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{sessionData.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex">
        <SessionMetadata
          bookProps={{
            title: sessionData?.book?.title ?? "",
            author: sessionData?.book?.author ?? "",
            sessionId: sessionData.id,
          }}
        />
      </div>
      <hr className="mt-4" />
      <div>
        <Tabs defaultValue="threads" className="w-full mt-4">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="threads">Threads</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <div>
              <NewThreadModal
                clubId={sessionData.clubId}
                sessionId={sessionData.id}
              />
            </div>
          </div>

          <TabsContent value="threads">
            <div className="flex flex-col mt-2 gap-1">
              {!threadsData.length && <div>No threads yet</div>}
              {threadsData.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/club/${createParam()}/thread/${thread.id}`}
                  className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer"
                >
                  <div className="text-lg">{thread.title}</div>
                  <div className="text-sm font-bold">
                    {thread.description ?? ""}
                  </div>
                  {thread.comments.length > 0 ? (
                    <div className="text-sm">
                      {thread.comments.length} Comments
                    </div>
                  ) : (
                    <div className="text-sm">No commments yet</div>
                  )}
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="flex flex-col mt-2 gap-1">
              <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
                <div className="text-lg">Review by User1</div>
                <div className="">
                  This book was amazing! I loved the characters and the plot
                  twists.
                </div>
                <div className="text-sm">Rating: 5/5</div>
              </div>
              <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
                <div className="text-lg">Review by User2</div>
                <div className="">
                  I found the book to be quite boring and predictable.
                </div>
                <div className="text-sm">Rating: 2/5</div>
              </div>
              <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
                <div className="text-lg">Review by User3</div>
                <div className="">
                  An interesting read, but not my favorite.
                </div>
                <div className="text-sm">Rating: 3/5</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
