import { client } from "@/utils/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { HighlightColor } from "@shelfmates/db";

export { HighlightColor };

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
  color: HighlightColor | null;
};

export type AnnotationMutationData = {
  cfiRange: string;
  noteText?: string;
  isPublic?: boolean;
  type: AnnotationType;
  color?: HighlightColor;
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
      const { cfiRange, noteText, isPublic, type, color } = annotationData;

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
          color,
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
      color?: HighlightColor;
      isPublic?: boolean;
    }) => {
      const { annotationId, noteText, type, color, isPublic } = annotationData;

      const res = await client.api.reader[":id"].annotations.$post({
        param: {
          id: sessionId,
        },
        json: {
          noteText,
          sessionId,
          annotationId,
          type,
          color,
          isPublic,
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

  const removeAnnotationMutation = useMutation({
    mutationFn: async (annotationId: string) => {
      const res = await client.api.reader[":id"].annotations[":annotationId"].$delete({
        param: {
          id: sessionId,
          annotationId,
        },
      });

      if (res.status === 404) {
        throw new Error("Annotation not found");
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  return {
    saveAnnotation: createAnnotationMutation.mutate,
    updateAnnotation: updateAnnotationMutation.mutate,
    removeAnnotation: removeAnnotationMutation.mutate,
    allAnnotations: allAnnotations,
    annotationsForUser: annotationsForUser,
    isLoading,
    isUserAnnotationsLoading,
  };
};
