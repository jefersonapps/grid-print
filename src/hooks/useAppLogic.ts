import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { Editor } from "@tiptap/react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";

import { useMediaQuery } from "./useMediaQuery";
import { useSidebar } from "@/context/sidebar-context";
import { createNewEditor } from "@/editor/config";
import { readFileAsDataURL } from "@/lib/utils";
import type {
  Page,
  GridItem,
  LayoutConfig,
  ItemStyle,
  EditorInstancesRef,
} from "@/types";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export const useAppLogic = () => {
  const [pages, setPages] = useState<Page[]>([
    { id: `page-${Date.now()}`, items: [] },
  ]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [layout, setLayout] = useState<LayoutConfig>({
    cols: 2,
    rows: 2,
    pageMargin: 10,
    gap: 5,
    orientation: "portrait",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  const editorInstances: EditorInstancesRef = useRef({});
  const editorImageInputRef = useRef<HTMLInputElement>(null);
  const pageViewportRef = useRef<HTMLDivElement>(null);

  const allItems = pages.flatMap((p) => p.items);
  const selectedItem = allItems.find((f) => f.id === selectedItemId) || null;

  const { setIsSidebarOpen } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    if (!selectedPageId && pages.length > 0) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const calculateFitZoom = useCallback(() => {
    if (!pageViewportRef.current) return 1;
    const containerWidth = pageViewportRef.current.clientWidth;
    const tempPage = document.createElement("div");
    tempPage.style.width =
      layout.orientation === "portrait" ? "210mm" : "297mm";
    tempPage.style.position = "absolute";
    tempPage.style.visibility = "hidden";
    document.body.appendChild(tempPage);
    const realPageWidth = tempPage.offsetWidth;
    document.body.removeChild(tempPage);
    if (realPageWidth === 0) return 1;
    return (containerWidth * 0.95) / realPageWidth;
  }, [layout.orientation]);

  useEffect(() => {
    if (isMobile) {
      setPreviewZoom(calculateFitZoom());
    } else {
      setPreviewZoom(1);
    }
  }, [isMobile, layout.orientation, calculateFitZoom]);

  useEffect(() => {
    return () => {
      Object.values(editorInstances.current).forEach((editor) => {
        if (!editor.isDestroyed) {
          editor.destroy();
        }
      });
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPages((currentPages) => {
        const activePage = currentPages.find((p) =>
          p.items.some((i) => i.id === active.id)
        );
        const overPage = currentPages.find((p) =>
          p.items.some((i) => i.id === over.id)
        );

        if (activePage && overPage && activePage.id === overPage.id) {
          const oldIndex = activePage.items.findIndex(
            (i) => i.id === active.id
          );
          const newIndex = overPage.items.findIndex((i) => i.id === over.id);

          const reorderedItems = arrayMove(
            activePage.items,
            oldIndex,
            newIndex
          );
          return currentPages.map((p) =>
            p.id === activePage.id ? { ...p, items: reorderedItems } : p
          );
        }
        return currentPages;
      });
    }
  };

  const addItemsToPages = useCallback(
    (newItems: GridItem[]) => {
      if (newItems.length === 0) return;
      setPages((currentPages) => {
        const updatedPages: Page[] = JSON.parse(JSON.stringify(currentPages));
        const capacity = layout.cols * layout.rows;

        let targetPageIndex = updatedPages.findIndex(
          (p) => p.id === selectedPageId
        );
        if (targetPageIndex === -1) {
          targetPageIndex = Math.max(0, updatedPages.length - 1);
        }

        newItems.forEach((newItem) => {
          let placed = false;
          for (let i = 0; i < updatedPages.length && !placed; i++) {
            const pageIndex = (targetPageIndex + i) % updatedPages.length;
            if (updatedPages[pageIndex].items.length < capacity) {
              updatedPages[pageIndex].items.push(newItem);
              placed = true;
            }
          }

          if (!placed) {
            const newPage = {
              id: `page-${newItem.id}-${Date.now()}`,
              items: [newItem],
            };
            updatedPages.push(newPage);
          }
        });

        return updatedPages;
      });
    },
    [layout.cols, layout.rows, selectedPageId]
  );

  const handleFileProcessing = useCallback(
    async (droppedFiles: FileList) => {
      setIsProcessing(true);
      toast.info("Processando arquivos em alta qualidade...");
      const newItems: GridItem[] = [];
      const defaultStyle: ItemStyle = {
        scale: 1,
        alignItems: "center",
        offsetX: 0,
        offsetY: 0,
        borderRadius: 0,
      };
      const desiredDpi = 300;
      for (const file of Array.from(droppedFiles)) {
        const fileIdBase = `${file.name}-${Date.now()}`;
        if (file.type.startsWith("image/")) {
          const content = await readFileAsDataURL(file);
          newItems.push({
            id: fileIdBase,
            name: file.name,
            type: "image",
            content,
            style: defaultStyle,
          });
        } else if (file.type === "application/pdf") {
          try {
            const arrayBuffer = await new Promise<ArrayBuffer>(
              (resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as ArrayBuffer);
                r.onerror = reject;
                r.readAsArrayBuffer(file);
              }
            );
            const pdf = await getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewportDefault = page.getViewport({ scale: 1 });
              const scale =
                (desiredDpi / viewportDefault.width) *
                (viewportDefault.width / 72);
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement("canvas");
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const context = canvas.getContext("2d");
              if (context) {
                await page.render({ canvasContext: context, viewport }).promise;
                const content = canvas.toDataURL("image/png");
                newItems.push({
                  id: `${fileIdBase}-p${i}`,
                  name: `${file.name} (Pág. ${i})`,
                  type: "pdf_page",
                  content,
                  style: defaultStyle,
                });
              }
            }
          } catch (error: unknown) {
            console.error("PDF Error:", error);
            toast.error(`Falha ao processar PDF: ${file.name}`);
          }
        } else {
          toast.warning(`Tipo de arquivo não suportado: ${file.name}`);
        }
      }
      addItemsToPages(newItems);
      setIsProcessing(false);
      if (newItems.length > 0) {
        toast.success(
          `${newItems.length} item(s) adicionado(s) em alta qualidade!`
        );
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      }
    },
    [isMobile, setIsSidebarOpen, addItemsToPages]
  );

  const handleAddTextBlock = useCallback(() => {
    const id = `text-${Date.now()}`;
    const newItem: GridItem = {
      id,
      name: "Bloco de Texto",
      type: "text",
      content: "",
      style: {
        scale: 1,
        alignItems: "flex-start",
        offsetX: 0,
        offsetY: 0,
        borderRadius: 0,
      },
    };

    const onFocus = ({ editor }: { editor: Editor }) => {
      setSelectedItemId(id);
      setActiveEditor(editor);
    };

    const onBlur = ({ editor }: { editor: Editor }) => {
      setPages((currentPages) =>
        currentPages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === id ? { ...item, content: editor.getHTML() } : item
          ),
        }))
      );
    };

    const newEditor = createNewEditor(newItem.content, onFocus, onBlur);
    editorInstances.current[id] = newEditor;
    addItemsToPages([newItem]);
    toast.success("Bloco de texto adicionado!");

    if (isMobile) {
      setIsSidebarOpen(false);
    }
    setTimeout(() => newEditor.commands.focus(), 100);
  }, [isMobile, setIsSidebarOpen, addItemsToPages]);

  const handleSelect = useCallback(
    (id: string) => {
      if (selectedItemId === id) return;
      setSelectedItemId(id);
      const item = allItems.find((i) => i.id === id);
      if (item?.type === "text") {
        const editor = editorInstances.current[id];
        if (editor) {
          editor.commands.focus();
          setActiveEditor(editor);
        }
      } else {
        setActiveEditor(null);
      }
    },
    [allItems, selectedItemId]
  );

  const handleRemoveItem = useCallback(
    (idToRemove: string) => {
      const itemToRemove = allItems.find((item) => item.id === idToRemove);
      if (!itemToRemove) return;
      if (itemToRemove.type === "text") {
        const editorInstance = editorInstances.current[idToRemove];
        if (editorInstance && !editorInstance.isDestroyed) {
          editorInstance.destroy();
        }
        delete editorInstances.current[idToRemove];
      }
      if (selectedItemId === idToRemove) {
        setSelectedItemId(null);
        setActiveEditor(null);
      }
      setPages((currentPages) =>
        currentPages
          .map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== idToRemove),
          }))
          .filter((page, index) => page.items.length > 0 || index === 0)
      );

      toast.error(`"${itemToRemove.name}" removido.`);
    },
    [allItems, selectedItemId]
  );

  const handleClear = useCallback(() => {
    Object.values(editorInstances.current).forEach((editor) => {
      if (!editor.isDestroyed) {
        editor.destroy();
      }
    });
    editorInstances.current = {};
    const firstPageId = `page-${Date.now()}`;
    setPages([{ id: firstPageId, items: [] }]);
    setSelectedPageId(firstPageId);
    setSelectedItemId(null);
    setActiveEditor(null);
  }, []);

  const handleAddPage = useCallback(() => {
    const newPageId = `page-${Date.now()}`;
    const newPage: Page = { id: newPageId, items: [] };
    setPages((currentPages) => [...currentPages, newPage]);
    setSelectedPageId(newPageId);
    toast.success("Nova página adicionada!");
  }, []);

  const handleLayoutChange = useCallback(
    (key: keyof Omit<LayoutConfig, "itemScale">, value: number | string) => {
      setLayout((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleItemStyleChange = useCallback(
    (itemId: string, newStyle: Partial<ItemStyle>) => {
      setPages((currentPages) =>
        currentPages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === itemId
              ? { ...item, style: { ...item.style, ...newStyle } }
              : item
          ),
        }))
      );
    },
    []
  );
  const handleImageUploadToEditor = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!activeEditor || !event.target.files || !event.target.files[0]) {
        return;
      }
      const file = event.target.files[0];
      try {
        const url = await readFileAsDataURL(file);
        activeEditor.chain().focus().setImage({ src: url }).run();
        toast.success("Imagem inserida!");
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Falha ao carregar a imagem.");
      } finally {
        if (editorImageInputRef.current) {
          editorImageInputRef.current.value = "";
        }
      }
    },
    [activeEditor]
  );

  const triggerEditorImageImport = useCallback(() => {
    editorImageInputRef.current?.click();
  }, []);

  const handlePrint = () => {
    if (allItems.length === 0) {
      toast.error("Adicione itens antes de imprimir.");
      return;
    }
    toast.info("Preparando documento para impressão...");

    const updatedPages = pages.map((page) => ({
      ...page,
      items: page.items.map((item) => {
        if (item.type === "text") {
          const editor = editorInstances.current[item.id];
          if (editor && !editor.isDestroyed) {
            return { ...item, content: editor.getHTML() };
          }
        }
        return item;
      }),
    }));

    setPages(updatedPages);

    let iframe: HTMLIFrameElement | null = null;
    try {
      const stylesheets = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            if (styleSheet.cssRules) {
              return `<style>${Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join("\n")}</style>`;
            }
            if (styleSheet.href) {
              return `<link rel="stylesheet" href="${styleSheet.href}">`;
            }
            return "";
          } catch (error) {
            console.error("Erro ao ler CSS:", error);
            if (styleSheet.href) {
              return `<link rel="stylesheet" href="${styleSheet.href}">`;
            }
            return "";
          }
        })
        .join("\n");

      const printPagesHtml = updatedPages
        .filter((page) => page.items.length > 0)
        .map((page) => {
          const printReadyFiles = page.items.map((item) => {
            const gridItemStyle = `display: flex; align-items: ${item.style.alignItems}; justify-content: center; overflow: hidden; border: 1px dashed #ccc; box-sizing: border-box; border-radius: ${item.style.borderRadius}px; background-color: white; position: relative;`;
            if (item.type === "text") {
              return `<div class="pdf-grid-item" style="${gridItemStyle}"><div class="ProseMirror" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;">${item.content}</div></div>`;
            }
            const getTransformOrigin = () => {
              switch (item.style.alignItems) {
                case "flex-start":
                  return "center top";
                case "flex-end":
                  return "center bottom";
                default:
                  return "center center";
              }
            };
            const imageStyle = `transform: translateX(${
              item.style.offsetX
            }%) translateY(${item.style.offsetY}%) scale(${
              item.style.scale
            }); transform-origin: ${getTransformOrigin()}; max-width: 100%; max-height: 100%; object-fit: contain;`;
            return `<div class="pdf-grid-item" style="${gridItemStyle}"><img src="${item.content}" alt="${item.name}" style="${imageStyle}" /></div>`;
          });

          const pageContent = `<div class="pdf-page-grid">${printReadyFiles.join(
            ""
          )}</div>`;
          return `<div class="pdf-page-container">${pageContent}</div>`;
        })
        .join("");

      const printPageStructureCSS = `<style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        @page {
          size: A4 ${layout.orientation};
          margin: 0 !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Inter', sans-serif;
        }
        .pdf-page-container {
          width: ${layout.orientation === "landscape" ? "297mm" : "210mm"};
          height: ${layout.orientation === "landscape" ? "210mm" : "297mm"};
          box-sizing: border-box;
          page-break-after: always;
        }
        .pdf-page-grid {
          display: grid !important;
          grid-template-columns: repeat(${layout.cols}, 1fr) !important;
          grid-template-rows: repeat(${layout.rows}, 1fr) !important;
          gap: ${layout.gap}mm !important;
          padding: ${layout.pageMargin}mm !important;
          box-sizing: border-box !important;
          background: white !important;
          width: 100%;
          height: 100%;
        }
        .pdf-grid-item {
          box-sizing: border-box;
          overflow: hidden;
        }
        @media print {
          html, body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pdf-grid-item {
            border: none !important;
          }
        }
      </style>`;

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Grid Print</title>${stylesheets}${printPageStructureCSS}</head><body>${printPagesHtml}</body></html>`;

      iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (!doc) {
        throw new Error("Não foi possível acessar o documento do iframe.");
      }
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.onload = function () {
        if (iframe?.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
      };
    } catch (error) {
      console.error("Erro ao preparar impressão:", error);
      toast.error(
        error instanceof Error
          ? `Erro: ${error.message}`
          : "Ocorreu um erro desconhecido."
      );
    } finally {
      setTimeout(() => {
        if (iframe) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  };

  return {
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
    handleLayoutChange,
    handleItemStyleChange,
    handleImageUploadToEditor,
    triggerEditorImageImport,
    handlePrint,
  };
};
