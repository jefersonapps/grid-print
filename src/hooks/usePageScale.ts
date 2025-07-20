import { useState, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

type PageOrientation = "portrait" | "landscape";

interface PageDimensions {
  width: number;
  height: number;
}

interface ScaledStyle {
  width: string;
  height: string;
  transform: string;
  transformOrigin: string;
}

interface UsePageScaleResult {
  containerRef: RefObject<HTMLDivElement | null>;
  pageStyle: ScaledStyle;
}

const PAGE_SIZES: Record<string, PageDimensions> = {
  A4: { width: 210, height: 297 },
};

const PIXELS_PER_MM = 96 / 25.4;

export const usePageScale = (
  orientation: PageOrientation
): UsePageScaleResult => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageStyle, setPageStyle] = useState<ScaledStyle>({
    width: "0px",
    height: "0px",
    transform: "scale(1)",
    transformOrigin: "top center",
  });

  useLayoutEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const { width: containerWidth, height: containerHeight } =
        containerRef.current.getBoundingClientRect();

      const page = PAGE_SIZES.A4;
      const pageDimensionsInMm: PageDimensions =
        orientation === "portrait"
          ? { width: page.width, height: page.height }
          : { width: page.height, height: page.width };

      const pageWidthInPx = pageDimensionsInMm.width * PIXELS_PER_MM;
      const pageHeightInPx = pageDimensionsInMm.height * PIXELS_PER_MM;

      const scaleX = containerWidth / pageWidthInPx;
      const scaleY = containerHeight / pageHeightInPx;

      const scale = Math.min(scaleX, scaleY);

      setPageStyle({
        width: `${pageWidthInPx}px`,
        height: `${pageHeightInPx}px`,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      });
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    return () => window.removeEventListener("resize", calculateScale);
  }, [orientation]);

  return { containerRef, pageStyle };
};
