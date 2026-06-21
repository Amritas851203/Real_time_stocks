import React, { createContext, useState, useContext, ReactNode } from 'react';

interface MobileContextProps {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const MobileContext = createContext<MobileContextProps | undefined>(undefined);

export const MobileProvider = ({ children }: { children: ReactNode }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  return (
    <MobileContext.Provider value={{ isDrawerOpen, openDrawer, closeDrawer }}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobile = () => {
  const ctx = useContext(MobileContext);
  if (!ctx) throw new Error('useMobile must be used within MobileProvider');
  return ctx;
};
