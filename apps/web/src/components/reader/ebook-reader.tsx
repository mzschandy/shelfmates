"use client";

import { SessionData } from "@/hooks/useCreateSession";
import {
  ReaderSessionData,
  SessionWithAnnotation,
  useReader,
} from "@/hooks/useReader";
import ePub, { Book } from "epubjs";
import Url from "epubjs/types/utils/url";
import { useEffect, useRef } from "react";

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
  const ebookViewerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<any>(null);
  console.log("book url", bookUrl);

  useEffect(() => {
    const loadBook = async () => {
      if (viewerRef.current) {
        console.log("ref", viewerRef.current);
        const filename = decodeURIComponent(
          /\/([^/]*\.epub)$/i.exec(bookUrl)?.[1] ?? "",
        );
        const book = await fetch(bookUrl)
          .then((res) => res.blob())
          .then((blob) => fileToEpub(new File([blob], filename)));

        renditionRef.current = book.renderTo(viewerRef.current, {
          width: "600px",
          height: "400px",
        });
        renditionRef.current.display();
      }
    };
    loadBook();
  }, [bookUrl]);

  return <div id="viewer" ref={viewerRef}></div>;
}
