import React from 'react';
import MobileShell from './_components/MobileShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zetheta Mobile',
  description: 'Mobile-optimized trading dashboard',
};

export default function MobileRootLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
