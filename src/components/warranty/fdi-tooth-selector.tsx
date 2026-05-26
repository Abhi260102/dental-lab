import React, { useMemo } from "react";

interface FdiToothSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const Q1 = [18, 17, 16, 15, 14, 13, 12, 11];
const Q2 = [21, 22, 23, 24, 25, 26, 27, 28];
const Q4 = [48, 47, 46, 45, 44, 43, 42, 41];
const Q3 = [31, 32, 33, 34, 35, 36, 37, 38];

const getToothDescription = (num: number): string => {
  const q = Math.floor(num / 10);
  const pos = num % 10;

  const quadrants: Record<number, string> = {
    1: "Upper Right",
    2: "Upper Left",
    3: "Lower Left",
    4: "Lower Right",
  };

  const positions: Record<number, string> = {
    1: "Central Incisor",
    2: "Lateral Incisor",
    3: "Canine",
    4: "First Premolar",
    5: "Second Premolar",
    6: "First Molar",
    7: "Second Molar",
    8: "Third Molar",
  };

  return `${num}: ${quadrants[q]} ${positions[pos]}`;
};

export default function FdiToothSelector({ value, onChange, error }: FdiToothSelectorProps) {
  // Parse selected teeth from comma separated string
  const selectedTeeth = useMemo(() => {
    if (!value) return new Set<number>();
    return new Set<number>(
      value
        .split(",")
        .map((t) => parseInt(t.trim(), 10))
        .filter((t) => !isNaN(t))
    );
  }, [value]);

  const toggleTooth = (num: number) => {
    const updated = new Set(selectedTeeth);
    if (updated.has(num)) {
      updated.delete(num);
    } else {
      updated.add(num);
    }
    serializeAndChange(updated);
  };

  const serializeAndChange = (set: Set<number>) => {
    const sorted = Array.from(set).sort((a, b) => a - b);
    onChange(sorted.join(", "));
  };

  // Preset Handlers
  const handleSelectAll = () => {
    const all = new Set([...Q1, ...Q2, ...Q3, ...Q4]);
    serializeAndChange(all);
  };

  const handleSelectUpper = () => {
    const upper = new Set([...Q1, ...Q2]);
    serializeAndChange(upper);
  };

  const handleSelectLower = () => {
    const lower = new Set([...Q3, ...Q4]);
    serializeAndChange(lower);
  };

  const handleClearAll = () => {
    serializeAndChange(new Set());
  };

  const renderToothButton = (num: number) => {
    const isSelected = selectedTeeth.has(num);
    return (
      <div key={num} className="relative group">
        <button
          type="button"
          onClick={() => toggleTooth(num)}
          className={`w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 flex items-center justify-center ${
            isSelected
              ? "bg-gradient-to-br from-dent-blue-600 to-dent-blue-500 text-white border-dent-blue-600 shadow-sm shadow-dent-blue-600/20 active:scale-95"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:scale-95"
          }`}
        >
          {num}
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-950/90 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none border border-slate-800 backdrop-blur-sm transition-opacity duration-150">
          {getToothDescription(num)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-4 sm:p-5">
      {/* Label and Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/50 pb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Tooth Designation (FDI Notation)
        </label>
        
        {/* Presets Button Row */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-750 transition-colors"
          >
            All
          </button>
          <button
            type="button"
            onClick={handleSelectUpper}
            className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-750 transition-colors"
          >
            Upper Arch
          </button>
          <button
            type="button"
            onClick={handleSelectLower}
            className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-750 transition-colors"
          >
            Lower Arch
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] font-semibold px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:dark:bg-rose-950/50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 4-Quadrant Visual selector */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[480px] sm:min-w-[540px] flex flex-col items-center py-2">
          {/* Maxillary / Upper Row */}
          <div className="flex items-center gap-3">
            {/* Q1 Upper Right */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1.5 select-none w-10 text-right">
                UR (Q1)
              </span>
              <div className="flex gap-1">
                {Q1.map(renderToothButton)}
              </div>
            </div>

            {/* Midline vertical line */}
            <div className="w-[1.5px] h-10 bg-slate-300 dark:bg-slate-700 shrink-0 self-stretch my-0.5" />

            {/* Q2 Upper Left */}
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {Q2.map(renderToothButton)}
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1.5 select-none w-10 text-left">
                UL (Q2)
              </span>
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div className="w-[82%] h-[1.5px] bg-slate-300 dark:bg-slate-700 my-2" />

          {/* Mandibular / Lower Row */}
          <div className="flex items-center gap-3">
            {/* Q4 Lower Right */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-1.5 select-none w-10 text-right">
                LR (Q4)
              </span>
              <div className="flex gap-1">
                {Q4.map(renderToothButton)}
              </div>
            </div>

            {/* Midline vertical line */}
            <div className="w-[1.5px] h-10 bg-slate-300 dark:bg-slate-700 shrink-0 self-stretch my-0.5" />

            {/* Q3 Lower Left */}
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                {Q3.map(renderToothButton)}
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1.5 select-none w-10 text-left">
                LL (Q3)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected list display */}
      <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Selected Teeth ({selectedTeeth.size})</span>
          {selectedTeeth.size > 0 && (
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
              {value}
            </span>
          )}
        </div>

        {selectedTeeth.size === 0 ? (
          <p className="text-xs italic text-slate-400 dark:text-slate-500">
            Click on teeth in the diagram above to select designations.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
            {Array.from(selectedTeeth)
              .sort((a, b) => a - b)
              .map((num) => (
                <span
                  key={num}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-dent-blue-50 dark:bg-dent-blue-950/30 text-dent-blue-600 dark:text-dent-blue-400 border border-dent-blue-100 dark:border-dent-blue-900/40 rounded px-2 py-0.5"
                >
                  {num}
                  <button
                    type="button"
                    onClick={() => toggleTooth(num)}
                    className="hover:text-rose-500 font-bold ml-0.5 text-[9px] focus:outline-none"
                    title="Deselect"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {error && <span className="text-xs text-rose-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}
