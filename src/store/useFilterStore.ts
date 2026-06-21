import { create } from 'zustand';
import { CustomRuleGroup, CustomRule, FilterRange, SavedPreset, FilterField, RuleOperator } from '../types';

interface FilterState {
  searchQuery: string;
  priceRange: FilterRange;
  peRange: FilterRange;
  marketCapRange: FilterRange;
  volumeRange: FilterRange;
  selectedSectors: string[];
  marketCapCategory: 'All' | 'Mega' | 'Large' | 'Mid' | 'Small';
  
  // Custom Rule Builder
  customRules: CustomRuleGroup;
  
  // Presets
  savedPresets: SavedPreset[];
  activePresetId: string | null;

  // Setters
  setSearchQuery: (query: string) => void;
  setPriceRange: (range: Partial<FilterRange>) => void;
  setPeRange: (range: Partial<FilterRange>) => void;
  setMarketCapRange: (range: Partial<FilterRange>) => void;
  setVolumeRange: (range: Partial<FilterRange>) => void;
  setSelectedSectors: (sectors: string[] | ((prev: string[]) => string[])) => void;
  setMarketCapCategory: (category: 'All' | 'Mega' | 'Large' | 'Mid' | 'Small') => void;

  // Tree rule operations
  addRule: (parentId: string) => void;
  addGroup: (parentId: string) => void;
  removeNode: (id: string) => void;
  updateRule: (id: string, field: FilterField, operator: RuleOperator, value: any) => void;
  updateGroupCondition: (id: string, condition: 'AND' | 'OR') => void;
  
  // Preset operations
  savePreset: (name: string, description: string) => void;
  deletePreset: (id: string) => void;
  applyPreset: (presetId: string) => void;
  resetFilters: () => void;
}

// Initial ranges bounds
const DEFAULT_PRICE_RANGE = { min: 0, max: 5000 };
const DEFAULT_PE_RANGE = { min: 0, max: 120 };
const DEFAULT_MCAP_RANGE = { min: 0, max: 3e12 };
const DEFAULT_VOLUME_RANGE = { min: 0, max: 1e8 };

const createEmptyGroup = (id: string, condition: 'AND' | 'OR' = 'AND'): CustomRuleGroup => ({
  id,
  type: 'group',
  condition,
  children: []
});

const defaultPresets: SavedPreset[] = [
  {
    id: 'preset-high-growth',
    name: 'High Growth Tech',
    description: 'Tech sector with P/E ratios in typical high growth ranges and high market cap.',
    ranges: {
      price: { min: 20, max: 3000 },
      peRatio: { min: 30, max: 90 },
      marketCap: { min: 5e9, max: 3e12 },
      volume: { min: 100000, max: 1e8 }
    },
    sectors: ['Technology'],
    customRules: null
  },
  {
    id: 'preset-value',
    name: 'Value Stocks',
    description: 'Stocks with reasonable earnings multiple (P/E < 18), solid EPS, and healthy market cap.',
    ranges: {
      price: { min: 5, max: 1000 },
      peRatio: { min: 1, max: 18 },
      marketCap: { min: 1e9, max: 3e12 },
      volume: { min: 50000, max: 1e8 }
    },
    sectors: [],
    customRules: {
      id: 'root-preset-value',
      type: 'group',
      condition: 'AND',
      children: [
        {
          id: 'rule-eps-val',
          type: 'rule',
          field: 'eps',
          operator: 'gt',
          value: 1.5
        }
      ]
    }
  },
  {
    id: 'preset-mega-leaders',
    name: 'Mega Cap Leaders',
    description: 'Market titans exceeding $200B valuation across all sectors.',
    ranges: {
      price: { min: 10, max: 5000 },
      peRatio: { min: 0, max: 120 },
      marketCap: { min: 200e9, max: 3e12 },
      volume: { min: 500000, max: 1e8 }
    },
    sectors: [],
    customRules: null
  },
  {
    id: 'preset-smallcap-gems',
    name: 'Small Cap Contenders',
    description: 'Fast-growing companies below $2B market valuation with high EPS growth.',
    ranges: {
      price: { min: 1, max: 200 },
      peRatio: { min: 5, max: 35 },
      marketCap: { min: 1e7, max: 2e9 },
      volume: { min: 10000, max: 5e7 }
    },
    sectors: [],
    customRules: {
      id: 'root-preset-small',
      type: 'group',
      condition: 'AND',
      children: [
        {
          id: 'rule-eps-small',
          type: 'rule',
          field: 'eps',
          operator: 'gt',
          value: 0.5
        }
      ]
    }
  }
];

// Helper functions for recursively modifying the rules tree
function addNodeToTree(group: CustomRuleGroup, parentId: string, node: CustomRule | CustomRuleGroup): boolean {
  if (group.id === parentId) {
    group.children.push(node);
    return true;
  }
  for (let i = 0; i < group.children.length; i++) {
    const child = group.children[i];
    if (child.type === 'group') {
      const added = addNodeToTree(child, parentId, node);
      if (added) return true;
    }
  }
  return false;
}

function removeNodeFromTree(group: CustomRuleGroup, id: string): boolean {
  const index = group.children.findIndex((child) => child.id === id);
  if (index !== -1) {
    group.children.splice(index, 1);
    return true;
  }
  for (let i = 0; i < group.children.length; i++) {
    const child = group.children[i];
    if (child.type === 'group') {
      const removed = removeNodeFromTree(child, id);
      if (removed) return true;
    }
  }
  return false;
}

function updateRuleInTree(
  group: CustomRuleGroup,
  id: string,
  field: FilterField,
  operator: RuleOperator,
  value: any
): boolean {
  for (let i = 0; i < group.children.length; i++) {
    const child = group.children[i];
    if (child.type === 'rule' && child.id === id) {
      child.field = field;
      child.operator = operator;
      child.value = value;
      return true;
    } else if (child.type === 'group') {
      const updated = updateRuleInTree(child, id, field, operator, value);
      if (updated) return true;
    }
  }
  return false;
}

function updateConditionInTree(group: CustomRuleGroup, id: string, condition: 'AND' | 'OR'): boolean {
  if (group.id === id) {
    group.condition = condition;
    return true;
  }
  for (let i = 0; i < group.children.length; i++) {
    const child = group.children[i];
    if (child.type === 'group') {
      if (child.id === id) {
        child.condition = condition;
        return true;
      }
      const updated = updateConditionInTree(child, id, condition);
      if (updated) return true;
    }
  }
  return false;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  searchQuery: '',
  priceRange: { ...DEFAULT_PRICE_RANGE },
  peRange: { ...DEFAULT_PE_RANGE },
  marketCapRange: { ...DEFAULT_MCAP_RANGE },
  volumeRange: { ...DEFAULT_VOLUME_RANGE },
  selectedSectors: [],
  marketCapCategory: 'All',
  customRules: createEmptyGroup('root'),
  savedPresets: defaultPresets,
  activePresetId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriceRange: (range) => set((state) => ({ priceRange: { ...state.priceRange, ...range } })),
  setPeRange: (range) => set((state) => ({ peRange: { ...state.peRange, ...range } })),
  setMarketCapRange: (range) => set((state) => ({ marketCapRange: { ...state.marketCapRange, ...range } })),
  setVolumeRange: (range) => set((state) => ({ volumeRange: { ...state.volumeRange, ...range } })),
  setSelectedSectors: (sectors) =>
    set((state) => ({
      selectedSectors: typeof sectors === 'function' ? sectors(state.selectedSectors) : sectors,
    })),
  setMarketCapCategory: (category) => set({ marketCapCategory: category }),

  // Custom Rules Operations
  addRule: (parentId) =>
    set((state) => {
      const treeCopy = JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup;
      const newRule: CustomRule = {
        id: `rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'rule',
        field: 'price',
        operator: 'gt',
        value: 100,
      };
      addNodeToTree(treeCopy, parentId, newRule);
      return { customRules: treeCopy };
    }),

  addGroup: (parentId) =>
    set((state) => {
      const treeCopy = JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup;
      const newGroup = createEmptyGroup(`group_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
      addNodeToTree(treeCopy, parentId, newGroup);
      return { customRules: treeCopy };
    }),

  removeNode: (id) =>
    set((state) => {
      const treeCopy = JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup;
      removeNodeFromTree(treeCopy, id);
      return { customRules: treeCopy };
    }),

  updateRule: (id, field, operator, value) =>
    set((state) => {
      const treeCopy = JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup;
      updateRuleInTree(treeCopy, id, field, operator, value);
      return { customRules: treeCopy };
    }),

  updateGroupCondition: (id, condition) =>
    set((state) => {
      const treeCopy = JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup;
      updateConditionInTree(treeCopy, id, condition);
      return { customRules: treeCopy };
    }),

  // Presets operations
  savePreset: (name, description) =>
    set((state) => {
      const newPreset: SavedPreset = {
        id: `preset_${Date.now()}`,
        name,
        description,
        ranges: {
          price: { ...state.priceRange },
          peRatio: { ...state.peRange },
          marketCap: { ...state.marketCapRange },
          volume: { ...state.volumeRange },
        },
        sectors: [...state.selectedSectors],
        customRules: JSON.parse(JSON.stringify(state.customRules)) as CustomRuleGroup,
      };
      return {
        savedPresets: [...state.savedPresets, newPreset],
        activePresetId: newPreset.id,
      };
    }),

  deletePreset: (id) =>
    set((state) => ({
      savedPresets: state.savedPresets.filter((p) => p.id !== id),
      activePresetId: state.activePresetId === id ? null : state.activePresetId,
    })),

  applyPreset: (presetId) =>
    set((state) => {
      const preset = state.savedPresets.find((p) => p.id === presetId);
      if (!preset) return {};
      return {
        priceRange: { ...preset.ranges.price },
        peRange: { ...preset.ranges.peRatio },
        marketCapRange: { ...preset.ranges.marketCap },
        volumeRange: { ...preset.ranges.volume },
        selectedSectors: [...preset.sectors],
        customRules: preset.customRules
          ? JSON.parse(JSON.stringify(preset.customRules))
          : createEmptyGroup('root'),
        activePresetId: presetId,
      };
    }),

  resetFilters: () =>
    set({
      searchQuery: '',
      priceRange: { ...DEFAULT_PRICE_RANGE },
      peRange: { ...DEFAULT_PE_RANGE },
      marketCapRange: { ...DEFAULT_MCAP_RANGE },
      volumeRange: { ...DEFAULT_VOLUME_RANGE },
      selectedSectors: [],
      marketCapCategory: 'All',
      customRules: createEmptyGroup('root'),
      activePresetId: null,
    }),
}));
