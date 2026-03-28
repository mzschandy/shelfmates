import { Rendition } from "@shelfmates/epubjs";
import {
  ReactNode,
  RefObject,
  SetStateAction,
  useCallback,
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
import {
  AnnotationType,
  HighlightColor,
  useAnnotations,
} from "@/hooks/useAnnotations";
import { Textarea } from "../ui/textarea";
import { Annotation } from "@shelfmates/db";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

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
  const { saveAnnotation, annotationsForUser, updateAnnotation } =
    useAnnotations(sessionId);
  const [isAnnotating, setIsAnnotating] = useState(false);

  if (selection === undefined && !editingAnnotation) {
    return;
  }

  const element = getRenditionView()?.[0].element as HTMLElement;
  const range = selection?.getRangeAt(0);
  if (!range && !editingAnnotation) return;

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
    if (!range) return;
    return getRenditionView()?.[0].contents.cfiFromRange(range);
  };

  const onHighlight = (color: HighlightColor) => {
    const cfiRange = rangeToCfi();
    if (!cfiRange) return;
    rendition.current?.annotations.highlight(
      cfiRange,
      {},
      (e) => {
        console.log("highlight clicked", e.target);
      },
      "hl",
      { fill: color.toLowerCase(), "fill-opacity": "0.5" },
    );
    saveAnnotation({
      cfiRange,
      isPublic: true,
      type: AnnotationType.HIGHLIGHT,
      color,
    });
  };

  const onAnnotation = (noteText: string, isPublic: boolean) => {
    const cfiRange = rangeToCfi();
    if (!cfiRange) return;
    rendition.current?.annotations.highlight(cfiRange, {}, (e) => {
      console.log("annotation clicked", e.target);
    });
    saveAnnotation({
      cfiRange,
      isPublic,
      noteText,
      type: AnnotationType.NOTE,
    });
  };

  const onUpdateAnnotation = (
    annotationId: string,
    noteText: string,
    isPublic: boolean,
  ) => {
    updateAnnotation({
      annotationId,
      noteText,
      isPublic,
      type: AnnotationType.NOTE,
    });
  };

  const cfiCheck = rangeToCfi();
  const existingAnnotation = annotationsForUser?.find(
    (a) => a.cfiRange === cfiCheck,
  );

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
  onHighlight: (color: HighlightColor) => void;
  onAnnotate: (noteText: string, isPublic: boolean) => void;
  onUpdateAnnotation: (
    annotationId: string,
    noteText: string,
    isPublic: boolean,
  ) => void;
  hide: () => void;
  annotation: Annotation | undefined;
  isAnnotating: boolean;
  setIsAnnotating: React.Dispatch<SetStateAction<boolean>>;
};

const HIGHLIGHT_COLORS = Object.values(HighlightColor);

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
}: TextSelectionMenuProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isPublic, setIsPublic] = useState(annotation?.isPublic ?? false);
  const isMobile = useIsMobile();

  const endContainer = selection.range?.startContainer;
  const _lineHeight = endContainer
    ? parseFloat(getComputedStyle(endContainer?.parentElement!).lineHeight)
    : 0;
  // no custom line height and the origin is keyword, e.g. 'normal'.
  const lineHeight = isNaN(_lineHeight) ? anchorRect.height : _lineHeight * 1;

  const handleHighlight = (color: HighlightColor) => {
    onHighlight(color);
    hide();
  };

  const handleAnnotation = () => {
    const text = ref.current?.value;
    if (!text) {
      return;
    }
    if (annotation) {
      onUpdateAnnotation(annotation.id, text, isPublic);
    } else {
      onAnnotate(text, isPublic);
    }
    setIsAnnotating(false);
    hide();
  };

  const menuContent = () => {
    if (isAnnotating || (annotation && annotation.type === "NOTE")) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border bg-background p-2 shadow-lg">
          <div>
            <Textarea
              ref={ref}
              defaultValue={annotation?.noteText ?? ""}
              rows={isMobile ? 3 : 5}
              className="w-full"
              placeholder="Your annotation..."
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is-public-annotation"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="is-public-annotation">Public</Label>
            </div>
            <Button onClick={handleAnnotation} size="sm">
              Submit
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-lg">
        <div className="flex items-center gap-1 border-r pr-1">
          {HIGHLIGHT_COLORS.map((color) => (
            <Button
              key={color}
              onClick={() => handleHighlight(color)}
              className={cn(
                "h-7 w-7 rounded-full p-0",
                `bg-${color.toLowerCase()}-500 hover:bg-${color.toLowerCase()}-600`,
              )}
            />
          ))}
        </div>
        <Button
          onClick={() => setIsAnnotating(true)}
          variant="ghost"
          className="h-8"
        >
          Annotate
        </Button>
      </div>
    );
  };

  return (
    <div
      ref={(el) => {
        if (!el) return;
        setWidth(el.clientWidth);
        setHeight(el.clientHeight);
      }}
      className="mx-auto"
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
      {menuContent()}
    </div>
  );
}
