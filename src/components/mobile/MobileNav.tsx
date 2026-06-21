import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useMobile } from '../../../context/MobileContext';

export default function MobileNav() {
  const { openDrawer } = useMobile();
  return (
    <header className="flex items-center justify-between p-3 bg-[#050816] text-[#f3f4f6] min-touch">
      <div className="flex items-center space-x-2">
        <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
        <span className="text-lg font-bold">Zetheta</span>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={openDrawer} className="p-2 min-touch">
          <Menu className="w-5 h-5" />
        </button>
        <button className="p-2 min-touch">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 min-touch">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
