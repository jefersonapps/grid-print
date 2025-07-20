import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GripHorizontal, Trash2 } from "lucide-react";
import { TextEditor } from "./editor/text-editor";
import type { GridItem } from "@/types";
import type { Editor } from "@tiptap/react";

interface SortableItemProps {
  item: GridItem;
  editor: Editor | null;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onRemove: (id: string) => void;
}

export const SortableItem = React.memo(
  ({ item, editor, onSelect, isSelected, onRemove }: SortableItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });
    const dndStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 10 : "auto",
      opacity: isDragging ? 0.7 : 1,
    };
    const containerStyle = {
      ...dndStyle,
      display: "flex",
      justifyContent: "center",
      alignItems: item.style.alignItems,
      backgroundColor: item.type === "text" ? "white" : "transparent",
      borderRadius:
        item.type !== "text" ? `${item.style.borderRadius || 2}px` : "2px",
      overflow: item.type === "text" ? "visible" : "hidden",
    };
    const getTransformOrigin = () => {
      switch (item.style.alignItems) {
        case "flex-start":
          return "center top";
        case "flex-end":
          return "center bottom";
        default:
          return "center center";
      }
    };
    const imageStyle: React.CSSProperties = {
      transform: `translateX(${item.style.offsetX}%) translateY(${item.style.offsetY}%) scale(${item.style.scale})`,
      transformOrigin: getTransformOrigin(),
      transition: "transform 0.2s, transform-origin 0.2s",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    };
    return (
      <div
        ref={setNodeRef}
        style={containerStyle}
        {...attributes}
        {...(item.type !== "text" ? listeners : {})}
        onClick={(e) => {
          if (item.type !== "text") {
            e.stopPropagation();
            onSelect(item.id);
          }
        }}
        className={cn(
          "relative group h-full min-h-0",
          "border border-dashed border-gray-300 dark:border-border",
          item.type !== "text" ? "cursor-grab" : "cursor-default",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
      >
        {item.type === "text" && (
          <div
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 p-1 z-30 cursor-grab bg-muted/50 dark:bg-muted/50 rounded-md transition-opacity border-1 border-muted shadow-sm backdrop-blur-[2px]",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            {...listeners}
          >
            <GripHorizontal className="size-4 text-muted-foreground" />
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-rose-700" />
        </Button>
        {item.type === "text" ? (
          <div
            className="w-full h-full overflow-y-auto overflow-x-hidden cursor-text"
            style={{ borderRadius: `${item.style.borderRadius || 2}px` }}
            onClick={() => onSelect(item.id)}
          >
            <TextEditor editor={editor} />
          </div>
        ) : (
          <img
            src={item.content}
            alt={item.name}
            style={imageStyle}
            className="pointer-events-none"
          />
        )}
      </div>
    );
  }
);
