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
import { Settings, FilePlus, Trash2 } from "lucide-react";
import type { LayoutConfig, PageOrientation } from "@/types";

interface LayoutControlsProps {
  layout: LayoutConfig;
  onLayoutChange: (
    key: keyof Omit<LayoutConfig, "itemScale">,
    value: number | string
  ) => void;
  onClear: () => void;
  onAddPage: () => void;
  hasFiles: boolean;
}

export const LayoutControls = React.memo(
  ({
    layout,
    onLayoutChange,
    onClear,
    onAddPage,
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
            <FilePlus className="mr-2 h-4 w-4" /> Adicionar Nova Página
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            disabled={!hasFiles}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Limpar Tudo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
);
