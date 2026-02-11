// context/DataContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CsvRow } from '@/components/tables/RadiaplanTable';

interface DataContextType {
  radiaPlanData: CsvRow[];
  setRadiaPlanData: (data: CsvRow[]) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [radiaPlanData, setRadiaPlanData] = useState<CsvRow[]>([]);

  const clearData = () => {
    setRadiaPlanData([]);
  };

  return (
    <DataContext.Provider value={{ radiaPlanData, setRadiaPlanData, clearData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};