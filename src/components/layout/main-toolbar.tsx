import React from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, Undo2, Redo2 } from "lucide-react";
import { SidebarTrigger } from "./sidebar-trigger";
import { TextFormattingToolbar } from "../editor/text-formatting-toolbar";

interface MainToolbarProps {
  onImportImage: () => void;
  onPrint: () => void;
  isProcessing: boolean;
  hasItems: boolean;
  activeEditor: Editor | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const MainToolbar = React.memo(
  ({
    onImportImage,
    onPrint,
    isProcessing,
    hasItems,
    activeEditor,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  }: MainToolbarProps) => (
    <div className="bg-muted/50 dark:bg-muted/50 transition-opacity border-1 border-muted shadow-sm backdrop-blur-xs sticky top-0 z-20 flex-shrink-0 rounded-b-lg p-2 flex items-center justify-start gap-2 md:gap-4 flex-wrap">
      <SidebarTrigger />
      <div className="flex items-center gap-1 border-r">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Desfazer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Refazer"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      {activeEditor && (
        <div
          className={`transition-opacity duration-300 min-h-[40px] overflow-x-auto ${
            activeEditor ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <TextFormattingToolbar
            editor={activeEditor}
            onImportImage={onImportImage}
          />
        </div>
      )}
      <div className="flex items-center ml-auto">
        <Button
          onClick={onPrint}
          onMouseDown={(e) => e.preventDefault()}
          disabled={isProcessing || !hasItems}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}{" "}
          Imprimir / Salvar PDF
        </Button>
      </div>
    </div>
  )
);
