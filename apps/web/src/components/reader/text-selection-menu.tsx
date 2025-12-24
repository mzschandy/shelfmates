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
import { $Enums, Annotation } from "@shelfmates/db";

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
  editingAnnotation,
  setEditingAnnotation,
}: {
  rendition: RefObject<Rendition | null>;
  sessionId: string;
  editingAnnotation: Annotation | null;
  setEditingAnnotation: React.Dispatch<SetStateAction<Annotation | null>>;
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
    updateAnnotation,
  } = useAnnotations(sessionId);
  const [isAnnotating, setIsAnnotating] = useState(false);

  if (selection === undefined && !editingAnnotation) {
    return;
  }

  console.log("selection", selection);
  console.log("existing annotations", annotationsForUser);
  const element = getRenditionView()?.[0].element as HTMLElement;
  const range = selection?.getRangeAt(0);
  if (!range && !editingAnnotation) return;

  const boundingBoxRect = range?.getBoundingClientRect();
  const cons = range?.cloneContents();
  const text = cons?.textContent?.trim();

  const rects = [...(range?.getClientRects() ?? [])].filter((val) =>
    Math.round(val.width),
  );
  const anchorRect = rects && rects[0];
  const parentElementRect = element.parentElement!.getBoundingClientRect();
  if (!anchorRect && !editingAnnotation) return null;

  const hideMenu = () => {
    if (selection) {
      selection.removeAllRanges();
      setSelection(undefined);
    }
    if (editingAnnotation) {
      setEditingAnnotation(null);
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
    console.log('on annotation!')
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

  const onUpdateAnnotation = (annotationId: string, noteText: string) => {
    updateAnnotation({
      annotationId,
      noteText,
      type: AnnotationType.NOTE
    });
  };

  const cfiCheck = rangeToCfi();
  const existingAnnotation = annotationsForUser?.find((a) => a.cfiRange === cfiCheck);

  if (!text) return;

  return (
    <>
      <TextSelectionOverlay show={!!text || !!editingAnnotation} onHide={hideMenu}>
        <TextSelectionMenu
          anchorRect={anchorRect ?? new DOMRect(0, 0, 0, 0)}
          containerRect={parentElementRect}
          viewRect={element.getBoundingClientRect()}
          selection={{ text, range }}
          onHighlight={onHighlight}
          onAnnotate={onAnnotation}
          onUpdateAnnotation={onUpdateAnnotation}
          hide={hideMenu}
          annotation={editingAnnotation ?? existingAnnotation}
          isAnnotating={isAnnotating}
          setIsAnnotating={setIsAnnotating}
          rendition={rendition}
        />
      </TextSelectionOverlay>
    </>
  );
}

type TextSelectionMenuProps = {
  selection: { text: string; range: Range | null | undefined };
  anchorRect: DOMRect;
  containerRect: DOMRect;
  viewRect: DOMRect;
  onHighlight: () => void;
  onAnnotate: (noteText: string) => void;
  onUpdateAnnotation: (annotationId: string, noteText: string) => void;
  hide: () => void;
  annotation: {
    sessionId: string;
    createdAt: string;
    id: string;
    isPublic: boolean | null;
    profileId: string;
    updatedAt: string | null;
    type: $Enums.AnnotationType;
    cfiRange: string;
    noteText: string | null;
} | undefined;
  isAnnotating: boolean;
  setIsAnnotating: React.Dispatch<SetStateAction<boolean>>;
  rendition: RefObject<Rendition | null>
};

function TextSelectionMenu({
  anchorRect,
  containerRect,
  viewRect,
  selection,
  hide,
  onHighlight,
  onAnnotate,
  onUpdateAnnotation,
  annotation,
  isAnnotating,
  setIsAnnotating,
  rendition
}: TextSelectionMenuProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const endContainer = selection.range?.startContainer;
  const _lineHeight = endContainer
    ? parseFloat(getComputedStyle(endContainer?.parentElement!).lineHeight)
    : 0;
  // no custom line height and the origin is keyword, e.g. 'normal'.
  const lineHeight = isNaN(_lineHeight) ? anchorRect.height : _lineHeight * 1;
  console.log('is existing annotation?', annotation)

  const handleHighlight = () => {
    onHighlight();
    hide();
  };

  const handleAnnotation = () => {
    const text = ref.current?.value;
    if (!text) {
      return;
    }
    if (annotation) {
      onUpdateAnnotation(annotation.id, text);
    } else {
      onAnnotate(text);
    }
    setIsAnnotating(false);
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
      {isAnnotating || annotation ? (
        <div className="bg-gray-500">
          <div>
            <Textarea ref={ref} defaultValue={annotation?.noteText ?? ''} />
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
          <Button onClick={() => setIsAnnotating(true)}>Annotate</Button>
        </div>
      )}
    </div>
  );
}
