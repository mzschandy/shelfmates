"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import {
  ReaderSessionData,
  SessionWithAnnotation,
  useReader,
} from "@/hooks/useReader";
import ePub, { Book, Rendition } from "@shelfmates/epubjs";
import { Ref, RefObject, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTextSelection } from "@/hooks/useTextSelection";

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

  const handleKeyDown = (e: KeyboardEvent) => {
    console.log("KEY HIT", e.key);
    if (!renditionRef.current) return;
    if (e.key === "ArrowRight") {
      renditionRef.current.next();
    } else if (e.key === "ArrowLeft") {
      renditionRef.current.prev();
    }
  };

  useEventListener("keydown", handleKeyDown);

  return (
    <div className="w-full flex">
      <div className="bg-red-500">
        <ChevronLeft />
      </div>
      <div className="pane w-full max-w-full overflow-auto bg-blue-500">
        <div tabIndex={0} id="viewer" className="" ref={viewerRef}></div>
        <TextSelectionMenu rendition={renditionRef} />
      </div>
      <div className="bg-red-500">
        <ChevronRight />
      </div>
    </div>
  );
}

function TextSelectionMenu({
  rendition,
}: {
  rendition: RefObject<Rendition | null>;
}) {
  console.log("renditon from text selection", rendition.current);

  const { selection, setSelection } = useTextSelection(rendition.current)

  if (selection === undefined) {
    console.log("no selection");
    return;
  }
  console.log("selection from text selection", selection);

  const range = selection?.getRangeAt(0);
  const boundingBoxRect = range.getBoundingClientRect();
  if (!range) return null;

  const cons = range.cloneContents();
  const text = cons?.textContent?.trim();
  console.log("SELECTED TEXT >>> ", text);
  if (!text) return null;

  return (
    <div className="mx-auto rounded-xl">
      <Button>Highlight</Button>
      <Button>Annotate</Button>
    </div>
  );
}
