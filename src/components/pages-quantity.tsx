import React from "react";

interface PreviewZoomControlProps {
  pagesQuantity: number;
}

export const PagesQuantity = React.memo(
  ({ pagesQuantity }: PreviewZoomControlProps) => {
    return (
      <div className="bg-muted/50 dark:bg-muted/50 rounded-md transition-opacity border-1 border-muted shadow-sm backdrop-blur-xs absolute bottom-8 right-4 z-30 flex-shrink-0 p-2">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-sm font-medium w-16 text-center">
            {pagesQuantity} {pagesQuantity === 1 ? "folha" : "folhas"}
          </span>
        </div>
      </div>
    );
  }
);
