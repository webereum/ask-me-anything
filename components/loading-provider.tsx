'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationShimmer } from '@/components/ui/loading-shimmer';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startNavigation: () => void;
  finishNavigation: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const startNavigation = () => {
    setIsNavigating(true);
  };

  const finishNavigation = () => {
    setIsNavigating(false);
  };

  // Handle route changes
  useEffect(() => {
    setIsNavigating(false);
    setIsLoading(false);
  }, [pathname]);

  // Auto-hide navigation loading after 3 seconds (fallback)
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        setLoading, 
        startNavigation, 
        finishNavigation 
      }}
    >
      {isNavigating && <NavigationShimmer />}
      {children}
    </LoadingContext.Provider>
  );
}