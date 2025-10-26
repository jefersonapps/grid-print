import React from "react";
import { cn } from "@/lib/utils";
import type { LayoutConfig, GridItem } from "@/types";
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable";

import type { Editor } from "@tiptap/react";
import { SortableItem } from "./sortable-item";

interface PrintablePageProps {
  pageId: string;
  items: GridItem[];
  layout: LayoutConfig;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  editorInstances: React.MutableRefObject<Record<string, Editor>>;
  selectedItemId: string | null;
  onItemSelect: (id: string) => void;
  onItemRemove: (id: string) => void;
  onItemReplace: (id: string) => void;
  onItemDuplicate: (item: GridItem) => void;
  activeDragItemId: string | null;
}

const Placeholder = ({ id }: { id: string }) => (
  <div
    key={id}
    className="rounded-md ring-1 ring-inset ring-dashed ring-gray-300/50 dark:ring-border/50"
  />
);

export const PrintablePage = ({
  pageId,
  items,
  layout,
  zoom,
  isSelected,
  onSelect,
  editorInstances,
  selectedItemId,
  onItemSelect,
  onItemRemove,
  onItemReplace,
  onItemDuplicate,
  activeDragItemId,
}: PrintablePageProps) => {
  const A4_DIMENSIONS = {
    portrait: { width: "210mm", height: "297mm" },
    landscape: { width: "297mm", height: "210mm" },
  };
  const pageWidth = A4_DIMENSIONS[layout.orientation].width;
  const pageHeight = A4_DIMENSIONS[layout.orientation].height;
  const transitionDuration = "200ms";
  const transitionTimingFunction = "ease";

  const capacity = layout.cols * layout.rows;
  const gridCells = [];

  for (let i = 0; i < capacity; i++) {
    if (items[i]) {
      gridCells.push(items[i]);
    } else {
      gridCells.push({ id: `placeholder-${pageId}-${i}`, type: "placeholder" });
    }
  }

  const sortableIds = gridCells.map((cell) => cell.id);

  const isDimensionMode = layout.layoutMode === "dimensions";

  const gridTemplateColumnsStyle =
    isDimensionMode && layout.itemWidth && layout.itemWidth > 0
      ? `repeat(${layout.cols}, calc(${layout.itemWidth}cm * ${zoom}))`
      : `repeat(${layout.cols}, 1fr)`;

  const gridTemplateRowsStyle =
    isDimensionMode && layout.itemHeight && layout.itemHeight > 0
      ? `repeat(${layout.rows}, calc(${layout.itemHeight}cm * ${zoom}))`
      : `repeat(${layout.rows}, 1fr)`;

  return (
    <div
      className={cn(
        "flex-shrink-0 cursor-pointer p-1 rounded-md",
        isSelected && "ring-2 ring-muted-foreground/50"
      )}
      onClick={onSelect}
    >
      <div
        className="flex-shrink-0 bg-white shadow-lg"
        style={{
          width: `calc(${pageWidth} * ${zoom})`,
          height: `calc(${pageHeight} * ${zoom})`,
          display: "grid",

          gridTemplateColumns: gridTemplateColumnsStyle,
          gridTemplateRows: gridTemplateRowsStyle,
          gap: `calc(${layout.gap}mm * ${zoom})`,
          padding: `calc(${layout.pageMargin}mm * ${zoom})`,
          boxSizing: "border-box",
          transition: `width ${transitionDuration} ${transitionTimingFunction}, height ${transitionDuration} ${transitionTimingFunction}`,
          justifyContent: "center",
          alignContent: "start",
        }}
      >
        <SortableContext items={sortableIds} strategy={rectSwappingStrategy}>
          {gridCells.map((cell) => {
            if (cell.type === "placeholder") {
              return <Placeholder key={cell.id} id={cell.id} />;
            }

            const item = cell as GridItem;
            const isGhost = item.id === activeDragItemId;

            return (
              <div
                key={item.id}
                className="relative flex items-center justify-center"
                style={{
                  opacity: isGhost ? 0 : 1,
                  overflow: "hidden",
                }}
              >
                <SortableItem
                  item={item}
                  editor={
                    item.type === "text"
                      ? editorInstances.current[item.id]
                      : null
                  }
                  onSelect={onItemSelect}
                  isSelected={item.id === selectedItemId}
                  onRemove={onItemRemove}
                  onReplace={onItemReplace}
                  onDuplicate={onItemDuplicate}
                />
              </div>
            );
          })}
        </SortableContext>
      </div>
    </div>
  );
};
