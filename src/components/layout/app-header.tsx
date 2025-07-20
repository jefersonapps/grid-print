import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Github } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SidebarTrigger } from "./sidebar-trigger";
import { ModeToggle } from "../mode-toggle";

export const AppHeader = () => {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <img src="/app-icon.png" alt="App Logo" className="size-6" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Grid Print
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://github.com/jefersonapps/grid-print"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>Código fonte</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {isMobile && <SidebarTrigger />}
      </div>
    </div>
  );
};
