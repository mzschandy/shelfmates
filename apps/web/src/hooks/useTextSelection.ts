import { Rendition } from "@shelfmates/epubjs";
import { useEffect, useState } from "react";

// function hasSelection(selection?: Selection | null): selection is Selection {
//   return !(!selection || selection.isCollapsed);
// }
export type SelectionState = {
  text: string;
  range: Range | null;
  rect: DOMRect | null;
};

export const useTextSelection = (rendition: Rendition | null, win?: Window) => {
  const [selection, setSelection] = useState<Selection | undefined>();

  useEffect(() => {
    if (!rendition) return;
    win?.addEventListener("mouseup", () => {
      const sel = win.getSelection();
      if (!sel) {
        setSelection(undefined);
        return;
      }

      setSelection(sel);
    });
  }, [rendition, selection, win]);

  return { selection, setSelection };
};
