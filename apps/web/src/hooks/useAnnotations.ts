import { client } from "@/utils/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export enum AnnotationType {
  HIGHLIGHT = "HIGHLIGHT",
  NOTE = "NOTE",
}

export type AnnotationData = {
  createdAt: string;
  id: string;
  sessionId: string;
  profileId: string;
  isPublic: boolean | null;
  cfiRange: string;
  noteText: string | null;
  updatedAt: string | null;
  type: AnnotationType;
};

export type AnnotationMutationData = {
  cfiRange: string;
  noteText?: string;
  isPublic?: boolean;
  type: AnnotationType;
};

type CreateAnnotationRepsone = { error: string } | { data: AnnotationData };

export const useAnnotations = (sessionId: string) => {
  const router = useRouter();

  const { data: allAnnotations, isLoading } = useQuery({
    queryKey: ["reader", sessionId, "all", "annotations"],
    queryFn: async () => {
      const res = await client.api.reader[":id"].annotations.all.$get({
        param: {
          id: sessionId,
        },
      });

      const data = await res.json();

      return data.data;
    },
  });

  const {
    data: annotationsForUser,
    isLoading: isUserAnnotationsLoading,
    refetch,
  } = useQuery({
    queryKey: ["reader", sessionId, "user", "annotations"],
    queryFn: async () => {
      const res = await client.api.reader[":id"].annotations.$get({
        param: {
            id: sessionId,
          },
        });

        const data = await res.json();

        return data.data;
      },
    });

  const createAnnotationMutation = useMutation({
    mutationFn: async (annotationData: AnnotationMutationData) => {
      const { cfiRange, noteText, isPublic, type } = annotationData;

      const res = await client.api.reader[":id"].annotations.$post({
        param: {
          id: sessionId,
        },
        json: {
          sessionId,
          cfiRange,
          isPublic: isPublic,
          noteText: noteText ? noteText : undefined,
          type,
        },
      });

      const data = await res.json();
      if ("error" in data) {
        throw new Error();
      }

      return data.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: async (annotationData: {
      annotationId: string;
      noteText: string;
      type: AnnotationType;
    }) => {
      const { annotationId, noteText, type } = annotationData;

      const res = await client.api.reader[":id"].annotations.$post({
        param: {
          id: sessionId,
        },
        json: {
          noteText,
          sessionId,
          annotationId,
          type
        },
      });

      const data = await res.json();
      if ("error" in data) {
        throw new Error();
      }

      return data.data;
    },
    onSuccess: () => {
      refetch();
    }
  });

  return {
    saveAnnotation: createAnnotationMutation.mutate,
    updateAnnotation: updateAnnotationMutation.mutate,
    allAnnotations: allAnnotations,
    annotationsForUser: annotationsForUser,
    isLoading,
    isUserAnnotationsLoading,
  };
};
