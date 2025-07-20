"use client";

import * as React from "react";
import { useState, useRef, useEffect, Children, cloneElement } from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

interface CustomSelectItemProps {
  value: string;
  children: React.ReactNode;
  onClick?: (value: string) => void;
  isSelected?: boolean;
}

export const CustomSelectItem = ({
  value,
  children,
  onClick,
  isSelected,
}: CustomSelectItemProps) => {
  return (
    <div
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none",
        "hover:bg-accent"
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onClick?.(value)}
    >
      {children}
      {isSelected && (
        <span className="flex absolute right-2 size-3.5 items-center justify-center">
          <CheckIcon className="size-4 shrink-0 " />
        </span>
      )}
    </div>
  );
};

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

export const CustomSelect = ({
  value,
  onValueChange,
  children,
  placeholder,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  useClickOutside(selectRef, () => setIsOpen(false));

  const handleItemClick = (newValue: string) => {
    onValueChange(newValue);
    setIsOpen(false);
  };

  const selectedChild = Children.toArray(children).find(
    (child) =>
      React.isValidElement(child) && (child as any).props.value === value
  );

  const displayValue = React.isValidElement(selectedChild)
    ? (selectedChild as any).props.children
    : placeholder;

  return (
    <div className="relative w-[134px]" ref={selectRef}>
      <button
        type="button"
        className={cn(
          "border-input bg-transparent text-sm flex w-full items-center justify-between rounded-md border px-3 py-2 h-9",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDownIcon className="size-4 opacity-50" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          )}
        >
          <div className="p-1">
            {Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return cloneElement(child, {
                  onClick: handleItemClick,
                  isSelected: (child as any).props.value === value,
                } as any);
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
