import "./editor.css";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
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
import { PagesQuantity } from "./components/pages-quantity";
import { DataGeneratorDialog } from "./components/data-generation-dialog";
import { DuplicateItemDialog } from "./components/duplicate-item-dialog";

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
    replaceItemInputRef,
    pageViewportRef,
    allItems,
    selectedItem,
    activeDragItem,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    handleDragEnd,
    handleFileProcessing,
    handleItemReplacement,
    handleAddTextBlock,
    handleSelect,
    handleRemoveItem,
    handleTriggerReplaceItem,
    handleClear,
    handleAddPage,
    handleRemovePage,
    handleLayoutChange,
    handleItemStyleChange,
    handleImageUploadToEditor,
    triggerEditorImageImport,
    handlePrint,
    undo,
    redo,
    canUndo,
    canRedo,
    handleApplyStyleToAll,
    isDataGeneratorOpen,
    handleDataGeneration,
    handleToggleDataGenerator,
    duplicatingItem,
    handleTriggerDuplicate,
    handleDuplicateItem,
    handleCloseDuplicateDialog,
  } = useAppLogic();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleSelect("");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <input
        type="file"
        ref={editorImageInputRef}
        onChange={handleImageUploadToEditor}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={replaceItemInputRef}
        onChange={handleItemReplacement}
        accept="image/*,application/pdf"
        className="hidden"
      />
      <div className="flex h-screen bg-neutral-50 dark:bg-background overflow-hidden">
        <AppSidebar>
          <div className="fixed top-0 left-0 w-full pt-2 pl-4 pr-4 backdrop-blur-md bg-card/50 z-50">
            <AppHeader />
          </div>
          <div className="space-y-4 mt-14">
            <Toaster richColors position="bottom-right" />
            <FileImporter
              onFileProcessing={handleFileProcessing}
              onAddTextBlock={handleAddTextBlock}
              onGenerateFromDataClick={handleToggleDataGenerator}
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
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <div
              ref={pageViewportRef}
              className="flex-1 overflow-auto p-2 pb-24 sm:p-4 sm:pb-24 text-center"
              onClick={handleBackgroundClick}
            >
              <div
                className="inline-block min-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-4 lg:flex-row lg:flex-wrap lg:justify-center">
                  {pages.map((page) => (
                    <PrintablePage
                      key={page.id}
                      pageId={page.id}
                      items={page.items}
                      layout={layout}
                      zoom={previewZoom}
                      isSelected={page.id === selectedPageId}
                      onSelect={() => setSelectedPageId(page.id)}
                      editorInstances={editorInstances}
                      selectedItemId={selectedItemId}
                      onItemSelect={handleSelect}
                      onItemRemove={handleRemoveItem}
                      onItemReplace={handleTriggerReplaceItem}
                      onItemDuplicate={handleTriggerDuplicate}
                      activeDragItemId={activeDragItem?.id || null}
                    />
                  ))}
                </div>
              </div>
            </div>
            <PreviewZoomControl
              value={previewZoom}
              onValueChange={setPreviewZoom}
            />
            <PagesQuantity pagesQuantity={pages.length} />
          </main>
        </SidebarInset>

        <EditingSheet
          selectedItem={selectedItem}
          onStyleChange={handleItemStyleChange}
          onClose={() => handleSelect("")}
          onApplyStyleToAll={handleApplyStyleToAll}
        />
      </div>

      <DragOverlay>
        {activeDragItem ? (
          <SortableItem
            item={activeDragItem}
            isOverlay
            htmlContent={
              activeDragItem.type === "text"
                ? editorInstances.current[activeDragItem.id]?.getHTML()
                : undefined
            }
            isSelected={false}
            onSelect={() => {}}
            onRemove={() => {}}
            onReplace={() => {}}
          />
        ) : null}
      </DragOverlay>

      <DataGeneratorDialog
        isOpen={isDataGeneratorOpen}
        onClose={handleToggleDataGenerator}
        onGenerate={handleDataGeneration}
      />

      {duplicatingItem && (
        <DuplicateItemDialog
          isOpen={!!duplicatingItem}
          onClose={handleCloseDuplicateDialog}
          onConfirm={(quantity) =>
            handleDuplicateItem(duplicatingItem, quantity)
          }
          itemName={duplicatingItem.name}
        />
      )}
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
