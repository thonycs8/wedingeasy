import { createContext, useContext, useState, ReactNode } from 'react';
import { Currency } from '@/i18n';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [currency, setCurrency] = useState<Currency>('EUR'); // Default to Euro for Portugal

  return (
    <SettingsContext.Provider value={{ currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};