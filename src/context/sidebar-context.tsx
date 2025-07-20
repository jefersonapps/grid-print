import React, { createContext, useState, useEffect, useContext } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
