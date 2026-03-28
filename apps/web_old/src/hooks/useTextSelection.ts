import { Rendition } from "@shelfmates/epubjs";
import { useEffect, useState } from "react";

export type SelectionState = {
  text: string;
  range: Range | null;
  rect: DOMRect | null;
};

export const useTextSelection = (rendition: Rendition | null, win?: Window) => {
  const [selection, setSelection] = useState<Selection | undefined>();

  useEffect(() => {
    if (!rendition || !win) return;
    
    const handleSelectionEnd = () => {
      const sel = win.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
        setSelection(undefined);
        return;
      }
      
      // Need to handle right-to-left selection, but Window.getSelection() 
      // automatically normalizes Range so it's always left-to-right structurally.
      setSelection(sel);
    };

    // We use a small timeout to handle double/triple clicks properly
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleSelection = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSelectionEnd, 50);
    };

    win.addEventListener("mouseup", debouncedHandleSelection);
    win.addEventListener("touchend", debouncedHandleSelection);
    win.addEventListener("keyup", debouncedHandleSelection);

    // Also handle when user starts clicking somewhere else
    const handleMouseDown = () => {
      const sel = win.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(undefined);
      }
    };
    win.addEventListener("mousedown", handleMouseDown);
    win.addEventListener("touchstart", handleMouseDown);

    return () => {
      clearTimeout(timeoutId);
      win.removeEventListener("mouseup", debouncedHandleSelection);
      win.removeEventListener("touchend", debouncedHandleSelection);
      win.removeEventListener("keyup", debouncedHandleSelection);
      win.removeEventListener("mousedown", handleMouseDown);
      win.removeEventListener("touchstart", handleMouseDown);
    };
  }, [rendition, win]);

  return { selection, setSelection };
};
