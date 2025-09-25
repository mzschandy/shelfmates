"use client";

import { SessionData } from "@/hooks/useCreateSession";
import {
  ReaderSessionData,
  SessionWithAnnotation,
  useReader,
} from "@/hooks/useReader";
import ePub, { Book } from "@shelfmates/epubjs";
import { useEffect, useRef } from "react";
import { useEventListener } from "usehooks-ts";

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
  const renditionRef = useRef<any>(null);

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
        renditionRef.current.display();
      }
    };
    loadBook();
  }, [bookUrl]);

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
