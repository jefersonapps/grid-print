import React from "react";
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
import { Settings, FilePlus, Trash2, BrushCleaning } from "lucide-react";
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
  }: LayoutControlsProps) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cols-select">Colunas</Label>
            <Select
              value={String(layout.cols)}
              onValueChange={(v) => onLayoutChange("cols", Number(v))}
            >
              <SelectTrigger id="cols-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rows-select">Linhas</Label>
            <Select
              value={String(layout.rows)}
              onValueChange={(v) => onLayoutChange("rows", Number(v))}
            >
              <SelectTrigger id="rows-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente
                  a página selecionada e todos os seus itens.
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
  )
);
