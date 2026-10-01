import type { ElementData, TrendProperty } from '../../types/element';
import { CATEGORY_COLORS, BLOCK_COLORS } from '../../data/elementsData';
import { getTrendColor, getNormalizedTrendValue, getPhaseAtTemperature } from '../../utils/trends';
import { Radiation } from 'lucide-react';

export type TableDisplayMode = 'category' | 'block' | 'phase' | 'heatmap';

interface ElementCardProps {
  element: ElementData;
  displayMode: TableDisplayMode;
  activeTrend: TrendProperty;
  allElements: ElementData[];
  temperatureK: number;
  isFilteredOut: boolean;
  isSelected: boolean;
  isInComparison: boolean;
  onSelect: (element: ElementData) => void;
  onToggleCompare?: (element: ElementData) => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  element,
  displayMode,
  activeTrend,
  allElements,
  temperatureK,
  isFilteredOut,
  isSelected,
  isInComparison,
  onSelect,
}) => {
  // Determine styling based on display mode
  let cellStyle: React.CSSProperties = {};
  let borderClasses = 'border-slate-800';
  let bgClasses = 'bg-slate-900/60';
  let textCategoryClass = 'text-slate-200';
  let glowColor = 'rgba(59, 130, 246, 0.2)';
  let extraLabel = element.atomicMass.toFixed(2);

  const phaseAtTemp = getPhaseAtTemperature(element, temperatureK);

  if (displayMode === 'category') {
    const cat = CATEGORY_COLORS[element.category] || CATEGORY_COLORS['unknown'];
    bgClasses = cat.bg;
    borderClasses = cat.border;
    textCategoryClass = cat.text;
    glowColor = cat.glow;
    extraLabel = element.atomicMass.toFixed(2);
  } else if (displayMode === 'block') {
    const blk = BLOCK_COLORS[element.block];
    bgClasses = blk.bg;
    borderClasses = blk.border;
    textCategoryClass = blk.text;
    glowColor = blk.glow;
    extraLabel = `Bloque ${element.block.toUpperCase()}`;
  } else if (displayMode === 'phase') {
    if (phaseAtTemp === 'gas') {
      bgClasses = 'bg-purple-950/40';
      borderClasses = 'border-purple-500/50';
      textCategoryClass = 'text-purple-300';
      glowColor = 'rgba(168, 85, 247, 0.4)';
      extraLabel = 'Gas';
    } else if (phaseAtTemp === 'liquid') {
      bgClasses = 'bg-cyan-950/40';
      borderClasses = 'border-cyan-500/50';
      textCategoryClass = 'text-cyan-300';
      glowColor = 'rgba(6, 182, 212, 0.4)';
      extraLabel = 'Líquido';
    } else if (phaseAtTemp === 'solid') {
      bgClasses = 'bg-slate-900/80';
      borderClasses = 'border-slate-600/50';
      textCategoryClass = 'text-slate-300';
      glowColor = 'rgba(148, 163, 184, 0.3)';
      extraLabel = 'Sólido';
    } else {
      bgClasses = 'bg-zinc-950/50';
      borderClasses = 'border-zinc-700/40';
      textCategoryClass = 'text-zinc-400';
      glowColor = 'rgba(113, 113, 122, 0.2)';
      extraLabel = 'Sintético';
    }
  } else if (displayMode === 'heatmap') {
    const norm = getNormalizedTrendValue(element, activeTrend, allElements);
    const tc = getTrendColor(norm);
    cellStyle = {
      backgroundColor: tc.bg,
      borderColor: tc.border,
    };
    glowColor = tc.glow;
    textCategoryClass = 'text-white';

    const val = element[activeTrend];
    if (val === null || val === undefined) {
      extraLabel = 'N/D';
    } else if (typeof val === 'number') {
      if (activeTrend === 'electronegativity') extraLabel = val.toFixed(2);
      else if (activeTrend === 'atomicRadius') extraLabel = `${val} pm`;
      else if (activeTrend === 'ionizationEnergy') extraLabel = `${val.toFixed(1)} eV`;
      else if (activeTrend === 'electronAffinity') extraLabel = `${val.toFixed(2)} eV`;
      else if (activeTrend === 'density') extraLabel = val < 0.01 ? `${(val * 1000).toFixed(1)} mg` : `${val.toFixed(2)} g`;
      else if (activeTrend === 'meltingPoint' || activeTrend === 'boilingPoint') extraLabel = `${Math.round(val)} K`;
      else extraLabel = val.toFixed(1);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(element)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(element);
        }
      }}
      style={{
        ...cellStyle,
        ['--glow-color' as string]: glowColor,
      }}
      className={`
        element-cell relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg border cursor-pointer
        select-none transition-all duration-200 text-left aspect-[4/5] min-w-[50px] sm:min-w-[58px] lg:min-w-[64px]
        ${bgClasses} ${borderClasses}
        ${isFilteredOut ? 'opacity-20 grayscale pointer-events-none scale-95' : 'opacity-100 hover:shadow-lg'}
        ${isSelected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-105 z-20' : ''}
        ${isInComparison ? 'ring-2 ring-amber-400' : ''}
      `}
      title={`${element.name} (${element.symbol}) - Z: ${element.atomicNumber}`}
    >
      {/* Top row: Atomic Number and radioactive badge */}
      <div className="flex items-center justify-between leading-none w-full">
        <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
          {element.atomicNumber}
        </span>
        {element.radioactive && (
          <Radiation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 animate-pulse shrink-0" />
        )}
      </div>

      {/* Middle: Symbol */}
      <div className="text-center my-auto">
        <span className={`text-base sm:text-lg lg:text-xl font-black tracking-tight leading-none block ${textCategoryClass}`}>
          {element.symbol}
        </span>
        <span className="text-[9px] sm:text-[10px] text-slate-300 font-medium truncate block max-w-full px-0.5 mt-0.5">
          {element.name}
        </span>
      </div>

      {/* Bottom: Mass or Trend Value */}
      <div className="text-center w-full leading-none">
        <span className="text-[8px] sm:text-[9.5px] font-mono text-slate-400 truncate block">
          {extraLabel}
        </span>
      </div>

      {/* Comparison badge if active */}
      {isInComparison && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 text-slate-950 font-bold rounded-full text-[9px] flex items-center justify-center shadow">
          ✓
        </span>
      )}
    </div>
  );
};
