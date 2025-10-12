import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ZoomIn } from "lucide-react";

interface PreviewZoomControlProps {
  value: number;
  onValueChange: (newZoom: number) => void;
}

export const PreviewZoomControl = React.memo(
  ({ value, onValueChange }: PreviewZoomControlProps) => {
    return (
      <div className="bg-muted/50 dark:bg-muted/50 rounded-md transition-opacity border-1 border-muted shadow-sm backdrop-blur-xs absolute bottom-8 left-4 md:left-4 md:translate-x-0 z-30 flex-shrink-0 p-2">
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 w-36 sm:w-48">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onValueChange(1)}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar Zoom</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Slider
              defaultValue={[1]}
              value={[value]}
              onValueChange={(v) => onValueChange(v[0])}
              min={0.1}
              max={2.5}
              step={0.01}
            />
          </div>
          <span className="text-sm font-medium w-16 text-center">
            {Math.round(value * 100)}%
          </span>
        </div>
      </div>
    );
  }
);
