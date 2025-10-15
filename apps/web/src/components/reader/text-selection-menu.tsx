import { Rendition } from "@shelfmates/epubjs";
import {
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { useTextSelection } from "@/hooks/useTextSelection";
import {
  layout,
  LayoutAnchorMode,
  LayoutAnchorPosition,
} from "../context-view";
import { AnnotationType, useAnnotations } from "@/hooks/useAnnotations";
import { Textarea } from "../ui/textarea";

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
      <div
        style={{ position: "relative", zIndex: 1000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function TextSelectionMenuRenderer({
  rendition,
  sessionId,
}: {
  rendition: RefObject<Rendition | null>;
  sessionId: string;
}) {
  const getRenditionView = useCallback(() => {
    return rendition.current?.views()._views;
  }, [rendition]);
  const renditionWindow = getRenditionView()?.[0].window;
  const { selection, setSelection } = useTextSelection(
    rendition.current,
    renditionWindow,
  );
  const {
    saveAnnotation,
    annotationsForUser,
    isLoading,
    isUserAnnotationsLoading,
  } = useAnnotations(sessionId);
  const [annotation, setAnnotation] = useState(false);

  if (selection === undefined) {
    return;
  }

  console.log("selection", selection);
  console.log("existing annotations", annotationsForUser);

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

  const rangeToCfi = () => {
    return getRenditionView()?.[0].contents.cfiFromRange(range);
  };

  const onHighlight = () => {
    const cfiRange = rangeToCfi();
    console.log("cfi", cfiRange);
    rendition.current?.annotations.highlight(cfiRange, {}, (e) => {
      console.log("highlight clicked", e.target);
    });
    saveAnnotation({
      cfiRange,
      isPublic: true,
      type: AnnotationType.HIGHLIGHT,
    });
  };

  const onAnnotation = (noteText: string) => {
    const cfiRange = rangeToCfi();
    console.log("cfi", cfiRange);
    rendition.current?.annotations.highlight(cfiRange, {}, (e) => {
      console.log("annotation clicked", e.target);
    });
    saveAnnotation({
      cfiRange,
      isPublic: true,
      noteText,
      type: AnnotationType.NOTE,
    });
  };

  if (!text) return;

  return (
    <>
      <TextSelectionOverlay show={!!text} onHide={hideMenu}>
        <TextSelectionMenu
          anchorRect={anchorRect}
          containerRect={parentElementRect}
          viewRect={element.getBoundingClientRect()}
          selection={{ text, range }}
          onHighlight={onHighlight}
          onAnnotate={onAnnotation}
          hide={hideMenu}
          annotation={annotation}
          setAnnotation={setAnnotation}
        />
      </TextSelectionOverlay>
    </>
  );
}

type TextSelectionMenuProps = {
  selection: { text: string; range: Range | null };
  anchorRect: DOMRect;
  containerRect: DOMRect;
  viewRect: DOMRect;
  onHighlight: () => void;
  onAnnotate: (noteText: string) => void;
  hide: () => void;
  annotation: boolean;
  setAnnotation: React.Dispatch<SetStateAction<boolean>>;
};

function TextSelectionMenu({
  anchorRect,
  containerRect,
  viewRect,
  selection,
  hide,
  onHighlight,
  onAnnotate,
  annotation,
  setAnnotation,
}: TextSelectionMenuProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const endContainer = selection.range?.startContainer;
  const _lineHeight = parseFloat(
    getComputedStyle(endContainer?.parentElement!).lineHeight,
  );
  // no custom line height and the origin is keyword, e.g. 'normal'.
  const lineHeight = isNaN(_lineHeight) ? anchorRect.height : _lineHeight * 1;

  const handleHighlight = () => {
    onHighlight();
    hide();
  };

  const handleAnnotation = () => {
    const text = ref.current?.value;
    if (!text) {
      return;
    }
    onAnnotate(text);
    setAnnotation(false);
    hide();
  };

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
      {annotation ? (
        <div className="bg-gray-500">
          <div>
            <Textarea ref={ref} />
          </div>
          <div>
            <Button
              onClick={() => {
                handleAnnotation();
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button onClick={handleHighlight}>Highlight</Button>
          <Button onClick={() => setAnnotation(true)}>Annotate</Button>
        </div>
      )}
    </div>
  );
}
