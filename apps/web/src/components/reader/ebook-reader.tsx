"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import {
  ReaderSessionData,
  SessionWithAnnotation,
  useReader,
} from "@/hooks/useReader";
import ePub, { Book, Rendition } from "@shelfmates/epubjs";
import { useEffect, useRef } from "react";
import { useDebounceCallback, useEventListener } from "usehooks-ts";

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
  const { currentProgress, saveProgress, isLoading } = useBookProgress(
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
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!renditionRef.current) return;
    if (e.key === "ArrowRight") {
      renditionRef.current.next();
    } else if (e.key === "ArrowLeft") {
      renditionRef.current.prev();
    }
  };

  useEventListener("keydown", handleKeyDown);

  return <div tabIndex={0} id="viewer" ref={viewerRef}></div>;
}
