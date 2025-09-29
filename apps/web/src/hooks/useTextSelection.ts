import { Rendition } from "@shelfmates/epubjs";
import View from "@shelfmates/epubjs/types/managers/view";
import Section from "@shelfmates/epubjs/types/section";
import { IframeHTMLAttributes, useEffect, useState } from "react";
import { useEventListener } from "usehooks-ts";

// function hasSelection(selection?: Selection | null): selection is Selection {
//   return !(!selection || selection.isCollapsed);
// }
export type SelectionState = {
  text: string;
  range: Range | null;
  rect: DOMRect | null;
};

export const useTextSelection = (
  rendition: Rendition | null
) => {
  const [selection, setSelection] = useState<Selection | undefined>();

  useEffect(() => {
    console.log("use effect, rendition?", rendition);
    if (!rendition) return;

    const handleMouseUp = (section: Section, iframe: any) => {
      console.log("section", section);
      console.log("iframe", iframe);
      const doc = iframe.window;
      console.log("DOC", doc)

      doc?.addEventListener("mouseup", () => {
        console.log("event listener mouse up hit");

        const sel = doc.getSelection();
        if (!sel) {
          console.log("no selection");
          setSelection(undefined);
          return;
        }
        console.log("found selection", selection);

        setSelection(sel);
      });
    };

    rendition.on("rendered", handleMouseUp);
    return () => rendition.off("rendered", handleMouseUp);
  }, [rendition, selection]);

  return { selection, setSelection };
};
