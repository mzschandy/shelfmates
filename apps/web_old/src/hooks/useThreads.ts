import { client } from "@/utils/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Comment {
  id: string;
  commentText: string;
  createdAt: string;
  updatedAt: string | null;
  parentId: string | null;
  depth: number;
  clubMember: {
    id: string;
    profile: {
      username: string | null;
      avatarUrl: string | null;
    };
  };
}

export interface Thread {
  id: string;
  title: string;
  description: string | null;
  comments: Comment[];
  clubId: string;
  sessionId: string | null;
}

export type ThreadMutationType = {
  title: string;
  description?: string;
  clubId: string;
  sessionId: string;
  type: string;
};

export enum ThreadType {
  GENERAL = "GENERAL",
  SESSION = "SESSION",
}

export const useThreads = (threadId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: threadData, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      if (!threadId) {
        throw new Error("Thread ID is required to create a comment");
      }

      const res = await client.api.threads[":id"].$get({
        param: { id: threadId },
      });

      const json = await res.json();

      if ("error" in json) {
        throw new Error(json.error);
      }

      return json.data as Thread;
    },
    enabled: !!threadId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({
      commentText,
      parentId,
      clubId,
    }: {
      commentText: string;
      parentId?: string;
      clubId: string;
    }) => {
      if (!threadId) {
        throw new Error("Thread ID is required to create a comment");
      }

      const res = await client.api.threads[":id"].comments.$post({
        param: { id: threadId },
        json: { commentText, parentId, clubId },
      });

      const json = await res.json();

      if ("error" in json) {
        throw new Error(json.error);
      }

      return json.data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
      router.refresh();
    },
    onError: (error) => {
      toast.error("Something went wrong");
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      clubId,
      sessionId,
      type,
    }: {
      title: string;
      description?: string;
      clubId: string;
      sessionId?: string;
      type: ThreadType;
    }) => {
      const res = await client.api.threads.thread.$post({
        json: { title, description, clubId, sessionId, type },
      });

      const json = await res.json();

      if ("error" in json) {
        throw new Error(json.error);
      }

      return json.data;
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (error) => {
      toast.error("Something went wrong");
    },
  });

  return {
    threadData,
    threadIsLoading: isLoading,
    createComment: createCommentMutation.mutate,
    createCommentIsLoading: createCommentMutation.isPending,
    createThread: createThreadMutation.mutate,
    createThreadIsLoading: createThreadMutation.isPending,
  };
};
