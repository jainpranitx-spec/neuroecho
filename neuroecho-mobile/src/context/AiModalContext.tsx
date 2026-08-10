import React, { createContext, useContext, useMemo, useState } from "react";

interface AiModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const AiModalContext = createContext<AiModalContextValue | null>(null);

export function AiModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return <AiModalContext.Provider value={value}>{children}</AiModalContext.Provider>;
}

export function useAiModal() {
  const ctx = useContext(AiModalContext);
  if (!ctx) throw new Error("useAiModal must be used within AiModalProvider");
  return ctx;
}
