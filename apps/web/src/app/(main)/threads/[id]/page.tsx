"use client";

import { useThreads } from "@/hooks/useThreads";
import { CommentList } from "@/components/threads/comment-list";
import { CommentForm } from "@/components/threads/comment-form";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const { data: thread, isLoading, error } = useThreads(threadId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Error loading thread: {error.message}
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Thread not found
      </div>
    );
  }

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
        <CommentForm threadId={threadId} clubId={thread.clubId} />
      </div>

      <CommentList
        comments={thread.comments}
        threadId={threadId}
        clubId={thread.clubId}
      />
    </div>
  );
}
