
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
}

// Global initialization for Mermaid 10
// Using 'default' theme as the global base, but letting local init blocks override it
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter',
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
    // 'basis' often causes "Could not find a suitable point for the given distance"
    // 'linear' or 'cardinal' are more stable.
    curve: 'linear' 
  },
  // Ensure we don't suppress errors so we can debug them
  suppressErrorHelp: false,
});

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const renderId = useRef(0);

  useEffect(() => {
    const currentRenderId = ++renderId.current;
    let isMounted = true;

    const renderDiagram = async () => {
      if (!containerRef.current || !isMounted) return;
      
      try {
        setError(null);
        
        // Clean the code: remove trailing spaces and handle empty input
        const cleanCode = code.trim();
        if (!cleanCode) return;

        // Clear container for fresh start
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // 1. Verify syntax first
        try {
          await mermaid.parse(cleanCode);
        } catch (parseErr: any) {
          if (currentRenderId === renderId.current) {
            setError(parseErr.message || 'Syntax Error');
          }
          return;
        }

        // 2. Generate unique ID for this render session
        const id = `mermaid-${currentRenderId}-${Math.random().toString(36).substring(2, 7)}`;
        
        // 3. Render the SVG
        const { svg } = await mermaid.render(id, cleanCode);
        
        if (currentRenderId === renderId.current && containerRef.current && isMounted) {
          containerRef.current.innerHTML = svg;
          
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.display = 'block';
            svgElement.removeAttribute('height'); // Allow CSS to control height
          }
        }
      } catch (err: any) {
        console.error('Mermaid execution error:', err);
        if (currentRenderId === renderId.current && isMounted) {
          // Provide more descriptive error messages
          const msg = err.message || String(err);
          if (msg.includes('suitable point')) {
            setError('Layout error: The diagram is too complex for the current curve settings. Try simplifying connections.');
          } else {
            setError(msg);
          }
        }
      }
    };

    // Debounce slightly to allow UI transitions to finish
    const timer = setTimeout(renderDiagram, 50);
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [code]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] overflow-hidden relative">
      {error ? (
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-rose-700 font-bold mb-3">
              <div className="p-1 bg-rose-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              Rendering Failed
            </div>
            <div className="text-rose-600/80 text-xs code-font bg-white/50 p-3 rounded-lg border border-rose-100 overflow-auto max-h-40 leading-relaxed">
              {error}
            </div>
            <div className="mt-4 text-[10px] text-rose-400 font-medium">
              Tip: Check for missing brackets or incorrect indentation in the editor.
            </div>
          </div>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="mermaid-container w-full flex justify-center py-2 transition-opacity duration-300" 
        />
      )}
    </div>
  );
};

export default MermaidRenderer;
