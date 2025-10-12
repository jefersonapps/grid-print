import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import {
  ZoomIn,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Radius,
  MoveHorizontal,
  MoveVertical,
} from "lucide-react";
import type { GridItem, ItemStyle } from "@/types";

interface EditingSheetProps {
  selectedItem: GridItem | null;
  onStyleChange: (id: string, newStyle: Partial<ItemStyle>) => void;
  onApplyStyleToAll: (style: ItemStyle) => void;
  onClose: () => void;
}

export const EditingSheet = ({
  selectedItem,
  onStyleChange,
  onApplyStyleToAll,
  onClose,
}: EditingSheetProps) => {
  if (!selectedItem || selectedItem.type === "text") return null;

  const handleStyleChange = (styleUpdate: Partial<ItemStyle>) => {
    onStyleChange(selectedItem.id, styleUpdate);
  };

  const handleApplyToAll = () => {
    onApplyStyleToAll(selectedItem.style);
    onClose();
  };

  return (
    <Sheet
      open={!!selectedItem}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Item</SheetTitle>
          <SheetDescription className="truncate">
            Ajustes para: {selectedItem.name}
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)] px-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" /> Escala (
              {Math.round(selectedItem.style.scale * 100)}%)
            </Label>
            <Slider
              value={[selectedItem.style.scale]}
              onValueChange={(v) => handleStyleChange({ scale: v[0] })}
              min={0.1}
              max={5}
              step={0.05}
            />
          </div>
          <div className="space-y-2">
            <Label>Alinhamento Vertical</Label>
            <ToggleGroup
              type="single"
              value={selectedItem.style.alignItems}
              onValueChange={(v) =>
                v &&
                handleStyleChange({ alignItems: v as ItemStyle["alignItems"] })
              }
              className="w-full"
            >
              <ToggleGroupItem value="flex-start" className="flex-1">
                <AlignVerticalJustifyStart className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="flex-1">
                <AlignVerticalJustifyCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="flex-end" className="flex-1">
                <AlignVerticalJustifyEnd className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Radius className="h-4 w-4" /> Arredondamento da Borda (
              {selectedItem.style.borderRadius}px)
            </Label>
            <Slider
              value={[selectedItem.style.borderRadius]}
              onValueChange={(v) => handleStyleChange({ borderRadius: v[0] })}
              min={0}
              max={50}
              step={1}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MoveHorizontal className="h-4 w-4" /> Posição X (
              {selectedItem.style.offsetX}%)
            </Label>
            <Slider
              value={[selectedItem.style.offsetX]}
              onValueChange={(v) => handleStyleChange({ offsetX: v[0] })}
              min={-100}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MoveVertical className="h-4 w-4" /> Posição Y (
              {selectedItem.style.offsetY}%)
            </Label>
            <Slider
              value={[selectedItem.style.offsetY]}
              onValueChange={(v) => handleStyleChange({ offsetY: v[0] })}
              min={-100}
              max={100}
              step={1}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleApplyToAll}>Aplicar a todos</Button>
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
