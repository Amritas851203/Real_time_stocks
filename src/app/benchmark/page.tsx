'use client';

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import Ticker from '../../components/layout/Ticker';
import PerformanceTracker from '../../features/benchmark/components/PerformanceTracker';
import Toast from '../../components/ui/Toast';

export default function BenchmarkRoute() {
  return (
    <div className="flex h-screen w-screen flex-col bg-[#0b0e14] text-gray-200 overflow-hidden">
      {/* Top Scrolling Indices Ticker */}
      <Ticker />

      {/* Main Core View Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Action Top Bar + Workspace Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          
          <main className="flex-1 p-6 overflow-y-auto bg-[#0d1117]/20 scrollbar-thin">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
                <h1 className="text-sm font-bold text-gray-100 uppercase tracking-wider">
                  Direct Benchmark Access
                </h1>
                <span className="text-[10px] text-gray-500">Live profiling of client-side operations</span>
              </div>
              <PerformanceTracker />
            </div>
          </main>
        </div>
      </div>
      
      {/* Toast Alert Drawer */}
      <Toast />
    </div>
  );
}
