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
  editor?: Editor | null;
  htmlContent?: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onRemove: (id: string) => void;
}

export const SortableItem = React.memo(
  ({
    item,
    editor,
    htmlContent,
    onSelect,
    isSelected,
    onRemove,
  }: SortableItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const dndStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // --- RENDERIZAÇÃO CONDICIONAL PARA TEXTO ---
    if (item.type === "text") {
      const wrapperStyle = {
        ...dndStyle,
        position: "relative" as const,
        height: "100%",
        width: "100%",
      };

      const contentContainerStyle = {
        backgroundColor: "white",
        borderRadius: "2px",
        overflow: "hidden",
        height: "100%",
        width: "100%",
        position: "relative" as const,
      };

      return (
        <div
          ref={setNodeRef}
          style={wrapperStyle}
          {...attributes}
          className={cn("group", isSelected && "z-10")}
        >
          <div
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 p-1 z-30 cursor-grab bg-muted/50 dark:bg-muted/40 rounded-md transition-opacity border-1 border-muted shadow-sm backdrop-blur-[2px]",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            {...listeners}
          >
            <GripHorizontal className="size-4 text-muted-foreground dark:text-foreground" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-rose-700" />
          </Button>

          <div
            style={contentContainerStyle}
            className={cn(
              "border border-dashed border-gray-300 dark:border-border",
              isSelected && "ring-2 ring-primary"
            )}
          >
            {htmlContent ? (
              <div
                className="ProseMirror absolute inset-0 overflow-y-auto"
                style={{ borderRadius: `inherit` }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div
                className="absolute inset-0 overflow-y-auto cursor-text"
                style={{ borderRadius: `inherit` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item.id);
                }}
              >
                <TextEditor editor={editor} />
              </div>
            )}
          </div>
        </div>
      );
    }

    // --- RENDERIZAÇÃO CONDICIONAL PARA IMAGENS (E OUTROS TIPOS) ---
    const imageContainerStyle = {
      ...dndStyle,
      display: "flex",
      justifyContent: "center",
      alignItems: item.style.alignItems, // AQUI ESTÁ A LÓGICA DE ALINHAMENTO
      backgroundColor: "transparent",
      borderRadius: `${item.style.borderRadius || 2}px`,
      overflow: "hidden",
      position: "relative" as const,
      height: "100%",
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
        style={imageContainerStyle}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
        className={cn(
          "relative group h-full min-h-0",
          "border border-dashed border-gray-300 dark:border-border",
          "cursor-grab",
          isSelected && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
        >
          <Trash2 className="h-4 w-4 text-rose-700" />
        </Button>
        <img
          src={item.content}
          alt={item.name}
          style={imageStyle}
          className="pointer-events-none"
        />
      </div>
    );
  }
);
