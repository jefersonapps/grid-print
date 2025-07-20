import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ImageIcon as ImageIconLucide,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Minus,
  CornerDownLeft,
  Undo,
  Redo,
  Pilcrow,
  ChevronDown,
} from "lucide-react";
import { CustomSelect, CustomSelectItem } from "@/components/ui/custom-select";

interface TextFormattingToolbarProps {
  editor: Editor;
  onImportImage: () => void;
}

export const TextFormattingToolbar = ({
  editor,
  onImportImage,
}: TextFormattingToolbarProps) => {
  const [, setUpdateKey] = useState(0);
  const [isFontSizePopoverOpen, setIsFontSizePopoverOpen] = useState(false);
  const [isColorPopoverOpen, setIsColorPopoverOpen] = useState(false);
  const activeFontSize = editor.getAttributes("textStyle").fontSize || "";
  const activeColor = editor.getAttributes("textStyle").color || "#000000";

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleUpdate = () => {
      setUpdateKey((prev) => prev + 1);
    };
    editor.on("transaction", handleUpdate);
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, editor.state.selection]);

  const getActiveStyleValue = () => {
    if (editor.isActive("paragraph")) return "paragraph";
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i as 1 | 2 | 3 | 4 | 5 | 6 }))
        return `h${i}`;
    }
    return "paragraph";
  };
  const handleStyleChange = (value: string) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };
  const handleFontSizeChange = (value: string) => {
    if (value) {
      editor.chain().focus().setFontSize(`${value}px`).run();
    } else {
      editor.chain().focus().unsetFontSize().run();
    }
    setIsFontSizePopoverOpen(false);
  };
  const handleColorSelection = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setIsColorPopoverOpen(false);
  };

  const PREDEFINED_FONT_SIZES = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "14",
    "18",
    "24",
    "30",
    "36",
    "48",
    "60",
    "72",
    "96",
  ];
  const PALETTE_COLORS = [
    "#000000",
    "#434343",
    "#666666",
    "#999999",
    "#b7b7b7",
    "#cccccc",
    "#d9d9d9",
    "#efefef",
    "#f3f3f3",
    "#ffffff",
    "#980000",
    "#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff",
    "#e6b8af",
    "#f4cccc",
    "#fce5cd",
    "#fff2cc",
    "#d9ead3",
    "#d0e0e3",
    "#c9daf8",
    "#cfe2f3",
    "#d9d2e9",
    "#ead1dc",
    "#dd7e6b",
    "#ea9999",
    "#f9cb9c",
    "#ffe599",
    "#b6d7a8",
    "#a2c4c9",
    "#a4c2f4",
    "#9fc5e8",
    "#b4a7d6",
    "#d5a6bd",
    "#cc4125",
    "#e06666",
    "#f6b26b",
    "#ffd966",
    "#93c47d",
    "#76a5af",
    "#6d9eeb",
    "#6fa8dc",
    "#8e7cc3",
    "#c27ba0",
    "#a61c00",
    "#cc0000",
    "#e69138",
    "#f1c232",
    "#6aa84f",
    "#45818e",
    "#3c78d8",
    "#3d85c6",
    "#674ea7",
    "#a64d79",
    "#85200c",
    "#990000",
    "#b45f06",
    "#bf9000",
    "#38761d",
    "#134f5c",
    "#0b5394",
    "#0c5490",
    "#351c75",
    "#741b47",
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipProvider>
        <CustomSelect
          value={getActiveStyleValue()}
          onValueChange={handleStyleChange}
          placeholder="Estilo de Texto"
        >
          <CustomSelectItem value="paragraph">
            <Pilcrow className="inline shrink-0 h-4 w-4 mr-2" />
            Parágrafo
          </CustomSelectItem>
          <CustomSelectItem value="h1">
            <Heading1 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 1
          </CustomSelectItem>
          <CustomSelectItem value="h2">
            <Heading2 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 2
          </CustomSelectItem>
          <CustomSelectItem value="h3">
            <Heading3 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 3
          </CustomSelectItem>
          <CustomSelectItem value="h4">
            <Heading4 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 4
          </CustomSelectItem>
          <CustomSelectItem value="h5">
            <Heading5 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 5
          </CustomSelectItem>
          <CustomSelectItem value="h6">
            <Heading6 className="inline shrink-0 h-4 w-4 mr-2" />
            Título 6
          </CustomSelectItem>
        </CustomSelect>
        <Popover
          open={isFontSizePopoverOpen}
          onOpenChange={setIsFontSizePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[110px] justify-between"
              onMouseDown={(e) => e.preventDefault()}
            >
              <span>{activeFontSize.replace("px", "") || "Fonte"}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[100px] p-1"
            onMouseDown={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {PREDEFINED_FONT_SIZES.map((size) => (
                <Button
                  key={size}
                  variant="ghost"
                  className={cn("w-full justify-start", {
                    "bg-accent text-accent-foreground":
                      activeFontSize === size + "px",
                  })}
                  onClick={() => handleFontSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="h-8 mx-1" />
        <ToggleGroup
          type="multiple"
          value={["bold", "italic", "underline", "strike"].filter((mark) =>
            editor.isActive(mark)
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("bold"),
                })}
              >
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Negrito</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("italic"),
                })}
              >
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Itálico</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("underline"),
                })}
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Sublinhado</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="strike"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("strike"),
                })}
              >
                <Strikethrough className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Riscado</TooltipContent>
          </Tooltip>
        </ToggleGroup>
        <Popover open={isColorPopoverOpen} onOpenChange={setIsColorPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: activeColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-2"
            onMouseDown={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
              {PALETTE_COLORS.map((color) => (
                <TooltipProvider key={color}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => handleColorSelection(color)}
                      >
                        <div
                          className="w-5 h-5 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{color}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setIsColorPopoverOpen(false);
              }}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Remover Cor
            </Button>
          </PopoverContent>
        </Popover>
        <Separator orientation="vertical" className="h-8 mx-1" />
        <ToggleGroup
          type="single"
          value={["left", "center", "right", "justify"].find(
            (align) => editor.isActive({ textAlign: align }) || ""
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="left"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={cn({
                  "bg-primary text-white hover:bg-primary/80": editor.isActive({
                    textAlign: "left",
                  }),
                })}
              >
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Alinhar à Esquerda</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="center"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={cn({
                  "bg-primary text-white hover:bg-primary/80": editor.isActive({
                    textAlign: "center",
                  }),
                })}
              >
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Centralizar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="right"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={cn({
                  "bg-primary text-white hover:bg-primary/80": editor.isActive({
                    textAlign: "right",
                  }),
                })}
              >
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Alinhar à Direita</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="justify"
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className={cn({
                  "bg-primary text-white hover:bg-primary/80": editor.isActive({
                    textAlign: "justify",
                  }),
                })}
              >
                <AlignJustify className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Justificar</TooltipContent>
          </Tooltip>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-8 mx-1" />
        <ToggleGroup
          type="multiple"
          value={[
            "bulletList",
            "orderedList",
            "blockquote",
            "codeBlock",
          ].filter((block) => editor.isActive(block))}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="bulletList"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("bulletList"),
                })}
              >
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Lista com Marcadores</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="orderedList"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("orderedList"),
                })}
              >
                <ListOrdered className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Lista Numerada</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="blockquote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("blockquote"),
                })}
              >
                <Quote className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Bloco de Citação</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value="codeBlock"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn({
                  "bg-primary text-white hover:bg-primary/80":
                    editor.isActive("codeBlock"),
                })}
              >
                <Code2 className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>Bloco de Código</TooltipContent>
          </Tooltip>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-8 mx-1" />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onImportImage}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ImageIconLucide className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inserir Imagem</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Linha Horizontal</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().setHardBreak().run()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <CornerDownLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quebra de Linha</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run()
                }
                onMouseDown={(e) => e.preventDefault()}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Limpar Formatação</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-8 mx-1" />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Desfazer</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refazer</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
