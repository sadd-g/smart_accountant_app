import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isRTL: boolean;
  isDark: boolean;
  language: 'ar' | 'en';
  toggleDark: () => void;
}

const AppContext = createContext<AppContextType>({
  isRTL: true,
  isDark: true,
  language: 'ar',
  toggleDark: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [isRTL] = useState(true);
  const [language] = useState<'ar' | 'en'>('ar');

  const toggleDark = () => setIsDark(!isDark);

  return (
    <AppContext.Provider value={{ isRTL, isDark, language, toggleDark }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
