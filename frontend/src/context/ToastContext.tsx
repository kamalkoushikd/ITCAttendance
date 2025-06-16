import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface ToastContextType { }

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ToastContext.Provider value={{}}>
      {children}
    </ToastContext.Provider>
  );
};
