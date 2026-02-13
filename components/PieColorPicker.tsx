
import React from "react";
import { Palette, RefreshCw } from "lucide-react";

interface PieColorPickerProps {
  code: string;
  onChange: (newCode: string) => void;
}

const DEFAULT_PALETTE = [
  "#61DAFB",
  "#42B883",
  "#FF3E00",
  "#DD0031",
  "#888888",
];

const INIT_REGEX = /^%%{init:[\s\S]*?}%%\n?/;

const PieColorPicker: React.FC<PieColorPickerProps> = ({
  code,
  onChange,
}) => {
  /**
   * Extract existing colors from both themeVariables and pie palette configs
   */
  const colors = React.useMemo(() => {
    const match = code.match(/%%{init:\s*(\{[\s\S]*?\})}%%/);

    if (!match) return DEFAULT_PALETTE;

    try {
      const parsed = JSON.parse(match[1]);
      const themeVars = parsed?.themeVariables || {};
      const pieConfig = parsed?.pie || {};

      const extracted = [...DEFAULT_PALETTE];

      for (let i = 0; i < DEFAULT_PALETTE.length; i++) {
        // Try pieN (1-indexed) in themeVariables
        if (themeVars[`pie${i + 1}`]) {
          extracted[i] = themeVars[`pie${i + 1}`];
        } 
        // Try paletteN (0-indexed) in pie config
        else if (pieConfig[`palette${i}`]) {
          extracted[i] = pieConfig[`palette${i}`];
        }
      }

      return extracted;
    } catch {
      return DEFAULT_PALETTE;
    }
  }, [code]);

  /**
   * Update colors by creating a robust init block targeting multiple keys
   */
  const updateColor = (index: number, newColor: string) => {
    const updated = [...colors];
    updated[index] = newColor;

    const themeVariables: Record<string, string> = {
      // Force base theme for customization to take full effect
      'theme': 'base'
    };
    const piePalette: Record<string, string> = {};

    updated.forEach((color, i) => {
      themeVariables[`pie${i + 1}`] = color;
      piePalette[`palette${i}`] = color;
    });

    const config = {
      theme: "base",
      themeVariables,
      pie: piePalette
    };

    // Use a clean, compact JSON string for the init block
    const initBlock = `%%{init: ${JSON.stringify(config)}}%%`;

    let newCode: string;
    if (INIT_REGEX.test(code)) {
      newCode = code.replace(INIT_REGEX, initBlock + "\n");
    } else {
      newCode = initBlock + "\n" + code.trimStart();
    }

    onChange(newCode);
  };

  /**
   * Remove init block completely to return to default Mermaid styles
   */
  const resetPalette = () => {
    const cleaned = code.replace(INIT_REGEX, "").trimStart();
    onChange(cleaned);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-100 text-rose-600 rounded-md">
            <Palette size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Pie Palette Designer
          </h3>
        </div>

        <button
          onClick={resetPalette}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={10} />
          RESET COLORS
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {colors.map((color, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <div
              className="w-full h-8 rounded-lg shadow-inner border border-slate-200 relative overflow-hidden group cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(idx, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">
              {color}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-slate-400 leading-tight">
        Click a color box to customize. This dual-targets <code className="bg-slate-100 px-1 rounded text-indigo-600">themeVariables</code> and <code className="bg-slate-100 px-1 rounded text-indigo-600">pie.palette</code> to ensure custom colors render reliably.
      </p>
    </div>
  );
};

export default PieColorPicker;
