'use client';

import React from 'react';
import { useFilterStore } from '../../../store/useFilterStore';
import { CustomRuleGroup, CustomRule, FilterField, RuleOperator } from '../../../types';
import { Plus, Trash2, GitBranch, Settings } from 'lucide-react';

const FILTER_FIELDS: { value: FilterField; label: string; type: 'number' | 'string' }[] = [
  { value: 'price', label: 'Price', type: 'number' },
  { value: 'peRatio', label: 'P/E Ratio', type: 'number' },
  { value: 'marketCap', label: 'Market Cap', type: 'number' },
  { value: 'volume', label: 'Volume', type: 'number' },
  { value: 'eps', label: 'EPS', type: 'number' },
  { value: 'changePercent', label: 'Change %', type: 'number' },
  { value: 'high52', label: '52W High', type: 'number' },
  { value: 'low52', label: '52W Low', type: 'number' },
  { value: 'sector', label: 'Sector', type: 'string' },
  { value: 'name', label: 'Company Name', type: 'string' },
];

const OPERATORS: { value: RuleOperator; label: string; applicableTo: ('number' | 'string')[] }[] = [
  { value: 'gt', label: 'Greater Than (>)', applicableTo: ['number'] },
  { value: 'lt', label: 'Less Than (<)', applicableTo: ['number'] },
  { value: 'eq', label: 'Equals (=)', applicableTo: ['number', 'string'] },
  { value: 'contains', label: 'Contains', applicableTo: ['string'] },
];

export default function RuleBuilder() {
  const { customRules } = useFilterStore();

  return (
    <div className="w-full bg-[#161b22]/30 border border-[#30363d] rounded-xl p-4 select-none">
      <div className="flex items-center justify-between mb-4 border-b border-[#21262d] pb-2">
        <h3 className="text-xs font-bold text-gray-200 flex items-center space-x-1.5">
          <Settings className="w-3.5 h-3.5 text-emerald-400" />
          <span>Advanced Query Builder</span>
        </h3>
        <span className="text-[10px] text-gray-500">Combine multiple nested filter logic blocks</span>
      </div>

      <RuleGroupNode node={customRules} parentId={null} depth={0} />
    </div>
  );
}

interface RuleGroupNodeProps {
  node: CustomRuleGroup;
  parentId: string | null;
  depth: number;
}

function RuleGroupNode({ node, parentId, depth }: RuleGroupNodeProps) {
  const { addRule, addGroup, removeNode, updateGroupCondition } = useFilterStore();

  const handleAddRule = () => addRule(node.id);
  const handleAddGroup = () => addGroup(node.id);
  const handleRemove = () => {
    if (parentId) removeNode(node.id);
  };

  const borderColors = [
    'border-emerald-500/30',
    'border-sky-500/30',
    'border-indigo-500/30',
    'border-purple-500/30',
  ];
  const activeBorder = borderColors[depth % borderColors.length];

  return (
    <div
      className={`border-l-2 ${activeBorder} pl-4 py-2 my-2 bg-[#0d1117]/40 rounded-r-lg border-y border-r border-[#21262d]/20 relative`}
    >
      {/* Group Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#161b22]/40 p-2 rounded-md border border-[#30363d]/30">
        <div className="flex items-center space-x-2">
          {/* Condition Select: AND / OR */}
          <select
            value={node.condition}
            onChange={(e) => updateGroupCondition(node.id, e.target.value as 'AND' | 'OR')}
            className="bg-[#0d1117] border border-[#30363d] rounded-md text-[10px] font-bold text-gray-200 px-2 py-1 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="AND">ALL (AND)</option>
            <option value="OR">ANY (OR)</option>
          </select>
          <span className="text-[10px] text-gray-500">conditions below must match</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleAddRule}
            className="inline-flex items-center px-2 py-1 rounded bg-[#0d1117] hover:bg-[#30363d] border border-[#30363d] text-[10px] text-gray-300 font-bold hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Rule
          </button>
          <button
            onClick={handleAddGroup}
            className="inline-flex items-center px-2 py-1 rounded bg-[#0d1117] hover:bg-[#30363d] border border-[#30363d] text-[10px] text-gray-300 font-bold hover:text-white transition-colors"
          >
            <GitBranch className="w-3 h-3 mr-1" />
            Add Group
          </button>
          {parentId && (
            <button
              onClick={handleRemove}
              className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors"
              title="Delete Group"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Children List */}
      <div className="space-y-2">
        {node.children.length === 0 ? (
          <div className="text-[10px] text-gray-600 italic py-2 pl-2">
            No rules in this block. Click &quot;Add Rule&quot; to begin.
          </div>
        ) : (
          node.children.map((child) => {
            if (child.type === 'group') {
              return (
                <RuleGroupNode
                  key={child.id}
                  node={child}
                  parentId={node.id}
                  depth={depth + 1}
                />
              );
            } else {
              return <RuleRowNode key={child.id} rule={child} parentId={node.id} />;
            }
          })
        )}
      </div>
    </div>
  );
}

interface RuleRowNodeProps {
  rule: CustomRule;
  parentId: string;
}

function RuleRowNode({ rule, parentId }: RuleRowNodeProps) {
  const { updateRule, removeNode } = useFilterStore();

  const handleFieldChange = (newField: FilterField) => {
    // Pick first valid operator for the new field type
    const fieldObj = FILTER_FIELDS.find((f) => f.value === newField);
    const validOp = OPERATORS.find((op) => op.applicableTo.includes(fieldObj?.type || 'number'))?.value || 'gt';
    updateRule(rule.id, newField, validOp, fieldObj?.type === 'number' ? 0 : '');
  };

  const handleOperatorChange = (newOp: RuleOperator) => {
    updateRule(rule.id, rule.field, newOp, rule.value);
  };

  const handleValueChange = (newVal: any) => {
    updateRule(rule.id, rule.field, rule.operator, newVal);
  };

  const handleRemove = () => {
    removeNode(rule.id);
  };

  const selectedFieldObj = FILTER_FIELDS.find((f) => f.value === rule.field);
  const applicableOperators = OPERATORS.filter((op) =>
    op.applicableTo.includes(selectedFieldObj?.type || 'number')
  );

  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5 px-2 bg-[#161b22]/20 border border-[#30363d]/30 hover:border-[#30363d]/75 rounded-md transition-all">
      {/* Field Dropdown */}
      <select
        value={rule.field}
        onChange={(e) => handleFieldChange(e.target.value as FilterField)}
        className="bg-[#0d1117] border border-[#30363d] rounded-md text-[10px] text-gray-300 font-semibold px-2 py-1 focus:outline-none focus:border-emerald-500/50"
      >
        {FILTER_FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      {/* Operator Dropdown */}
      <select
        value={rule.operator}
        onChange={(e) => handleOperatorChange(e.target.value as RuleOperator)}
        className="bg-[#0d1117] border border-[#30363d] rounded-md text-[10px] text-gray-300 px-2 py-1 focus:outline-none focus:border-emerald-500/50"
      >
        {applicableOperators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {/* Value Input */}
      {selectedFieldObj?.type === 'number' ? (
        <input
          type="number"
          value={rule.value as number}
          onChange={(e) => handleValueChange(Number(e.target.value))}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-[10px] text-gray-200 px-2 py-1 w-24 focus:outline-none focus:border-emerald-500/50"
          placeholder="0.00"
        />
      ) : (
        <input
          type="text"
          value={rule.value as string}
          onChange={(e) => handleValueChange(e.target.value)}
          className="bg-[#0d1117] border border-[#30363d] rounded-md text-[10px] text-gray-200 px-2 py-1 w-36 focus:outline-none focus:border-emerald-500/50"
          placeholder="Match value..."
        />
      )}

      {/* Trash Button */}
      <button
        onClick={handleRemove}
        className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors ml-auto shrink-0"
        title="Delete Rule"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
