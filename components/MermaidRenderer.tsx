
// Fix: Corrected corrupted import statement and added useState to imports
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Download, FileImage, FileCode, Check, Loader2, AlertCircle } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
}

// Global initialization for Mermaid 10
// IMPORTANT: htmlLabels is false because browsers (Chrome/Safari) treat canvas as tainted 
// if an SVG with <foreignObject> is drawn to it, even if the content is safe.
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Arial, sans-serif',
  flowchart: {
    htmlLabels: false, 
    useMaxWidth: true,
    curve: 'linear' 
  },
  gantt: {
    useMaxWidth: true,
  },
  sequence: {
    useMaxWidth: true,
    showSequenceNumbers: false,
  },
  class: {
    useMaxWidth: true,
  },
  suppressErrorHelp: false,
});

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const renderId = useRef(0);

  useEffect(() => {
    const currentRenderId = ++renderId.current;
    let isMounted = true;

    const renderDiagram = async () => {
      if (!containerRef.current || !isMounted) return;
      
      try {
        setError(null);
        const cleanCode = code.trim();
        if (!cleanCode) return;

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        try {
          await mermaid.parse(cleanCode);
        } catch (parseErr: any) {
          if (currentRenderId === renderId.current) {
            setError(parseErr.message || 'Syntax Error');
          }
          return;
        }

        const id = `mermaid-${currentRenderId}-${Math.random().toString(36).substring(2, 7)}`;
        const { svg } = await mermaid.render(id, cleanCode);
        
        if (currentRenderId === renderId.current && containerRef.current && isMounted) {
          containerRef.current.innerHTML = svg;
          
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.maxWidth = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.display = 'block';
            svgElement.removeAttribute('height');
          }
        }
      } catch (err: any) {
        console.error('Mermaid execution error:', err);
        if (currentRenderId === renderId.current && isMounted) {
          const msg = err.message || String(err);
          if (msg.includes('suitable point')) {
            setError('Layout error: The diagram is too complex for the current curve settings. Try simplifying connections.');
          } else {
            setError(msg);
          }
        }
      }
    };

    const timer = setTimeout(renderDiagram, 50);
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [code]);

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Surgical sanitization to prevent Tainted Canvas while preserving visual accuracy.
   */
  const sanitizeSvgForCanvas = (svgElement: SVGSVGElement): { svgString: string, width: number, height: number } => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Ensure xmlns is present for cross-browser parsing
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    // Determine dimensions - getBBox provides content bounds, clientHeight provides scaled bounds
    const bbox = svgElement.getBBox();
    const rect = svgElement.getBoundingClientRect();
    
    // Use the larger of the two to ensure no clipping
    const width = Math.max(bbox.width, rect.width, 100);
    const height = Math.max(bbox.height, rect.height, 100);

    // Set explicit size attributes - required for rasterization engines
    clone.setAttribute('width', width.toString());
    clone.setAttribute('height', height.toString());
    clone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

    // 1. Scrub style tags - Remove ONLY tainting references (external URLs)
    const styles = clone.querySelectorAll('style');
    styles.forEach(style => {
      let cssText = style.textContent || '';
      
      // Remove @import and @font-face entirely
      cssText = cssText.replace(/@import\s+url\([^)]+\);?/gi, '');
      cssText = cssText.replace(/@font-face\s*\{[\s\S]*?\}/gi, '');
      
      // Clean up url() links that are not local anchors or data-URIs
      cssText = cssText.replace(/url\((?!['"]?(data:|#))[^)]+\)/gi, 'none');
      
      // Override fonts to safe system ones to prevent tainting if the CSS refers to 'Inter' or other web fonts
      cssText += `\n* { font-family: Arial, sans-serif !important; }`;
      
      style.textContent = cssText;
    });

    // 2. Remove all foreignObjects - They cause mandatory tainting in many environments
    const foreignObjects = clone.querySelectorAll('foreignObject');
    foreignObjects.forEach(fo => fo.remove());

    // 3. Clean up element attributes and inline styles
    const all = clone.querySelectorAll('*');
    all.forEach((el: any) => {
      // Force all text to use safe font and visible color if not specified
      if (el.tagName.toLowerCase() === 'text') {
        el.style.fontFamily = 'Arial, sans-serif';
        if (!el.getAttribute('fill') && !el.style.fill) {
          el.style.fill = '#333';
        }
      }

      // Check inline styles for tainting URLs
      if (el.style) {
        for (let i = 0; i < el.style.length; i++) {
          const prop = el.style[i];
          const val = el.style.getPropertyValue(prop);
          if (val && val.includes('url(') && !val.includes('data:') && !val.includes('#')) {
            el.style.setProperty(prop, 'none');
          }
        }
      }
      
      // Remove external hrefs
      ['href', 'xlink:href', 'src'].forEach(attr => {
        const val = el.getAttribute(attr);
        if (val && !val.startsWith('data:') && !val.startsWith('#')) {
          el.removeAttribute(attr);
        }
      });
    });

    return {
      svgString: new XMLSerializer().serializeToString(clone),
      width,
      height
    };
  };

  const handleExport = async (format: 'svg' | 'png' | 'jpeg') => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    setIsExporting(format);
    setError(null);
    
    try {
      const fileName = `mermaid-diagram-${Date.now()}`;

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        downloadFile(url, `${fileName}.svg`);
        URL.revokeObjectURL(url);
      } else {
        // PNG/JPEG Export
        const { svgString, width, height } = sanitizeSvgForCanvas(svgElement);
        
        const padding = 20; // Internal padding for exported image
        const scale = 2; // Export resolution scale
        
        const canvas = document.createElement('canvas');
        canvas.width = (width + padding * 2) * scale;
        canvas.height = (height + padding * 2) * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context.');

        const img = new Image();
        // Use Blob URL instead of Data URI for better large diagram support
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Rasterization failed. The diagram might be too complex or contain illegal characters for this browser.'));
          };
          img.src = url;
        });

        // Background - Force white for all formats to ensure consistent viewing
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image
        ctx.drawImage(
          img, 
          padding * scale, 
          padding * scale, 
          width * scale, 
          height * scale
        );

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        
        try {
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          
          // Validate the result
          if (dataUrl === 'data:,' || dataUrl.length < 1000) {
            throw new Error('Export returned an empty image. This often happens with extremely large diagrams or if browser security prevents reading the canvas.');
          }
          
          downloadFile(dataUrl, `${fileName}.${format}`);
        } catch (innerErr: any) {
          throw new Error(`Security Block: ${innerErr.message}. This specific diagram layout or content triggered a browser security restriction. Use SVG export instead.`);
        }
        
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.message || 'Export failed. Try SVG format instead.');
    } finally {
      setTimeout(() => setIsExporting(null), 1000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] overflow-hidden relative group">
        {error ? (
          <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 text-rose-700 font-bold mb-3">
                <div className="p-1 bg-rose-200 rounded-full">
                  <AlertCircle size={16} />
                </div>
                Export Limit
              </div>
              <div className="text-rose-600/80 text-xs code-font bg-white/50 p-3 rounded-lg border border-rose-100 overflow-auto max-h-40 leading-relaxed">
                {error}
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setError(null)}
                  className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-700 rounded-md text-[10px] font-bold transition-colors"
                >
                  DISMISS
                </button>
                <button 
                  onClick={() => handleExport('svg')}
                  className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md text-[10px] font-bold transition-colors"
                >
                  SVG (MOST RELIABLE)
                </button>
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

      {!error && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 mr-2">
            <Download size={14} />
            Export As
          </div>
          
          <button
            onClick={() => handleExport('png')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting === 'png' ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
            PNG
          </button>
          
          <button
            onClick={() => handleExport('jpeg')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting === 'jpeg' ? <Loader2 size={14} className="animate-spin" /> : <FileImage size={14} />}
            JPEG
          </button>
          
          <button
            onClick={() => handleExport('svg')}
            disabled={!!isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting === 'svg' ? <Loader2 size={14} className="animate-spin" /> : <FileCode size={14} />}
            SVG
          </button>

          {isExporting && (
            <span className="ml-auto text-[10px] font-bold text-indigo-500 animate-pulse flex items-center gap-1.5 mr-2">
              <Loader2 size={10} className="animate-spin" />
              CONVERTING...
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MermaidRenderer;
