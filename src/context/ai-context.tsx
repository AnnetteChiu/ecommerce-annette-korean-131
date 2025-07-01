'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AiContextType {
  isAiEnabled: boolean;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  return (
    <AiContext.Provider value={{ isAiEnabled: enabled }}>
      {children}
    </AiContext.Provider>
  );
}

export function useAi() {
  const context = useContext(AiContext);
  if (context === undefined) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
}
