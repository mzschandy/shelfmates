"use client";

import { client } from "@/utils/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface NewSessionData {
  epubFile: File;
  clubId: string;
  clubMemberId: string;
}

type SessionData = {
  clubId: string;
  title: string;
  createdAt: string;
  id: string;
  isActive: boolean;
  bookId: string | null;
};

type CreateSessionRepsone = { error: string } | { data: SessionData };

export const useCreateSession = (clubId: string) => {
  const router = useRouter();

  const createSessionParam = (sessionTitle: string) => {
    const title = sessionTitle.toLowerCase().split(" ");
    if (title.length > 1) {
      return title.join("-");
    }
    return title;
  };

  const createSessionMutation = useMutation({
    mutationFn: async ({ epubFile, clubId, clubMemberId }: NewSessionData) => {
      const res = client.api.sessions.create.$post({
        form: {
          book: epubFile,
          clubId,
          clubMemberId,
        },
      });

      return (await res).json();
    },
    onSuccess: async (newSession: CreateSessionRepsone) => {
      if ("error" in newSession) {
        throw new Error();
      }

      const sessionParam = createSessionParam(newSession.data.title);
      router.push(`/club/${clubId}/session/${sessionParam}`);
    },
    onError: (error) => {
      console.log("error creating new session", error);
      return;
    },
  });

  return { createSession: createSessionMutation.mutate };
};
