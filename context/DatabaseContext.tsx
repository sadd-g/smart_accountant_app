import React, { createContext, useContext, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const DatabaseContext = createContext<any>({ db: null, loading: true });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  return (
    <DatabaseContext.Provider value={{ db: 'local', loading }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() { return useContext(DatabaseContext); }
