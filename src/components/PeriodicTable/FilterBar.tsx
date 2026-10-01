import React from 'react';
import type { ElementCategory, ElementBlock, TrendProperty } from '../../types/element';
import type { TableDisplayMode } from './ElementCard';
import { CATEGORY_COLORS } from '../../data/elementsData';
import { TREND_INFO } from '../../utils/trends';
import { Search, RotateCcw, Flame, Layers, Box, Thermometer, Sparkles, Radiation } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  displayMode: TableDisplayMode;
  onDisplayModeChange: (mode: TableDisplayMode) => void;
  activeTrend: TrendProperty;
  onActiveTrendChange: (trend: TrendProperty) => void;
  selectedCategory: ElementCategory | 'all';
  onCategoryChange: (cat: ElementCategory | 'all') => void;
  selectedBlock: ElementBlock | 'all';
  onBlockChange: (blk: ElementBlock | 'all') => void;
  temperatureK: number;
  onTemperatureChange: (tempK: number) => void;
  onlyRadioactive: boolean;
  onOnlyRadioactiveChange: (val: boolean) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  displayMode,
  onDisplayModeChange,
  activeTrend,
  onActiveTrendChange,
  selectedCategory,
  onCategoryChange,
  selectedBlock,
  onBlockChange,
  temperatureK,
  onTemperatureChange,
  onlyRadioactive,
  onOnlyRadioactiveChange,
  onResetFilters,
  totalFilteredCount,
}) => {
  const categoriesList = Object.keys(CATEGORY_COLORS) as ElementCategory[];
  const blocksList: ElementBlock[] = ['s', 'p', 'd', 'f'];

  const tempPresets = [
    { label: '0 K (Cero absoluto)', k: 0 },
    { label: '273 K (0 °C Hielo)', k: 273.15 },
    { label: '298 K (25 °C Ambiente)', k: 298.15 },
    { label: '373 K (100 °C Vapor)', k: 373.15 },
    { label: '1811 K (Fusión del Hierro)', k: 1811 },
    { label: '5778 K (Superficie Solar)', k: 5778 },
  ];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl mb-6 space-y-4">
      {/* Top row: Search bar & Display Mode Selector */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, símbolo químico o número atómico (ej. Fe, Oro, 26)..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Display Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => onDisplayModeChange('category')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'category'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categorías</span>
          </button>

          <button
            onClick={() => onDisplayModeChange('block')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'block'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Bloques s, p, d, f</span>
          </button>

          <button
            onClick={() => onDisplayModeChange('phase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'phase'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Estado vs Temp</span>
          </button>

          <button
            onClick={() => onDisplayModeChange('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              displayMode === 'heatmap'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Mapa de Calor</span>
          </button>
        </div>
      </div>

      {/* Secondary Bar depending on mode */}
      {displayMode === 'heatmap' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/70">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Propiedad periódica a graficar:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TREND_INFO) as TrendProperty[]).map((prop) => (
              <button
                key={prop}
                onClick={() => onActiveTrendChange(prop)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTrend === prop
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {TREND_INFO[prop].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayMode === 'phase' && (
        <div className="space-y-3 pt-2 border-t border-slate-800/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-300">Temperatura simulada:</span>
              <span className="font-mono text-base font-bold text-sky-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {Math.round(temperatureK)} K{' '}
                <span className="text-slate-400 text-xs font-normal">
                  ({(temperatureK - 273.15).toFixed(0)} °C)
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tempPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onTemperatureChange(preset.k)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    Math.abs(temperatureK - preset.k) < 1
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="6000"
            step="10"
            value={temperatureK}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>0 K (-273 °C)</span>
            <span>298 K (25 °C)</span>
            <span>1500 K</span>
            <span>3000 K</span>
            <span>6000 K (Superficie solar)</span>
          </div>
        </div>
      )}

      {/* Filter Chips & Radioactivity Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/70">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-1">Filtrar categoría:</span>
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-200 text-slate-900 font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todas
          </button>
          {categoriesList.map((catKey) => {
            const cat = CATEGORY_COLORS[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => onCategoryChange(isSelected ? 'all' : catKey)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? `${cat.bg} ${cat.text} ${cat.border} ring-1 ring-sky-400 font-bold`
                    : 'bg-slate-950/40 text-slate-400 border-slate-800/70 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.glow }}
                />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Blocks selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 px-1 text-[11px]">Bloque:</span>
            <button
              onClick={() => onBlockChange('all')}
              className={`px-1.5 py-0.5 rounded ${
                selectedBlock === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Todos
            </button>
            {blocksList.map((blk) => (
              <button
                key={blk}
                onClick={() => onBlockChange(selectedBlock === blk ? 'all' : blk)}
                className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                  selectedBlock === blk ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {blk}
              </button>
            ))}
          </div>

          {/* Radioactive only toggle */}
          <button
            onClick={() => onOnlyRadioactiveChange(!onlyRadioactive)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              onlyRadioactive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Radiation className={`w-3.5 h-3.5 ${onlyRadioactive ? 'text-amber-400 animate-spin' : ''}`} />
            <span>Radiactivos</span>
          </button>

          {/* Reset button if any filter applied */}
          {(selectedCategory !== 'all' ||
            selectedBlock !== 'all' ||
            searchQuery !== '' ||
            onlyRadioactive) && (
            <button
              onClick={onResetFilters}
              title="Restablecer todos los filtros"
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/40 px-2 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar ({totalFilteredCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
