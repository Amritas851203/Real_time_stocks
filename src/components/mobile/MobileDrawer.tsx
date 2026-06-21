import React from 'react';
import { X } from 'lucide-react';
import { useMobile } from '../../context/MobileContext';
import Link from 'next/link';

const menuItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Screener', href: '/' },
  { name: 'Technical', href: '/' },
  { name: 'Watchlist', href: '/' },
  { name: 'Market Overview', href: '/' },
  { name: 'Portfolio', href: '/' },
  { name: 'Alerts', href: '/' },
  { name: 'Settings', href: '/' },
];

export default function MobileDrawer() {
  const { isDrawerOpen, closeDrawer } = useMobile();
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />
      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#050816] text-[#f3f4f6] z-50 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1f2937]/30">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={closeDrawer} className="p-2 min-touch">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-2 flex flex-col space-y-1">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="px-4 py-2 hover:bg-[#0B1220] min-touch">
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
