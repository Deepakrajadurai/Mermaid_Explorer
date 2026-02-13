
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MermaidRenderer from './components/MermaidRenderer';
import CodeEditor from './components/CodeEditor';
import QuickTools from './components/QuickTools';
import PieColorPicker from './components/PieColorPicker';
import { DIAGRAM_EXAMPLES } from './constants';
import { DiagramType } from './types';
import { Github, Sparkles, Wand2, RotateCcw, Play, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeId, setActiveId] = useState<DiagramType>('flowchart');
  
  // Track custom changes to diagrams locally during session
  const [customCodes, setCustomCodes] = useState<Record<string, string>>({});
  
  // Track what code is actually being rendered in the canvas
  const [renderedCodes, setRenderedCodes] = useState<Record<string, string>>({});

  const activeDiagram = useMemo(() => {
    return DIAGRAM_EXAMPLES.find(d => d.id === activeId)!;
  }, [activeId]);

  const currentCode = customCodes[activeId] || activeDiagram.code;
  const renderedCode = renderedCodes[activeId] || activeDiagram.code;
  
  const isDirty = currentCode !== renderedCode;

  // Auto-render when switching diagrams if no custom render exists
  useEffect(() => {
    if (!renderedCodes[activeId]) {
      setRenderedCodes(prev => ({
        ...prev,
        [activeId]: customCodes[activeId] || activeDiagram.code
      }));
    }
  }, [activeId]);

  const handleCodeChange = (newCode: string) => {
    setCustomCodes(prev => ({
      ...prev,
      [activeId]: newCode
    }));
  };

  const handleRun = () => {
    setRenderedCodes(prev => ({
      ...prev,
      [activeId]: currentCode
    }));
  };

  const handleAddSnippet = (snippet: string) => {
    handleCodeChange(currentCode + snippet);
  };

  const handleReset = () => {
    setCustomCodes(prev => {
      const updated = { ...prev };
      delete updated[activeId];
      return updated;
    });
    setRenderedCodes(prev => {
      const updated = { ...prev };
      delete updated[activeId];
      return updated;
    });
  };

  // Create a unique key for the renderer that changes whenever the code updates
  const rendererKey = useMemo(() => {
    return activeId + '-' + btoa(renderedCode).substring(0, 32) + '-' + renderedCode.length;
  }, [activeId, renderedCode]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      <Sidebar activeId={activeId} onSelect={setActiveId} />
      
      <main className="flex-1 lg:ml-72 min-h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">
                  <span className="hover:text-slate-600 cursor-pointer transition-colors">Workspace</span>
                  <span>/</span>
                  <span className="text-indigo-600 font-bold">{activeDiagram.title}</span>
                </nav>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                  {activeDiagram.title}
                  <div className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest">Editor</div>
                </h2>
                <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-2xl">
                  {activeDiagram.description}
                </p>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                  title="Restore default example"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <a 
                  href="https://github.com/mermaid-js/mermaid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <Github size={18} />
                  Source
                </a>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-16">
            {/* Left: Input & Tools */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Wand2 size={18} className="text-indigo-500" />
                  Customization Suite
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-widest">V1.3.0 - STABLE</div>
              </div>

              {/* Conditional Pie Color Picker */}
              {activeId === 'pie' && (
                <PieColorPicker code={currentCode} onChange={handleCodeChange} />
              )}

              {/* Quick Building UI */}
              <QuickTools tools={activeDiagram.tools} onAdd={handleAddSnippet} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Sparkles size={18} className="text-amber-500" />
                    Syntax Editor
                  </div>
                  {isDirty && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 animate-pulse">
                      <Zap size={10} />
                      UNSAVED CHANGES
                    </span>
                  )}
                </div>
                
                <CodeEditor code={currentCode} onChange={handleCodeChange} />
                
                <button 
                  onClick={handleRun}
                  className={`w-full group flex items-center justify-center gap-3 py-4 rounded-2xl text-lg font-black transition-all duration-300 shadow-xl active:scale-95 ${
                    isDirty 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 ring-4 ring-indigo-100' 
                    : 'bg-slate-100 text-slate-400 cursor-default'
                  }`}
                >
                  <Play size={24} className={isDirty ? 'animate-bounce' : ''} fill="currentColor" />
                  RUN DIAGRAM
                </button>
              </div>

              <div className="p-5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-10">
                   <Wand2 size={120} />
                </div>
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  Editor Note
                </h4>
                <p className="text-xs text-indigo-50 leading-relaxed relative z-10">
                  Visualizations update when you click <b>RUN DIAGRAM</b>. Use the Color Picker above for Pie Charts to safely apply custom hex colors like <b>#FF0000</b>.
                </p>
              </div>
            </div>

            {/* Right: Visualization */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isDirty ? 'Output Stale' : 'Real-time Canvas'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Render Engine: Mermaid 10</div>
              </div>
              
              <div className="sticky top-8 flex flex-col gap-6">
                <MermaidRenderer key={rendererKey} code={renderedCode} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Build State</div>
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {isDirty ? 'Pending Render' : 'Synchronized'}
                    </div>
                  </div>
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Model Density</div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {renderedCode.trim().split('\n').length} Blocks Rendered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Footer */}
          <footer className="mt-24">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-slate-200/50">
               <div className="max-w-4xl">
                <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">The power of Diagramming-as-Code</h3>
                <p className="text-lg text-slate-500 mb-12 leading-relaxed">
                  Join thousands of developers using Mermaid to create beautiful, versionable, and scalable documentation. Whether it's a simple flowchart or a complex state machine, Mermaid has you covered.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="group">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <Github size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Dev Workflow</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Embed diagrams directly in your README files or technical wikis without leaving your IDE.
                    </p>
                  </div>
                  <div className="group">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Consistency</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Stop worrying about pixel-perfect alignment. Let the engine handle layout and styling for you.
                    </p>
                  </div>
                  <div className="group">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                      <RotateCcw size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Maintainable</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Update your architecture diagrams in seconds by modifying text. No more lost source files.
                    </p>
                  </div>
                </div>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-12 px-4 border-t border-slate-200 mt-20">
               <p className="text-slate-400 text-xs font-medium">
                 &copy; {new Date().getFullYear()} Mermaid Explorer • Modern Web Engineering
               </p>
               <div className="flex items-center gap-6">
                 <a href="https://mermaid.js.org/" target="_blank" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Documentation</a>
                 <a href="#" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Community</a>
                 <a href="https://github.com/mermaid-js/mermaid" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Project Hub</a>
               </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
