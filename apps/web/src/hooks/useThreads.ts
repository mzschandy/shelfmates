import { client } from "@/utils/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useThreads = (threadId: string) => {
  const queryClient = useQueryClient();

  const { data: threadData, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
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

  const create

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
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async ({
      title, 
      description,
      clubId,
      sessionId,
      type
    }: {
      title: string;
      description?: string;
      clubId: string;
      sessionId: string;
      type: string;
    }) => {
      const res = await client.api.threads[":id"].thread.$post({
        json: {title, description, clubId, sessionId, type },
      });
    }
  })

};

export const useCreateComment = (threadId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentText,
      parentId,
      clubId,
    }: {
      commentText: string;
      parentId?: string;
      clubId: string;
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });
};
