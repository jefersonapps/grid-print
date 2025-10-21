import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Eye } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  column: string | null;
}

interface MappedRectangle extends Omit<Rectangle, "column"> {
  column: string;
}

interface PreviewData {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
}

interface DraggableResizableBoxProps {
  rect: Rectangle;
  bounds: { width: number; height: number };
  onUpdate: (id: string, newRect: Partial<Rectangle>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
  zoomLevel: number;
}

const DraggableResizableBox: React.FC<DraggableResizableBoxProps> = ({
  rect,
  bounds,
  onUpdate,
  onSelect,
  isSelected,
  zoomLevel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const minSize = 20;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, action: "drag" | string) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(rect.id);
      if (action === "drag") {
        setIsDragging(true);
      } else {
        setIsResizing(action);
      }
    },
    [onSelect, rect.id]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      e.preventDefault();
      e.stopPropagation();

      const movementX = e.movementX / zoomLevel;
      const movementY = e.movementY / zoomLevel;

      const newRect = { ...rect };

      if (isDragging) {
        newRect.x += movementX;
        newRect.y += movementY;
      } else if (isResizing) {
        switch (isResizing) {
          case "top-left":
            newRect.width -= movementX;
            newRect.height -= movementY;
            newRect.x += movementX;
            newRect.y += movementY;
            break;
          case "top-right":
            newRect.width += movementX;
            newRect.height -= movementY;
            newRect.y += movementY;
            break;
          case "bottom-left":
            newRect.width -= movementX;
            newRect.height += movementY;
            newRect.x += movementX;
            break;
          case "bottom-right":
            newRect.width += movementX;
            newRect.height += movementY;
            break;
          default:
            break;
        }

        if (newRect.width < minSize) {
          const delta = minSize - newRect.width;
          newRect.width = minSize;
          if (isResizing.includes("left")) newRect.x -= delta;
        }
        if (newRect.height < minSize) {
          const delta = minSize - newRect.height;
          newRect.height = minSize;
          if (isResizing.includes("top")) newRect.y -= delta;
        }
      }

      newRect.x = Math.max(
        0,
        Math.min(newRect.x, bounds.width - newRect.width)
      );
      newRect.y = Math.max(
        0,
        Math.min(newRect.y, bounds.height - newRect.height)
      );
      newRect.width = Math.min(newRect.width, bounds.width - newRect.x);
      newRect.height = Math.min(newRect.height, bounds.height - newRect.y);

      onUpdate(rect.id, newRect);
    },
    [isDragging, isResizing, rect, bounds, onUpdate, zoomLevel]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handles = [
    { pos: "top-left", cursor: "nwse-resize" },
    { pos: "top-right", cursor: "nesw-resize" },
    { pos: "bottom-left", cursor: "nesw-resize" },
    { pos: "bottom-right", cursor: "nwse-resize" },
  ];

  return (
    <div
      ref={ref}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        cursor: "move",
      }}
      className={`absolute border-2 ${
        isSelected ? "border-primary" : "border-dashed border-red-500"
      }`}
      onMouseDown={(e) => handleMouseDown(e, "drag")}
    >
      {isSelected &&
        handles.map((handle) => (
          <div
            key={handle.pos}
            className={`absolute w-3 h-3 bg-primary -m-1.5`}
            style={{
              cursor: handle.cursor,
              ...Object.fromEntries(handle.pos.split("-").map((p) => [p, "0"])),
            }}
            onMouseDown={(e) => handleMouseDown(e, handle.pos)}
          />
        ))}
      {isSelected && (
        <span className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs px-1 rounded-sm">
          {rect.column || "Não Mapeado"}
        </span>
      )}
    </div>
  );
};

interface DataGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (
    templateImage: string,
    rectangles: MappedRectangle[],
    data: Record<string, string>[]
  ) => void;
}

export const DataGeneratorDialog: React.FC<DataGeneratorDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState({ w: 0, h: 0 });
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRectId, setSelectedRectId] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [renderedImageSize, setRenderedImageSize] = useState({
    width: 0,
    height: 0,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const templateImageRef = useRef<HTMLImageElement>(null);
  const templateImageInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const tempCanvasContext = useRef<CanvasRenderingContext2D | null>(null);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedRectId(null);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setRenderedImageSize({
      width: e.currentTarget.clientWidth,
      height: e.currentTarget.clientHeight,
    });
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgSrc = event.target?.result as string;
        setTemplateImage(imgSrc);
        const img = new Image();
        img.onload = () => {
          setOriginalImageSize({ w: img.naturalWidth, h: img.naturalHeight });
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
      setRectangles([]);
      setSelectedRectId(null);
      setRenderedImageSize({ width: 0, height: 0 });
      setZoomLevel(1);
      setIsPreviewing(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const lines = text.trim().split("\n");
          const headers = lines[0]
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean);

          const data = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            return headers.reduce((obj, header, index) => {
              if (values[index] !== undefined) {
                obj[header] = values[index];
              }
              return obj;
            }, {} as Record<string, string>);
          });
          setCsvHeaders(headers);
          setCsvData(data);
          toast.success(`${data.length} registros carregados do CSV.`);
        } catch (err) {
          toast.error("Erro ao processar o arquivo CSV.");
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  };

  const addRectangle = () => {
    const newRect: Rectangle = {
      id: `rect-${Date.now()}`,
      x: 20,
      y: 20,
      width: 150,
      height: 50,
      column: null,
    };
    setRectangles([...rectangles, newRect]);
    setSelectedRectId(newRect.id);
  };

  const updateRectangle = (id: string, newRect: Partial<Rectangle>) => {
    setRectangles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...newRect } : r))
    );
  };

  const mapColumnToSelectedRect = (column: string) => {
    if (!selectedRectId) return;
    updateRectangle(selectedRectId, { column });
  };

  const removeSelectedRect = useCallback(() => {
    if (!selectedRectId) return;
    setRectangles((rects) => rects.filter((r) => r.id !== selectedRectId));
    setSelectedRectId(null);
  }, [selectedRectId]);

  const handleSelectRect = (id: string) => {
    setSelectedRectId(id);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedRectId) return;

      const actions: Record<string, () => void> = {
        ArrowUp: () =>
          updateRectangle(selectedRectId, {
            y: (rectangles.find((r) => r.id === selectedRectId)?.y || 0) - 1,
          }),
        ArrowDown: () =>
          updateRectangle(selectedRectId, {
            y: (rectangles.find((r) => r.id === selectedRectId)?.y || 0) + 1,
          }),
        ArrowLeft: () =>
          updateRectangle(selectedRectId, {
            x: (rectangles.find((r) => r.id === selectedRectId)?.x || 0) - 1,
          }),
        ArrowRight: () =>
          updateRectangle(selectedRectId, {
            x: (rectangles.find((r) => r.id === selectedRectId)?.x || 0) + 1,
          }),
        Delete: removeSelectedRect,
        Backspace: removeSelectedRect,
      };

      if (actions[e.key]) {
        e.preventDefault();
        actions[e.key]();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, selectedRectId, rectangles, removeSelectedRect]);

  const handleGenerateClick = () => {
    if (!templateImage || renderedImageSize.width === 0) {
      toast.error("A imagem modelo ainda não carregou ou não foi selecionada.");
      return;
    }
    if (csvData.length === 0) {
      toast.error("Por favor, importe um arquivo CSV com dados.");
      return;
    }
    const mappedRects = rectangles.filter(
      (r): r is MappedRectangle => !!r.column
    );
    if (mappedRects.length === 0) {
      toast.error("Mapeie pelo menos uma área a uma coluna do CSV.");
      return;
    }

    const scaleX = originalImageSize.w / renderedImageSize.width;
    const scaleY = originalImageSize.h / renderedImageSize.height;

    const scaledRects: MappedRectangle[] = mappedRects.map((rect) => ({
      id: rect.id,

      x: rect.x * scaleX,
      y: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
      column: rect.column,
    }));

    onGenerate(templateImage, scaledRects, csvData);
    onClose();
  };

  const handlePreviewToggle = () => {
    if (isPreviewing) {
      setIsPreviewing(false);
      return;
    }

    if (csvData.length === 0) {
      toast.warning("Carregue um CSV com dados para pré-visualizar.");
      return;
    }
    if (!tempCanvasContext.current) {
      tempCanvasContext.current = document
        .createElement("canvas")
        .getContext("2d");
    }
    const ctx = tempCanvasContext.current;
    if (!ctx || renderedImageSize.width === 0) return;

    const firstRow = csvData[0];
    const newPreviewData: PreviewData[] = [];

    const scaleX = originalImageSize.w / renderedImageSize.width;
    const scaleY = originalImageSize.h / renderedImageSize.height;

    rectangles.forEach((rect) => {
      if (!rect.column) return;

      const scaledRect = {
        width: rect.width * scaleX,
        height: rect.height * scaleY,
      };

      const text = firstRow[rect.column];
      if (text) {
        let fontSize = scaledRect.height * 0.8;
        ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = ctx.measureText(text).width;

        while (textWidth > scaledRect.width && fontSize > 8) {
          fontSize -= 1;
          ctx.font = `bold ${fontSize}px Arial`;
          textWidth = ctx.measureText(text).width;
        }

        newPreviewData.push({
          text,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,

          font: `${fontSize / scaleY}px`,
        });
      }
    });

    setPreviewData(newPreviewData);
    setIsPreviewing(true);
  };

  const selectedRect = rectangles.find((r) => r.id === selectedRectId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerar Imagens a partir de Dados</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 flex-1 overflow-hidden">
          <div className="flex flex-col gap-4 min-w-0 min-h-0">
            <div className="flex-1 bg-muted/40 p-2 rounded-md overflow-auto flex justify-center items-center">
              {!templateImage ? (
                <div className="text-muted-foreground">
                  Selecione uma imagem modelo para começar
                </div>
              ) : renderedImageSize.width === 0 ? (
                <img
                  src={templateImage}
                  alt="Carregando preview..."
                  className="max-w-full max-h-full object-contain"
                  onLoad={handleImageLoad}
                />
              ) : (
                <div
                  style={{
                    width: renderedImageSize.width * zoomLevel,
                    height: renderedImageSize.height * zoomLevel,
                    flexShrink: 0,
                  }}
                >
                  <div
                    ref={imageContainerRef}
                    className="relative"
                    onClick={handleBackgroundClick}
                    style={{
                      width: renderedImageSize.width,
                      height: renderedImageSize.height,
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <img
                      ref={templateImageRef}
                      src={templateImage}
                      alt="Modelo"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                    {!isPreviewing &&
                      rectangles.map((rect) => (
                        <DraggableResizableBox
                          key={rect.id}
                          rect={rect}
                          bounds={{
                            width: renderedImageSize.width,
                            height: renderedImageSize.height,
                          }}
                          onUpdate={updateRectangle}
                          onSelect={handleSelectRect}
                          isSelected={rect.id === selectedRectId}
                          zoomLevel={zoomLevel}
                        />
                      ))}
                    {isPreviewing &&
                      previewData.map((data, index) => (
                        <div
                          key={`preview-${index}`}
                          style={{
                            position: "absolute",
                            left: data.x,
                            top: data.y,
                            width: data.width,
                            height: data.height,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            pointerEvents: "none",
                            fontFamily: "Arial",
                            fontWeight: "bold",
                            color: "rgba(255, 0, 0, 0.8)",
                            fontSize: data.font,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data.text}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 p-2 border rounded-md">
              <div className="flex-1 space-y-2">
                <Label>Zoom</Label>
                <Slider
                  value={[zoomLevel]}
                  onValueChange={(val) => setZoomLevel(val[0])}
                  min={0.5}
                  max={5}
                  step={0.1}
                  disabled={!templateImage}
                />
              </div>
              <Button
                variant="outline"
                onClick={handlePreviewToggle}
                disabled={!templateImage}
              >
                <Eye className="mr-2 h-4 w-4" />
                {isPreviewing ? "Ocultar Preview" : "Pré-visualizar"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Imagem Modelo</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => templateImageInputRef.current?.click()}
              >
                Carregar Imagem
              </Button>
              <Input
                ref={templateImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTemplateUpload}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Dados (CSV)</h3>
              <Button
                variant="outline"
                className="w-full"
                disabled={!templateImage}
                onClick={() => csvInputRef.current?.click()}
              >
                Carregar CSV
              </Button>
              <Input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Áreas de Dados</h3>
              <Button
                variant="outline"
                className="w-full"
                disabled={!templateImage}
                onClick={addRectangle}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Área
              </Button>
            </div>

            {selectedRect && csvHeaders.length > 0 && (
              <div className="space-y-2 p-2 border rounded-md bg-muted/40">
                <h3 className="font-semibold">Mapear Área Selecionada</h3>
                <Select
                  value={selectedRect.column || ""}
                  onValueChange={mapColumnToSelectedRect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma coluna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={removeSelectedRect}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Área
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleGenerateClick}>Gerar Imagens</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
