'use client';

import React from 'react';
import { MobileProvider } from '../../../context/MobileContext';
import MobileDrawer from '../../../components/mobile/MobileDrawer';
import MobileNav from '../../../components/mobile/MobileNav';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileProvider>
      <div className="h-screen w-screen flex flex-col bg-[#050816] text-[#f3f4f6] overflow-hidden">
        <MobileNav />
        <MobileDrawer />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </MobileProvider>
  );
}
