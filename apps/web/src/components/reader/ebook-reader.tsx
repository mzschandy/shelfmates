"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import { SessionWithAnnotation } from "@/hooks/useReader";
import ePub, { NavItem, Rendition } from "@shelfmates/epubjs";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TextSelectionMenuRenderer from "./text-selection-menu";
import { AnnotationData, useAnnotations } from "@/hooks/useAnnotations";
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

  const { currentProgress, saveProgress, isLoading } = useBookProgress(
    session.id,
  );
  const { annotationsForUser, isUserAnnotationsLoading } = useAnnotations(
    session.id,
  );

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
          height: "600px",
          flow: "paginated",
          manager: "default",
          allowScriptedContent: true,
        });
        setRendition(renditionRef.current);
        renditionRef.current.display(currentProgress?.lastCFI ?? undefined);

        book.loaded.navigation.then((toc) => {
          setTocChapters(toc.toc);
        });

        console.log("chapters", tocChapters);
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
      const annotation = annotationsForUser?.find(
        (a) => a.cfiRange === cfiRange,
      );
      if (annotation && annotation.type === "NOTE") {
        console.log("found note type annotation!");
        setEditingAnnotation(annotation);
      }
    });
  }, [annotationsForUser]);

  useEffect(() => {
    if (!renditionRef.current) return;

    annotationsForUser?.forEach((annotation) => {
      rendition?.annotations.add(
        "highlight",
        annotation.cfiRange,
        undefined,
        undefined,
        undefined,
        { fill: "yellow", "fill-opacity": "0.5" },
      );
    });
  }, [annotationsForUser, rendition]);

  const handleKeyDown = (e: KeyboardEvent) => {
    console.log("KEY HIT", e.key);
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
    <div className="w-full flex-col">
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
      <div className="w-full flex">
        <div className="toc-pane">
          {tocChapters.length ? (
            tocChapters.map((chapter) => (
              <div
                className="text-blue-500 cursor-pointer"
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
        <div className="bg-red-500">
          <ChevronLeft onClick={handleLeftClick} />
        </div>
        <div className="pane w-full max-w-full overflow-auto bg-blue-500">
          <div tabIndex={0} id="viewer" className="" ref={viewerRef}></div>
          <TextSelectionMenuRenderer
            rendition={renditionRef}
            sessionId={session.id}
            editingAnnotation={editingAnnotation}
            setEditingAnnotation={setEditingAnnotation}
          />
        </div>
        <div className="bg-red-500">
          <ChevronRight onClick={handleRightClick} />
        </div>
      </div>
    </div>
  );
}
