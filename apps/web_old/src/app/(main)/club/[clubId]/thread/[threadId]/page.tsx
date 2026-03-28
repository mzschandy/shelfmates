import { CommentList } from "@/components/threads/comment-list";
import { CommentForm } from "@/components/threads/comment-form";
import { Loader2 } from "lucide-react";
import { serverClient } from "@/utils/server";

const getThreadById = async (id: string) => {
  const res = await serverClient.api.threads[":id"].$get({
    param: { id },
  });

  if (!res.ok) {
    throw new Error("failed to get threads");
  }

  const threadData = await res.json();
  return threadData.data;
};

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;

  const thread = await getThreadById(threadId);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
        {thread.description && (
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {thread.description}
          </p>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Post a Comment</h3>
        <CommentForm threadId={threadId} clubId={thread.clubId ?? ""} />
      </div>

      <CommentList
        comments={thread.comments}
        threadId={threadId}
        clubId={thread.clubId ?? ""}
      />
    </div>
  );
}
