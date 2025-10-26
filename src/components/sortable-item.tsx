import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GripHorizontal, Trash2, RefreshCw, Copy } from "lucide-react";
import { TextEditor } from "./editor/text-editor";
import type { GridItem } from "@/types";
import type { Editor } from "@tiptap/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface SortableItemProps {
  item: GridItem;
  editor?: Editor | null;
  htmlContent?: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
  onRemove: (id: string) => void;
  onReplace: (id: string) => void;
  onDuplicate: (item: GridItem) => void;
  isOverlay?: boolean;
}

export const SortableItem = React.memo(
  ({
    item,
    editor,
    htmlContent,
    onSelect,
    isSelected,
    onRemove,
    onReplace,
    onDuplicate,
    isOverlay,
  }: SortableItemProps) => {
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
    };

    const showAsActive = isSelected || isDragging || isOverlay;

    const menuContent = (
      <ContextMenuContent className="w-52" onClick={(e) => e.stopPropagation()}>
        <ContextMenuItem
          onSelect={() => onDuplicate(item)}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          <span>Criar Cópias</span>
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => onReplace(item.id)}
          className="cursor-pointer"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Substituir</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => onRemove(item.id)}
          className="cursor-pointer"
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remover</span>
        </ContextMenuItem>
      </ContextMenuContent>
    );

    const RingOverlay = ({
      borderRadius,
    }: {
      borderRadius: string | number;
    }) => (
      <div
        style={{ borderRadius }}
        className={cn(
          "absolute inset-0 pointer-events-none",
          showAsActive
            ? "ring-2 ring-inset ring-primary"
            : "group-hover:ring-1 group-hover:ring-inset group-hover:ring-gray-300 dark:group-hover:ring-border"
        )}
      />
    );

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
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={setNodeRef}
              style={wrapperStyle}
              {...attributes}
              className={cn("group", showAsActive && "z-10")}
            >
              <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 cursor-grab"
                  {...listeners}
                >
                  <GripHorizontal className="size-4 text-muted-foreground dark:text-foreground" />
                </Button>
              </div>

              <div style={contentContainerStyle}>
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

              <RingOverlay borderRadius="2px" />
            </div>
          </ContextMenuTrigger>
          {menuContent}
        </ContextMenu>
      );
    }

    const imageContainerStyle = {
      ...dndStyle,
      display: "flex",
      justifyContent: "center",
      alignItems: item.style.alignItems,
      backgroundColor: "transparent",
      borderRadius: `${item.style.borderRadius || 2}px`,
      overflow: "hidden",
      position: "relative" as const,
      height: "100%",
      width: "100%",
    };

    const imageStyle: React.CSSProperties = {
      transform: `translateX(${item.style.offsetX || 0}%) translateY(${
        item.style.offsetY || 0
      }%) scale(${item.style.scale || 1}) rotate(${item.style.rotate || 0}deg)`,
      transformOrigin: "center center",
      transition: "transform 0.2s, transform-origin 0.2s",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    };

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={imageContainerStyle}
            {...attributes}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
            className={cn("relative group h-full min-h-0 cursor-pointer")}
          >
            <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6 cursor-grab"
                {...listeners}
              >
                <GripHorizontal className="size-4 text-muted-foreground dark:text-foreground" />
              </Button>
            </div>
            <img
              src={item.content}
              alt={item.name}
              style={imageStyle}
              className="pointer-events-none select-none"
            />

            <RingOverlay borderRadius={`${item.style.borderRadius || 2}px`} />
          </div>
        </ContextMenuTrigger>
        {menuContent}
      </ContextMenu>
    );
  }
);
