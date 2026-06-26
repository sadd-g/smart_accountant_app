import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext<any>({});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  return <AppContext.Provider value={{ isDark }}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
