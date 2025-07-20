import "./editor.css";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSwappingStrategy } from "@dnd-kit/sortable";
import { Toaster } from "sonner";

import { useAppLogic } from "./hooks/useAppLogic";
import { SidebarProvider } from "./context/sidebar-context";

import { AppHeader } from "./components/layout/app-header";
import { AppSidebar, SidebarInset } from "./components/layout/app-sidebar";
import { MainToolbar } from "./components/layout/main-toolbar";

import { FileImporter } from "./components/file-importer";
import { LayoutControls } from "./components/layout-controls";
import { PrintablePage } from "./components/printable-page";
import { SortableItem } from "./components/sortable-item";
import { PreviewZoomControl } from "./components/preview-zoom-control";
import { EditingSheet } from "./components/editing-sheet";
import { ThemeProvider } from "./components/theme-provider";

function AppContent() {
  const {
    pages,
    selectedPageId,
    setSelectedPageId,
    selectedItemId,
    activeEditor,
    layout,
    isProcessing,
    previewZoom,
    setPreviewZoom,
    editorInstances,
    editorImageInputRef,
    pageViewportRef,
    allItems,
    selectedItem,
    handleDragEnd,
    handleFileProcessing,
    handleAddTextBlock,
    handleSelect,
    handleRemoveItem,
    handleClear,
    handleAddPage,
    handleRemovePage,
    handleLayoutChange,
    handleItemStyleChange,
    handleImageUploadToEditor,
    triggerEditorImageImport,
    handlePrint,
  } = useAppLogic();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <input
        type="file"
        ref={editorImageInputRef}
        onChange={handleImageUploadToEditor}
        accept="image/*"
        className="hidden"
      />
      <div className="flex h-screen bg-neutral-50 dark:bg-background overflow-hidden">
        <AppSidebar>
          <AppHeader />
          <div className="space-y-4">
            <Toaster richColors position="bottom-right" />
            <FileImporter
              onFileProcessing={handleFileProcessing}
              onAddTextBlock={handleAddTextBlock}
            />
            <LayoutControls
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onClear={handleClear}
              onAddPage={handleAddPage}
              onRemovePage={handleRemovePage}
              selectedPageId={selectedPageId}
              pageCount={pages.length}
              hasFiles={allItems.length > 0}
            />
          </div>
        </AppSidebar>

        <SidebarInset>
          <main className="relative flex-1 flex flex-col px-2 pb-2 sm:px-4 sm:pb-4 bg-neutral-200 dark:bg-neutral-950 overflow-hidden">
            <MainToolbar
              onImportImage={triggerEditorImageImport}
              onPrint={handlePrint}
              isProcessing={isProcessing}
              hasItems={allItems.length > 0}
              activeEditor={activeEditor}
            />
            <div
              ref={pageViewportRef}
              className="flex-1 overflow-auto p-2 pb-24 sm:p-4 sm:pb-24 text-center"
            >
              <div className="inline-block min-w-full">
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:flex-wrap lg:justify-center">
                  {pages.map((page) => (
                    <PrintablePage
                      key={page.id}
                      layout={layout}
                      zoom={previewZoom}
                      isSelected={page.id === selectedPageId}
                      onSelect={() => setSelectedPageId(page.id)}
                    >
                      <SortableContext
                        items={page.items.map((f) => f.id)}
                        strategy={rectSwappingStrategy}
                      >
                        {page.items.map((item) => (
                          <SortableItem
                            key={item.id}
                            item={item}
                            editor={
                              item.type === "text"
                                ? editorInstances.current[item.id]
                                : null
                            }
                            onSelect={handleSelect}
                            isSelected={item.id === selectedItemId}
                            onRemove={handleRemoveItem}
                          />
                        ))}
                      </SortableContext>
                    </PrintablePage>
                  ))}
                </div>
              </div>
            </div>
            <PreviewZoomControl
              value={previewZoom}
              onValueChange={setPreviewZoom}
            />
          </main>
        </SidebarInset>

        <EditingSheet
          selectedItem={selectedItem}
          onStyleChange={handleItemStyleChange}
          onClose={() => handleSelect("")}
        />
      </div>
    </DndContext>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </ThemeProvider>
  );
}
