import type { Editor } from "@tiptap/react";

export type ItemType = "image" | "pdf_page" | "text";
export type PageOrientation = "portrait" | "landscape";

export interface ItemStyle {
  scale: number;
  alignItems: "flex-start" | "center" | "flex-end";
  offsetX: number;
  offsetY: number;
  borderRadius: number;
  rotate: number;
}

export interface GridItem {
  id: string;
  name: string;
  type: ItemType;
  content: string;
  style: ItemStyle;
}

export interface Page {
  id: string;
  items: GridItem[];
}

export interface LayoutConfig {
  cols: number;
  rows: number;
  pageMargin: number;
  gap: number;
  orientation: PageOrientation;
  itemWidth: number;
  itemHeight: number;
  layoutMode: "grid" | "dimensions";
}

export type EditorInstancesRef = React.MutableRefObject<Record<string, Editor>>;
