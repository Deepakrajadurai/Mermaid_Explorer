
import React from 'react';
import * as Icons from 'lucide-react';
import { DIAGRAM_EXAMPLES } from '../constants';
import { DiagramType } from '../types';

interface SidebarProps {
  activeId: DiagramType;
  onSelect: (id: DiagramType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeId, onSelect }) => {
  return (
    <nav className="w-full lg:w-72 bg-white border-r border-slate-200 h-screen lg:fixed overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Icons.Waves size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mermaid Explorer</h1>
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Diagram Types</p>
          {DIAGRAM_EXAMPLES.map((item) => {
            // Robust way to get the icon component from the namespace
            const IconComponent = (Icons as any)[item.icon] || Icons.HelpCircle;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.title}
              </button>
            );
          })}
        </div>

        <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase">Did you know?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mermaid lets you create diagrams and visualizations using text and code. It is inspired by Markdown.
          </p>
          <a 
            href="https://mermaid.js.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Read Official Docs →
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
