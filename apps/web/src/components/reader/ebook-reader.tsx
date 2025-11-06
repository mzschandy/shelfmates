"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import { SessionWithAnnotation } from "@/hooks/useReader";
import ePub, { Rendition } from "@shelfmates/epubjs";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TextSelectionMenuRenderer from "./text-selection-menu";
import { useAnnotations } from "@/hooks/useAnnotations";

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
    <div className="w-full flex">
      <div className="bg-red-500">
        <ChevronLeft onClick={handleLeftClick} />
      </div>
      <div className="pane w-full max-w-full overflow-auto bg-blue-500">
        <div tabIndex={0} id="viewer" className="" ref={viewerRef}></div>
        <TextSelectionMenuRenderer
          rendition={renditionRef}
          sessionId={session.id}
        />
      </div>
      <div className="bg-red-500">
        <ChevronRight onClick={handleRightClick} />
      </div>
    </div>
  );
}
