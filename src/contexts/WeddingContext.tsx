import { createContext, useContext, useState, ReactNode } from 'react';

interface WeddingData {
  couple: {
    name: string;
    email: string;
    partnerName: string;
  };
  wedding: {
    date: string;
    guestCount: number;
    style: 'intimate' | 'classic' | 'luxury';
    region: 'lisboa' | 'porto' | 'center' | 'south' | 'islands';
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    priorities: string[];
    estimatedBudget: number;
  };
  isSetupComplete: boolean;
}

interface WeddingContextType {
  weddingData: WeddingData | null;
  setWeddingData: (data: WeddingData) => void;
  clearWeddingData: () => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const useWeddingData = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWeddingData must be used within a WeddingProvider');
  }
  return context;
};

interface WeddingProviderProps {
  children: ReactNode;
}

export const WeddingProvider = ({ children }: WeddingProviderProps) => {
  const [weddingData, setWeddingDataState] = useState<WeddingData | null>(() => {
    // Try to load from localStorage on initialization
    const stored = localStorage.getItem('weddingData');
    return stored ? JSON.parse(stored) : null;
  });

  const setWeddingData = (data: WeddingData) => {
    setWeddingDataState(data);
    localStorage.setItem('weddingData', JSON.stringify(data));
  };

  const clearWeddingData = () => {
    setWeddingDataState(null);
    localStorage.removeItem('weddingData');
  };

  return (
    <WeddingContext.Provider value={{ weddingData, setWeddingData, clearWeddingData }}>
      {children}
    </WeddingContext.Provider>
  );
};