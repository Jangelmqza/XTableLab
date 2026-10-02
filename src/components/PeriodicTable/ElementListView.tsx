import React, { useState, useMemo } from 'react';
import type { ElementData, ElementCategory, ElementBlock, TrendProperty } from '../../types/element';
import type { TableDisplayMode } from './ElementCard';
import { CATEGORY_COLORS, BLOCK_COLORS, PHASE_NAMES } from '../../data/elementsData';
import { getPhaseAtTemperature, getTrendColor, getNormalizedTrendValue } from '../../utils/trends';
import { Radiation, ArrowUpDown, Scale, Eye } from 'lucide-react';

interface ElementListViewProps {
  elements: ElementData[];
  displayMode: TableDisplayMode;
  activeTrend: TrendProperty;
  temperatureK: number;
  selectedCategory: ElementCategory | 'all';
  selectedBlock: ElementBlock | 'all';
  searchQuery: string;
  onlyRadioactive: boolean;
  selectedElement: ElementData | null;
  comparisonList: ElementData[];
  onSelectElement: (element: ElementData) => void;
  onToggleCompare: (element: ElementData) => void;
}

type SortField = 'atomicNumber' | 'name' | 'atomicMass' | 'electronegativity';

export const ElementListView: React.FC<ElementListViewProps> = ({
  elements,
  displayMode,
  activeTrend,
  temperatureK,
  selectedCategory,
  selectedBlock,
  searchQuery,
  onlyRadioactive,
  selectedElement,
  comparisonList,
  onSelectElement,
  onToggleCompare,
}) => {
  const [sortBy, setSortBy] = useState<SortField>('atomicNumber');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter elements
  const filteredElements = useMemo(() => {
    return elements.filter((el) => {
      if (selectedCategory !== 'all' && el.category !== selectedCategory) return false;
      if (selectedBlock !== 'all' && el.block !== selectedBlock) return false;
      if (onlyRadioactive && !el.radioactive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = el.name.toLowerCase().includes(q);
        const matchNameEn = el.nameEn.toLowerCase().includes(q);
        const matchSymbol = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
        const matchNumber = el.atomicNumber.toString() === q;
        if (!matchName && !matchNameEn && !matchSymbol && !matchNumber) return false;
      }
      return true;
    });
  }, [elements, selectedCategory, selectedBlock, onlyRadioactive, searchQuery]);

  // Sort elements
  const sortedElements = useMemo(() => {
    return [...filteredElements].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'atomicNumber') {
        comparison = a.atomicNumber - b.atomicNumber;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'es');
      } else if (sortBy === 'atomicMass') {
        comparison = a.atomicMass - b.atomicMass;
      } else if (sortBy === 'electronegativity') {
        const valA = a.electronegativity ?? -1;
        const valB = b.electronegativity ?? -1;
        comparison = valA - valB;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredElements, sortBy, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sort controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-300">Ordenar por:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleSort('atomicNumber')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
              sortBy === 'atomicNumber'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Número Z {sortBy === 'atomicNumber' && (sortAsc ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortBy === 'name'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Nombre {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('atomicMass')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
              sortBy === 'atomicMass'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Masa {sortBy === 'atomicMass' && (sortAsc ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('electronegativity')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
              sortBy === 'electronegativity'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Electroneg. {sortBy === 'electronegativity' && (sortAsc ? '↑' : '↓')}
          </button>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          {sortedElements.length} elemento{sortedElements.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedElements.map((el) => {
          const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
          const isInComparison = comparisonList.some((c) => c.atomicNumber === el.atomicNumber);
          const cat = CATEGORY_COLORS[el.category] || CATEGORY_COLORS['unknown'];
          const block = BLOCK_COLORS[el.block];
          const phase = getPhaseAtTemperature(el, temperatureK);

          // Card header/badge style depending on mode
          let badgeColor = cat.bg;
          let badgeText = cat.text;
          let badgeLabel = cat.name;

          if (displayMode === 'block') {
            badgeColor = block.bg;
            badgeText = block.text;
            badgeLabel = block.name;
          } else if (displayMode === 'heatmap') {
            const norm = getNormalizedTrendValue(el, activeTrend, elements);
            const heatColor = getTrendColor(norm);
            badgeColor = 'bg-slate-800';
            badgeText = heatColor.text;
            badgeLabel = el[activeTrend] !== null && el[activeTrend] !== undefined
              ? `${el[activeTrend]}`
              : 'N/D';
          }

          return (
            <div
              key={el.atomicNumber}
              onClick={() => onSelectElement(el)}
              className={`group relative p-3 rounded-xl border bg-slate-900/90 hover:bg-slate-800/90 transition-all cursor-pointer shadow-md hover:shadow-sky-500/10 hover:border-sky-500/50 flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/40'
                  : 'border-slate-800'
              }`}
            >
              {/* Top row: Z, Symbol, Name & Compare btn */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-12 h-12 rounded-lg border flex flex-col items-center justify-center shrink-0 ${cat.bg} ${cat.border} shadow-inner`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {el.atomicNumber}
                    </span>
                    <span className={`text-xl font-black ${cat.text} leading-none`}>
                      {el.symbol}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors flex items-center gap-1.5 text-sm">
                      {el.name}
                      {el.radioactive && (
                        <span title="Elemento radiactivo" className="inline-flex">
                          <Radiation className="w-3 h-3 text-amber-400 shrink-0" />
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {el.atomicMass.toFixed(3)} u
                    </p>
                  </div>
                </div>

                {/* Compare toggle button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompare(el);
                  }}
                  className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
                    isInComparison
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title={isInComparison ? 'Quitar del comparador' : 'Añadir al comparador'}
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Middle row: Badges */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className={`px-2 py-0.5 rounded font-medium ${badgeColor} ${badgeText}`}>
                  {badgeLabel}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Bloque {el.block}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                  {PHASE_NAMES[phase]}
                </span>
                {el.electronegativity !== null && (
                  <span className="ml-auto font-mono text-slate-400">
                    EN: <strong className="text-slate-200">{el.electronegativity}</strong>
                  </span>
                )}
              </div>

              {/* View detail prompt on hover */}
              <div className="mt-2 flex items-center justify-end text-[10px] text-sky-400/80 group-hover:text-sky-300 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Ver detalles
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {sortedElements.length === 0 && (
        <div className="text-center py-12 text-slate-500 space-y-2">
          <p className="text-base font-semibold">No se encontraron elementos</p>
          <p className="text-xs">Prueba ajustando los filtros o el término de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
