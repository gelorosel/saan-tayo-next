"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PersonalityProfile } from "@/src/types/personality";

interface PersonalitiesSidebarContextType {
  isOpen: boolean;
  selectedPersonality: PersonalityProfile | null;
  openSidebar: (personality?: PersonalityProfile) => void;
  closeSidebar: () => void;
  setSelectedPersonality: (personality: PersonalityProfile | null) => void;
}

const PersonalitiesSidebarContext = createContext<PersonalitiesSidebarContextType | undefined>(
  undefined
);

export function PersonalitiesSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityProfile | null>(null);

  const openSidebar = (personality?: PersonalityProfile) => {
    setIsOpen(true);
    if (personality) {
      setSelectedPersonality(personality);
    }
  };

  const closeSidebar = () => {
    setIsOpen(false);
    setSelectedPersonality(null);
  };

  return (
    <PersonalitiesSidebarContext.Provider
      value={{
        isOpen,
        selectedPersonality,
        openSidebar,
        closeSidebar,
        setSelectedPersonality,
      }}
    >
      {children}
    </PersonalitiesSidebarContext.Provider>
  );
}

export function usePersonalitiesSidebar() {
  const context = useContext(PersonalitiesSidebarContext);
  if (context === undefined) {
    throw new Error(
      "usePersonalitiesSidebar must be used within a PersonalitiesSidebarProvider"
    );
  }
  return context;
}
