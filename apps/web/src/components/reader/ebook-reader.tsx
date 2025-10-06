"use client";

import { useBookProgress } from "@/hooks/useBookProgress";
import { SessionData } from "@/hooks/useCreateSession";
import {
  SessionWithAnnotation,
} from "@/hooks/useReader";
import ePub, { Rendition } from "@shelfmates/epubjs";
import {
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useDebounceCallback,
  useEventListener,
} from "usehooks-ts";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTextSelection } from "@/hooks/useTextSelection";
import {
  layout,
  LayoutAnchorMode,
  LayoutAnchorPosition,
} from "../context-view";

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
        <TextSelectionMenuRenderer rendition={renditionRef} />
      </div>
      <div className="bg-red-500">
        <ChevronRight />
      </div>
    </div>
  );
}

type TextSelectionOverlayProps = {
  show: boolean;
  onHide: () => void;
  children: ReactNode;
};

function TextSelectionOverlay({
  show,
  onHide,
  children,
}: TextSelectionOverlayProps) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "transparent",
      }}
      onClick={onHide}
    >
      <div style={{ position: "relative", zIndex: 1000 }}>{children}</div>
    </div>
  );
}

function TextSelectionMenuRenderer({
  rendition,
}: {
  rendition: RefObject<Rendition | null>;
}) {
  const getRenditionView = useCallback(() => {
    return rendition.current?.views()._views;
  }, [rendition]);
  const renditionWindow = getRenditionView()?.[0].window;
  const { selection, setSelection } = useTextSelection(
    rendition.current,
    renditionWindow,
  );

  if (selection === undefined) {
    return;
  }

  const element = getRenditionView()?.[0].element as HTMLElement;
  const range = selection?.getRangeAt(0);
  if (!range) return;

  const boundingBoxRect = range.getBoundingClientRect();
  const cons = range.cloneContents();
  const text = cons?.textContent?.trim();

  const rects = [...range.getClientRects()].filter((val) =>
    Math.round(val.width),
  );
  const anchorRect = rects && rects[0];
  const parentElementRect = element.parentElement!.getBoundingClientRect();
  if (!anchorRect) return null;

  const hideMenu = () => {
    if (selection) {
      selection.removeAllRanges();
      setSelection(undefined);
    }
  };

  if (!text) return;

  return (
    <>
      <TextSelectionOverlay show={!!text} onHide={hideMenu}>
        <TextSelectionMenu
          x={boundingBoxRect.left + boundingBoxRect.width / 2}
          y={boundingBoxRect.top}
          anchorRect={anchorRect}
          containerRect={parentElementRect}
          viewRect={element.getBoundingClientRect()}
          selection={{ text, range }}
          hide={hideMenu}
        />
      </TextSelectionOverlay>
    </>
  );
}

type TextSelectionMenuProps = {
  x: number;
  y: number;
  selection: { text: string; range: Range | null };
  anchorRect: DOMRect;
  containerRect: DOMRect;
  viewRect: DOMRect;
  onHighlight?: (sel: { text: string; range: Range | null }) => void;
  onAnnotate?: (sel: { text: string; range: Range | null }) => void;
  hide: () => void;
};

function TextSelectionMenu({
  x,
  y,
  anchorRect,
  containerRect,
  viewRect,
  selection,
  hide,
  onHighlight,
  onAnnotate,
}: TextSelectionMenuProps) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const endContainer = selection.range?.startContainer;
  const _lineHeight = parseFloat(
    getComputedStyle(endContainer?.parentElement!).lineHeight,
  );
  // no custom line height and the origin is keyword, e.g. 'normal'.
  const lineHeight = isNaN(_lineHeight) ? anchorRect.height : _lineHeight * 1;

  return (
    <div
      ref={(el) => {
        if (!el) return;
        setWidth(el.clientWidth);
        setHeight(el.clientHeight);
      }}
      className="mx-auto rounded-xl"
      style={{
        position: "absolute",
        left: layout(containerRect.width, width, {
          offset: anchorRect.left + viewRect.left - containerRect.left,
          size: anchorRect.width,
          mode: LayoutAnchorMode.ALIGN,
          position: LayoutAnchorPosition.Before,
        }),
        top: layout(containerRect.height, height, {
          offset: anchorRect.top - (lineHeight - anchorRect.height) / 2,
          size: lineHeight,
          position: LayoutAnchorPosition.Before,
        }),
        zIndex: 1000,
      }}
      tabIndex={-1}
    >
      <Button>Highlight</Button>
      <Button>Annotate</Button>
    </div>
  );
}
