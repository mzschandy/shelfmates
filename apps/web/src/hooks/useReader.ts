import { client } from "@/utils/client";
import { $Enums } from "@shelfmates/db";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SessionData } from "./useCreateSession";

export interface ClubMember {
  isAdmin: boolean;
  createdAt: string;
  id: string;
  clubId: string;
  profileId: string;
}

export interface Club {
  createdAt: string;
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  creatorId: string;
  threadId: string[];
}

export interface Annotation {
  createdAt: string;
  id: string;
  profileId: string;
  isPublic: boolean | null;
  sessionId: string;
  cfiRange: string;
  noteText: string | null;
  updatedAt: string | null;
  type: $Enums.AnnotationType;
}

export interface SessionWithAnnotation {
  club: ({ clubMembers: ClubMember[] } & Club) | null;
  annotation: Annotation[];
}

export type ReaderSessionData = {
  [x: string]: any;
  session: SessionWithAnnotation & SessionData;
  epubUrl?: { signedUrl: string };
} | null;

export interface ReaderSessionDataRes {
  readerSession: ReaderSessionData;
  isLoading: boolean;
}

type ReaderResponse = { error: string } | { data: ReaderSessionData };

export const useReader = (sessionId: string) => {
  console.log("reassion id", sessionId);

  const { data, isLoading } = useQuery({
    queryKey: ["reader", sessionId],
    queryFn: async () => {
      const data = await client.api.reader[":id"].$get({
        param: {
          id: sessionId,
        },
      });
      console.log("hit query", data);

      const res: ReaderResponse = await data.json();

      console.log("RES >>> ", res);

      if ("error" in data) {
        throw new Error("error<<<<");
      }

      return res;
    },
  });

  console.log("useReader session data", data);
  return { readerSession: data, isLoading };
};
