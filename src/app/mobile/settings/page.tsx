'use client';

import React, { useState } from 'react';
import { useStockStore } from '../../../store/useStockStore';
import { useUiStore } from '../../../store/useUiStore';
import { User, Moon, Sun, Bell, Shield, HelpCircle, ChevronRight, Save, Lock } from 'lucide-react';

const SETTINGS = [
  { Icon: Bell,        label: 'Notifications',  sub: 'Alerts & updates' },
  { Icon: Shield,      label: 'Security',        sub: 'Privacy & security' },
  { Icon: HelpCircle,  label: 'Help & Support',  sub: 'FAQs & contact' },
];

export default function MobileSettingsPage() {
  const watchlist = useStockStore((s) => s.watchlist);
  const holdings = useStockStore((s) => s.holdings);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const showToast = useUiStore((s) => s.showToast);

  // Mock toggle states
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleSaveSettings = () => {
    showToast('Settings configuration saved successfully.', 'success');
  };

  return (
    <div className="flex flex-col bg-[#050816] min-h-full overflow-x-hidden pb-8">
      {/* Header Panel */}
      <div className="px-4 pt-4 pb-3 border-b border-[#1f2937]/20 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase leading-none">Settings</h1>
            <p className="text-[9px] text-gray-550 font-bold mt-1">Configure profile preferences & client themes</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* User Hero */}
        <div className="flex items-center gap-4 bg-[#0B1220]/30 border border-[#1f2937]/20 p-4 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <div>
            <p className="text-sm font-black text-white">Trader</p>
            <p className="text-[10px] text-gray-550">Plan: Free Institutional Alpha</p>
            <p className="text-[9px] text-gray-500 mt-0.5">Active positions: {holdings.length} · Bookmarks: {watchlist.length}</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="rounded-2xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-450" />}
            </div>
            <div>
              <p className="text-xs font-black text-white">Appearance</p>
              <p className="text-[9px] text-gray-500">{theme === 'dark' ? 'Dark theme' : 'Light theme'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              toggleTheme();
              showToast(`Theme changed to ${theme === 'dark' ? 'light' : 'dark'} mode`, 'info');
            }}
            className={`w-11 h-6 rounded-full transition-all duration-300 relative border border-transparent ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Toggle Switches list */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1f2937]/40 space-y-3.5">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center border-b border-[#1f2937]/20 pb-2">
            <Lock className="w-4 h-4 text-blue-400 mr-1" />
            <span>Preferences</span>
          </h3>

          <div className="space-y-4 text-xs font-bold">
            {/* Notify Alerts */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-300">Notification Alerts</p>
                <p className="text-[9px] text-gray-550 mt-0.5 font-medium">Trigger toast notifications on crosses</p>
              </div>
              <button
                onClick={() => setNotifyAlerts(!notifyAlerts)}
                className={`w-9 h-5 rounded-full transition-all duration-300 relative border border-transparent ${
                  notifyAlerts ? 'bg-blue-650 bg-blue-600' : 'bg-[#050816] border-gray-800'
                }`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${notifyAlerts ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Auto Refresh */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-300">Auto Refresh Feed</p>
                <p className="text-[9px] text-gray-550 mt-0.5 font-medium">Receive real-time WebSocket tick arrays</p>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-9 h-5 rounded-full transition-all duration-300 relative border border-transparent ${
                  autoRefresh ? 'bg-blue-650 bg-blue-600' : 'bg-[#050816] border-gray-800'
                }`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${autoRefresh ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Haptic Feedback */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-300">Haptic Feedback</p>
                <p className="text-[9px] text-gray-550 mt-0.5 font-medium">Vibrate device slightly on button taps</p>
              </div>
              <button
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className={`w-9 h-5 rounded-full transition-all duration-300 relative border border-transparent ${
                  hapticFeedback ? 'bg-blue-650 bg-blue-600' : 'bg-[#050816] border-gray-800'
                }`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${hapticFeedback ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Biometric Lock */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-300">Biometric Access</p>
                <p className="text-[9px] text-gray-550 mt-0.5 font-medium">Require FaceID/TouchID on start</p>
              </div>
              <button
                onClick={() => setBiometrics(!biometrics)}
                className={`w-9 h-5 rounded-full transition-all duration-300 relative border border-transparent ${
                  biometrics ? 'bg-blue-650 bg-blue-600' : 'bg-[#050816] border-gray-800'
                }`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${biometrics ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

        {/* General Settings List */}
        <div className="space-y-2">
          {SETTINGS.map(({ Icon, label, sub }) => (
            <div
              key={label}
              onClick={() => showToast(`Navigating to ${label} details...`, 'info')}
              className="rounded-2xl bg-[#0B1220]/50 border border-[#1f2937]/30 p-3.5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1f2937]/50 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">{label}</p>
                  <p className="text-[9px] text-gray-500">{sub}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          ))}
        </div>

        {/* Version */}
        <div className="pt-4 text-center">
          <p className="text-[10px] text-gray-650 font-bold uppercase tracking-wider">Zetheta Mobile App v1.0.0 (Alpha)</p>
        </div>
      </div>
    </div>
  );
}
