"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import { SessionWithAnnotation } from "@/hooks/useReader";
import ePub, { NavItem, Rendition } from "@shelfmates/epubjs";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TextSelectionMenuRenderer from "./text-selection-menu";
import { useAnnotations } from "@/hooks/useAnnotations";
import { Annotation } from "@shelfmates/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export interface CfiLocation {
  start: {
    cfi: string;
    displayed: { page: string; total: string };
    href: string;
    index: number;
    location: number;
    percentage: number;
  };
  end: {
    cfi: string;
    displayed: { page: string; total: string };
    href: string;
    index: number;
    location: number;
    percentage: number;
  };
  atStart?: boolean;
  atEnd?: boolean;
}

const fileToEpub = async (file: File) => {
  const data = await file.arrayBuffer();
  return ePub(data);
};

export default function EbookReader({
  session,
  bookUrl = "",
}: {
  session: SessionWithAnnotation & SessionData;
  bookUrl: string;
}) {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(
    null,
  );
  const [tocChapters, setTocChapters] = useState<NavItem[]>([]);

  const { currentProgress, saveProgress } = useBookProgress(session.id);
  const {
    annotationsForUser,
    allAnnotations,
    removeAnnotation,
  } = useAnnotations(session.id);

  const debouncedSaveProgress = useDebounceCallback((cfi: string) => {
    saveProgress(cfi);
  }, 2000);

  useEffect(() => {
    const loadBook = async () => {
      if (viewerRef.current) {
        viewerRef.current.innerHTML = "";

        const filename = decodeURIComponent(
          /\/([^/]*\.epub)$/i.exec(bookUrl)?.[1] ?? "",
        );
        const book = await fetch(bookUrl)
          .then((res) => res.blob())
          .then((blob) => fileToEpub(new File([blob], filename)));

        renditionRef.current = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100vh",
          flow: "paginated",
          manager: "default",
          allowScriptedContent: true,
        });
        setRendition(renditionRef.current);
        renditionRef.current.display(currentProgress?.lastCFI ?? undefined);

        book.loaded.navigation.then((toc) => {
          setTocChapters(toc.toc);
        });

        book.ready.then(() => {
          renditionRef?.current?.on("keydown", handleKeyDown);
        });
      }
    };
    loadBook();
  }, [bookUrl, currentProgress]);

  useEffect(() => {
    if (!renditionRef.current) return;

    renditionRef.current.on("relocated", (location: CfiLocation) => {
      debouncedSaveProgress(location.start.cfi);
    });

    return () =>
      renditionRef.current?.off("relocated", (location: CfiLocation) => {
        debouncedSaveProgress(location.start.cfi);
      });
  });

  useEffect(() => {
    if (!renditionRef.current) return;

    renditionRef.current.on("markClicked", (cfiRange, data) => {
      const annotation = allAnnotations?.find((a) => a.cfiRange === cfiRange);
      if (annotation) {
        if (annotation.profileId === session.currentUserProfileId) {
          // It's the current user's annotation, so we can either edit or remove it
          if (annotation.type === "NOTE") {
            setEditingAnnotation(annotation);
          } else {
            // It's a highlight, so we can remove it.
            // You may want a confirmation dialog here
            removeAnnotation(annotation.id);
          }
        } else {
          // It's another user's annotation, maybe show their details?
          console.log("Clicked on another user's annotation", annotation);
        }
      }
    });
  }, [allAnnotations, session.currentUserProfileId, removeAnnotation]);

  useEffect(() => {
    if (!rendition || !allAnnotations) return;

    // Clear existing annotations before adding new ones
    // rendition.annotations.each((annotation) => rendition.annotations.remove());

    allAnnotations.forEach((annotation) => {
      const isCurrentUser = annotation.profileId === session.currentUserProfileId;

      if (annotation.type === "HIGHLIGHT") {
        rendition.annotations.add(
          "highlight",
          annotation.cfiRange,
          {},
          (e) => console.log("clicked highlight", e),
          "hl",
          isCurrentUser
            ? {
                fill: annotation.color?.toLowerCase() ?? "yellow",
                "fill-opacity": "0.5",
              }
            : {
                "text-decoration": "underline",
              },
        );
      } else if (annotation.type === "NOTE" && !isCurrentUser) {
        // Underline public annotations from other users
        rendition.annotations.add(
          "underline",
          annotation.cfiRange,
          {},
          (e) => console.log("clicked note", e),
          "ul",
          {
            "text-decoration": "underline",
            color: "gray",
          },
        );
      }
    });
  }, [allAnnotations, rendition, session.currentUserProfileId]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!renditionRef.current) return;

    if (e.key === "ArrowRight") {
      renditionRef.current.next();
    } else if (e.key === "ArrowLeft") {
      renditionRef.current.prev();
    }
  };

  const handleLeftClick = () => {
    if (!renditionRef.current) return;
    renditionRef.current.prev();
  };

  const handleRightClick = () => {
    if (!renditionRef.current) return;
    renditionRef.current.next();
  };

  useEventListener("keydown", handleKeyDown);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="session">Back</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{session.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex w-full flex-1">
        <div className="w-1/6 overflow-y-auto pr-4">
          <div className="toc-pane">
            {tocChapters.length ? (
              tocChapters.map((chapter) => (
                <div
                  className="cursor-pointer text-blue-500"
                  key={chapter.id}
                  onClick={() => {
                    if (!renditionRef.current) return;
                    renditionRef.current.display(chapter.href);
                  }}
                >
                  {chapter.label}
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center">No chapters available</div>
            )}
          </div>
        </div>
        <div className="flex w-5/6 items-center justify-center">
          <ChevronLeft onClick={handleLeftClick} className="cursor-pointer" />
          <div className="pane w-full max-w-full overflow-auto">
            <div tabIndex={0} id="viewer" className="" ref={viewerRef}></div>
            <TextSelectionMenuRenderer
              rendition={renditionRef}
              sessionId={session.id}
              editingAnnotation={editingAnnotation}
              setEditingAnnotation={setEditingAnnotation}
            />
          </div>
          <ChevronRight onClick={handleRightClick} className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

