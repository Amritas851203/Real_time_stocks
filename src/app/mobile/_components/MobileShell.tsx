'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MobileProvider } from '../../../context/MobileContext';
import MobileDrawer from '../../../components/mobile/MobileDrawer';
import MobileNav from '../../../components/mobile/MobileNav';
import BottomNav from '../../../components/mobile/BottomNav';

// Hide bottom nav on stock detail pages
const HIDE_BOTTOM_NAV_PATTERNS = ['/mobile/stock/'];

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBottomNav = !HIDE_BOTTOM_NAV_PATTERNS.some((p) => pathname.startsWith(p));

  return (
    <MobileProvider>
      <div className="h-screen w-screen flex flex-col bg-[#050816] text-[#f3f4f6] overflow-hidden">
        {/* Fixed sticky top nav */}
        <MobileNav />
        {/* Slide-out drawer overlay */}
        <MobileDrawer />
        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {children}
        </main>
        {/* Fixed bottom navigation */}
        {showBottomNav && <BottomNav />}
      </div>
    </MobileProvider>
  );
}
