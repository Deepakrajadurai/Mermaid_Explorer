
import React from 'react';
import { Plus, Info } from 'lucide-react';
import { DiagramTool } from '../types';

interface QuickToolsProps {
  tools: DiagramTool[];
  onAdd: (snippet: string) => void;
}

const QuickTools: React.FC<QuickToolsProps> = ({ tools, onAdd }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
          <Plus size={16} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Quick Build Tools</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, idx) => (
          <button
            key={idx}
            onClick={() => onAdd(tool.snippet)}
            className="group relative flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 rounded-lg text-xs font-semibold text-slate-700 transition-all duration-200"
          >
            {tool.label}
            
            {tool.description && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-xl z-50 pointer-events-none">
                <div className="flex items-start gap-1.5">
                  <Info size={12} className="mt-0.5 text-indigo-400 shrink-0" />
                  {tool.description}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTools;
