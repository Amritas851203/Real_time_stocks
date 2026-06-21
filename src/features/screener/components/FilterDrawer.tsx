'use client';

import React, { useState } from 'react';
import { useFilterStore } from '../../../store/useFilterStore';
import RuleBuilder from './RuleBuilder';
import { SlidersHorizontal, BookOpen, Star, Briefcase, Plus, FolderHeart } from 'lucide-react';

const SECTORS = [
  'Technology',
  'Financials',
  'Healthcare',
  'Energy',
  'Industrials',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Utilities',
  'Basic Materials',
  'Real Estate',
];

export default function FilterDrawer() {
  const {
    priceRange,
    setPriceRange,
    peRange,
    setPeRange,
    marketCapRange,
    setMarketCapRange,
    volumeRange,
    setVolumeRange,
    selectedSectors,
    setSelectedSectors,
    savedPresets,
    activePresetId,
    applyPreset,
    savePreset,
    resetFilters,
  } = useFilterStore();

  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    savePreset(presetName.trim(), presetDesc.trim());
    setPresetName('');
    setPresetDesc('');
    setShowSavePreset(false);
  };

  return (
    <div className="space-y-6 select-none text-xs">
      
      {/* 1. Presets Header Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-200 flex items-center space-x-1.5 border-b border-[#21262d] pb-2">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Filter Presets</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {savedPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`p-2.5 rounded-lg border text-left transition-all duration-200 hover:border-emerald-500/30 ${
                activePresetId === preset.id
                  ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/40 text-emerald-400 font-semibold'
                  : 'bg-[#161b22] border-[#30363d] text-gray-300 hover:bg-[#1f242c]'
              }`}
              title={preset.description}
            >
              <div className="font-bold text-[10px] mb-0.5 truncate">{preset.name}</div>
              <div className="text-[9px] text-gray-500 line-clamp-1">{preset.description}</div>
            </button>
          ))}
        </div>

        {/* Save Current Filter as Custom Preset */}
        {!showSavePreset ? (
          <button
            onClick={() => setShowSavePreset(true)}
            className="w-full inline-flex items-center justify-center p-2 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-emerald-500/30 text-gray-300 font-bold hover:text-white transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Save Current as Preset
          </button>
        ) : (
          <form
            onSubmit={handleSavePreset}
            className="p-3.5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3 animate-fade-in"
          >
            <h4 className="text-[10px] font-bold text-gray-300 flex items-center">
              <FolderHeart className="w-3 h-3 text-emerald-400 mr-1.5" />
              <span>Save Preset</span>
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name (e.g. Dividend Stars)..."
                required
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-[10px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
              <input
                type="text"
                value={presetDesc}
                onChange={(e) => setPresetDesc(e.target.value)}
                placeholder="Description / notes..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-[10px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSavePreset(false)}
                className="px-2 py-1 text-[10px] text-gray-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Numerical Ranges Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-200 flex items-center space-x-1.5 border-b border-[#21262d] pb-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Numeric Ranges</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Price Range */}
          <div className="space-y-1.5">
            <span className="font-bold text-gray-400 block">Price ($)</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ min: Math.max(0, Number(e.target.value)) })}
                placeholder="Min"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ max: Math.max(0, Number(e.target.value)) })}
                placeholder="Max"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* P/E Ratio Range */}
          <div className="space-y-1.5">
            <span className="font-bold text-gray-400 block">P/E Ratio</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={peRange.min}
                onChange={(e) => setPeRange({ min: Number(e.target.value) })}
                placeholder="Min"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                value={peRange.max}
                onChange={(e) => setPeRange({ max: Number(e.target.value) })}
                placeholder="Max"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Market Cap Range */}
          <div className="space-y-1.5">
            <span className="font-bold text-gray-400 block">Market Cap ($)</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={marketCapRange.min}
                onChange={(e) => setMarketCapRange({ min: Math.max(0, Number(e.target.value)) })}
                placeholder="Min"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                value={marketCapRange.max}
                onChange={(e) => setMarketCapRange({ max: Math.max(0, Number(e.target.value)) })}
                placeholder="Max"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Volume Range */}
          <div className="space-y-1.5">
            <span className="font-bold text-gray-400 block">Volume (Daily)</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={volumeRange.min}
                onChange={(e) => setVolumeRange({ min: Math.max(0, Number(e.target.value)) })}
                placeholder="Min"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
              <span className="text-gray-600">-</span>
              <input
                type="number"
                value={volumeRange.max}
                onChange={(e) => setVolumeRange({ max: Math.max(0, Number(e.target.value)) })}
                placeholder="Max"
                className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sectors Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-200 flex items-center space-x-1.5 border-b border-[#21262d] pb-2">
          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sectors Select</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((sector) => {
            const isSelected = selectedSectors.includes(sector);
            return (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border duration-200 hover:border-emerald-500/25 ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#161b22] text-gray-400 border-[#30363d] hover:text-white'
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Advanced Rule Builder Integration */}
      <RuleBuilder />

      {/* 5. Clear Filter Actions */}
      <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
        <span className="text-[10px] text-gray-500">Filters apply in real-time</span>
        <button
          onClick={resetFilters}
          className="text-rose-400 hover:text-rose-300 font-bold transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}
