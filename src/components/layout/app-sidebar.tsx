import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/sidebar-context";

export const AppSidebar = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen } = useSidebar();
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-neutral-100 dark:bg-card transition-transform duration-300 ease-in-out lg:static lg:h-auto",
        "w-full lg:w-96",
        isSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full lg:w-0 lg:p-0 lg:border-none lg:overflow-hidden"
      )}
    >
      <div
        className={cn(
          "overflow-y-auto h-full p-2 sm:p-4 transition-opacity relative",
          isSidebarOpen ? "opacity-100" : "opacity-0"
        )}
      >
        {children}
      </div>
    </aside>
  );
};

export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-1 flex flex-col min-w-0">{children}</div>;
};
