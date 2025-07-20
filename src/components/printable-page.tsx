import React from "react";
import { cn } from "@/lib/utils";
import type { LayoutConfig } from "@/types";

interface PrintablePageProps {
  children: React.ReactNode;
  layout: LayoutConfig;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const PrintablePage = ({
  children,
  layout,
  zoom,
  isSelected,
  onSelect,
}: PrintablePageProps) => {
  const A4_DIMENSIONS = {
    portrait: { width: "210mm", height: "297mm" },
    landscape: { width: "297mm", height: "210mm" },
  };
  const pageWidth = A4_DIMENSIONS[layout.orientation].width;
  const pageHeight = A4_DIMENSIONS[layout.orientation].height;
  const transitionDuration = "200ms";
  const transitionTimingFunction = "ease";
  return (
    <div
      className={cn(
        "flex-shrink-0 cursor-pointer p-1 rounded-md",
        isSelected && "ring-2 ring-muted-foreground/50"
      )}
      onClick={onSelect}
    >
      <div
        className="flex-shrink-0"
        style={{
          width: `calc(${pageWidth} * ${zoom})`,
          height: `calc(${pageHeight} * ${zoom})`,
          transition: `width ${transitionDuration} ${transitionTimingFunction}, height ${transitionDuration} ${transitionTimingFunction}`,
        }}
      >
        <div
          className="bg-white shadow-lg"
          style={{
            width: pageWidth,
            height: pageHeight,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            gap: `${layout.gap}mm`,
            padding: `${layout.pageMargin}mm`,
            boxSizing: "border-box",
            transition: `transform ${transitionDuration} ${transitionTimingFunction}`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
