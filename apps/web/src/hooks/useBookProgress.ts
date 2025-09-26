import { client } from "@/utils/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface BookProgressData {
  id: string;
  sessionId: string;
  profileId: string;
  updatedAt: string;
  lastCFI: string;
}


type BookProgressResponse = { error: string } | { data: BookProgressData };

export const useBookProgress = (sessionId: string) => {
  const { data: currentProgress, isLoading } = useQuery({
    queryKey: ["reader", sessionId, "progress"],
    queryFn: async () => {
      const res = await client.api.reader[":id"].progress.$get({
        param: {
          id: sessionId,
        },
      });

      const data: BookProgressResponse = await res.json();

      if ("error" in data) {
        throw new Error("error<<<<");
      }

      return data.data;
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (cfi: string) => {
      const res = await client.api.reader[":id"].progress.$post({
        json: {
          id: sessionId,
          lastCfi: cfi,
        },
        param: {
          id: sessionId,
        },
      });

      const data = await res.json();
      if ("error" in data) {
        throw new Error();
      }
      return data.data;
    }
  });

  return {
    currentProgress,
    saveProgress: saveProgressMutation.mutate,
    isLoading,
  };
};
