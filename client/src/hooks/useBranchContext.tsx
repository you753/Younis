import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BranchContextType {
  currentBranchId: number | null;
  setCurrentBranchId: (branchId: number | null) => void;
  isMainBranch: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

interface BranchProviderProps {
  children: ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(() => {
    // استرجاع الفرع المحفوظ من localStorage
    const saved = localStorage.getItem('currentBranchId');
    return saved && saved !== 'null' ? parseInt(saved) : null;
  });

  const isMainBranch = currentBranchId === null;

  // حفظ الفرع المختار في localStorage
  useEffect(() => {
    localStorage.setItem('currentBranchId', currentBranchId?.toString() || 'null');
  }, [currentBranchId]);

  return (
    <BranchContext.Provider value={{
      currentBranchId,
      setCurrentBranchId,
      isMainBranch
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranchContext() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranchContext must be used within a BranchProvider');
  }
  return context;
}