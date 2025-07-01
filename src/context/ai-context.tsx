
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AiContextType {
  isAiEnabled: boolean;
  disableAi: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [isEffectivelyEnabled, setIsEffectivelyEnabled] = useState(enabled);

  const disableAi = useCallback(() => {
    setIsEffectivelyEnabled(false);
  }, []);

  const value = { isAiEnabled: isEffectivelyEnabled, disableAi };

  return (
    <AiContext.Provider value={value}>
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
