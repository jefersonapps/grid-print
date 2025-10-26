import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  FilePlus,
  Trash2,
  BrushCleaning,
  Grid2X2,
  RulerDimensionLine,
} from "lucide-react";
import type { LayoutConfig, PageOrientation } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LayoutControlsProps {
  layout: LayoutConfig;
  onLayoutChange: (
    key: keyof Omit<LayoutConfig, "itemScale">,
    value: number | string
  ) => void;
  onClear: () => void;
  onAddPage: () => void;
  onRemovePage: (pageIdToRemove: string) => void;
  selectedPageId: string | null;
  pageCount: number;
  hasFiles: boolean;
}

export const LayoutControls = React.memo(
  ({
    layout,
    onLayoutChange,
    onClear,
    onAddPage,
    onRemovePage,
    selectedPageId,
    pageCount,
    hasFiles,
  }: LayoutControlsProps) => {
    const [colsInputValue, setColsInputValue] = useState(String(layout.cols));
    const [rowsInputValue, setRowsInputValue] = useState(String(layout.rows));
    const [itemWidth, setItemWidth] = useState(String(layout.itemWidth || ""));
    const [itemHeight, setItemHeight] = useState(
      String(layout.itemHeight || "")
    );

    useEffect(() => {
      setColsInputValue(String(layout.cols));
    }, [layout.cols]);

    useEffect(() => {
      setRowsInputValue(String(layout.rows));
    }, [layout.rows]);

    useEffect(() => {
      setItemWidth(String(layout.itemWidth || ""));
    }, [layout.itemWidth]);

    useEffect(() => {
      setItemHeight(String(layout.itemHeight || ""));
    }, [layout.itemHeight]);

    const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setColsInputValue(value);
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 1) {
        onLayoutChange("cols", numValue);
      }
    };

    const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setRowsInputValue(value);
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 1) {
        onLayoutChange("rows", numValue);
      }
    };

    const handleItemWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setItemWidth(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        onLayoutChange("itemWidth", numValue);
      }
    };

    const handleItemHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setItemHeight(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        onLayoutChange("itemHeight", numValue);
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Controles de Layout (Página)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orientation-select">Orientação</Label>
            <Select
              value={layout.orientation}
              onValueChange={(v: PageOrientation) =>
                onLayoutChange("orientation", v)
              }
            >
              <SelectTrigger id="orientation-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Retrato</SelectItem>
                <SelectItem value="landscape">Paisagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs
            defaultValue="grid"
            className="w-full"
            value={layout.layoutMode}
            onValueChange={(value) => onLayoutChange("layoutMode", value)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">
                <Grid2X2 className="mr-2 h-4 w-4" /> Grade
              </TabsTrigger>
              <TabsTrigger value="dimensions">
                <RulerDimensionLine className="mr-2 h-4 w-4" /> Dimensões
              </TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cols-input">Colunas</Label>
                  <Input
                    id="cols-input"
                    type="number"
                    value={colsInputValue}
                    onChange={handleColsChange}
                    min={1}
                    className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rows-input">Linhas</Label>
                  <Input
                    id="rows-input"
                    type="number"
                    value={rowsInputValue}
                    onChange={handleRowsChange}
                    min={1}
                    className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dimensions">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="width-input">Largura (cm)</Label>
                  <Input
                    id="width-input"
                    type="number"
                    value={itemWidth}
                    onChange={handleItemWidthChange}
                    min={0.1}
                    step={0.1}
                    className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height-input">Altura (cm)</Label>
                  <Input
                    id="height-input"
                    type="number"
                    value={itemHeight}
                    onChange={handleItemHeightChange}
                    min={0.1}
                    step={0.1}
                    className="w-full [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Margem da Página ({layout.pageMargin}mm)</Label>
            <Slider
              value={[layout.pageMargin]}
              onValueChange={(value) => onLayoutChange("pageMargin", value[0])}
              min={0}
              max={30}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Espaçamento ({layout.gap}mm)</Label>
            <Slider
              value={[layout.gap]}
              onValueChange={(value) => onLayoutChange("gap", value[0])}
              min={0}
              max={20}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="default" size="sm" onClick={onAddPage}>
              <FilePlus className="mr-2 h-4 w-4" /> Nova Página
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!selectedPageId || pageCount <= 1}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Apagar Página
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá
                    permanentemente a página selecionada e todos os seus itens.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (selectedPageId) {
                        onRemovePage(selectedPageId);
                      }
                    }}
                  >
                    Continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={!hasFiles}>
                  <BrushCleaning className="mr-2 h-4 w-4" /> Limpar Tudo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso irá apagar os itens
                    adicionados em todas as páginas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear}>
                    Continuar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }
);
