import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/context/sidebar-context";

import { cn } from "@/lib/utils";

export const SidebarTrigger = React.memo(
  ({ className }: { className?: string }) => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn("shrink-0", className)}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSidebarOpen ? "Recolher Painel" : "Expandir Painel"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);
