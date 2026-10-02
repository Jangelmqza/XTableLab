import React from 'react';
import type { ElementData, ElementCategory, ElementBlock, TrendProperty } from '../../types/element';
import type { TableDisplayMode } from './ElementCard';
import { ElementCard } from './ElementCard';

interface PeriodicGridProps {
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
  onSwitchToCards?: () => void;
}

const GROUP_LABELS = [
  { num: 1, cas: 'IA', name: 'Alcalinos' },
  { num: 2, cas: 'IIA', name: 'Alcalinotérreos' },
  { num: 3, cas: 'IIIB', name: 'Escandio' },
  { num: 4, cas: 'IVB', name: 'Titanio' },
  { num: 5, cas: 'VB', name: 'Vanadio' },
  { num: 6, cas: 'VIB', name: 'Cromo' },
  { num: 7, cas: 'VIIB', name: 'Manganeso' },
  { num: 8, cas: 'VIII', name: 'Hierro' },
  { num: 9, cas: 'VIII', name: 'Cobalto' },
  { num: 10, cas: 'VIII', name: 'Níquel' },
  { num: 11, cas: 'IB', name: 'Cobre' },
  { num: 12, cas: 'IIB', name: 'Cinc' },
  { num: 13, cas: 'IIIA', name: 'Boroideos' },
  { num: 14, cas: 'IVA', name: 'Carbonoideos' },
  { num: 15, cas: 'VA', name: 'Nitrogenoideos' },
  { num: 16, cas: 'VIA', name: 'Calcógenos' },
  { num: 17, cas: 'VIIA', name: 'Halógenos' },
  { num: 18, cas: 'VIIIA', name: 'Gases Nobles' },
];

export const PeriodicGrid: React.FC<PeriodicGridProps> = ({
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
  onSwitchToCards,
}) => {
  // Elements lookup map by atomic number
  const elementsByZ = React.useMemo(() => {
    const map = new Map<number, ElementData>();
    elements.forEach((el) => map.set(el.atomicNumber, el));
    return map;
  }, [elements]);

  // Filter check helper
  const isElementFilteredOut = (el: ElementData): boolean => {
    if (selectedCategory !== 'all' && el.category !== selectedCategory) {
      return true;
    }
    if (selectedBlock !== 'all' && el.block !== selectedBlock) {
      return true;
    }
    if (onlyRadioactive && !el.radioactive) {
      return true;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = el.name.toLowerCase().includes(q);
      const matchNameEn = el.nameEn.toLowerCase().includes(q);
      const matchSymbol = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
      const matchNumber = el.atomicNumber.toString() === q;
      if (!matchName && !matchNameEn && !matchSymbol && !matchNumber) {
        return true;
      }
    }
    return false;
  };

  // 2D Spatial & Numerical Keyboard Navigation Helper
  const getNextElementZ = (
    currentZ: number,
    direction: 'up' | 'down' | 'left' | 'right'
  ): number => {
    const current = elementsByZ.get(currentZ);
    if (!current) return currentZ;

    if (direction === 'right') {
      return currentZ < 118 ? currentZ + 1 : 1;
    }
    if (direction === 'left') {
      return currentZ > 1 ? currentZ - 1 : 118;
    }
    if (direction === 'down') {
      // Lanthanides (57-71) down to Actinides (89-103)
      if (currentZ >= 57 && currentZ <= 71) {
        return Math.min(103, currentZ + 32);
      }
      if (currentZ >= 89 && currentZ <= 103) {
        return currentZ;
      }
      // In main table: search down in same group
      for (let p = current.period + 1; p <= 7; p++) {
        const candidate = elements.find(
          (e) =>
            e.group === current.group &&
            e.period === p &&
            !(e.atomicNumber >= 57 && e.atomicNumber <= 71) &&
            !(e.atomicNumber >= 89 && e.atomicNumber <= 103)
        );
        if (candidate) return candidate.atomicNumber;
      }
      return currentZ;
    }
    if (direction === 'up') {
      // Actinides (89-103) up to Lanthanides (57-71)
      if (currentZ >= 89 && currentZ <= 103) {
        return Math.max(57, currentZ - 32);
      }
      if (currentZ >= 57 && currentZ <= 71) {
        return 39; // Yttrium
      }
      // In main table: search up in same group
      for (let p = current.period - 1; p >= 1; p--) {
        const candidate = elements.find(
          (e) =>
            e.group === current.group &&
            e.period === p &&
            !(e.atomicNumber >= 57 && e.atomicNumber <= 71) &&
            !(e.atomicNumber >= 89 && e.atomicNumber <= 103)
        );
        if (candidate) return candidate.atomicNumber;
      }
      return currentZ;
    }
    return currentZ;
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, z: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextZ = getNextElementZ(z, 'right');
      document.getElementById(`element-cell-${nextZ}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextZ = getNextElementZ(z, 'left');
      document.getElementById(`element-cell-${nextZ}`)?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextZ = getNextElementZ(z, 'down');
      document.getElementById(`element-cell-${nextZ}`)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextZ = getNextElementZ(z, 'up');
      document.getElementById(`element-cell-${nextZ}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      document.getElementById('element-cell-1')?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      document.getElementById('element-cell-118')?.focus();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      const el = elementsByZ.get(z);
      if (el) onToggleCompare(el);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const el = elementsByZ.get(z);
      if (el) onSelectElement(el);
    }
  };

  // Helper to render an element card by atomic number
  const renderCell = (z: number) => {
    const el = elementsByZ.get(z);
    if (!el) return <div key={`empty-${z}`} className="w-full aspect-[4/5]" />;

    const isFilteredOut = isElementFilteredOut(el);
    const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
    const isInComparison = comparisonList.some((c) => c.atomicNumber === el.atomicNumber);

    return (
      <ElementCard
        key={el.atomicNumber}
        element={el}
        displayMode={displayMode}
        activeTrend={activeTrend}
        allElements={elements}
        temperatureK={temperatureK}
        isFilteredOut={isFilteredOut}
        isSelected={isSelected}
        isInComparison={isInComparison}
        onSelect={onSelectElement}
        onToggleCompare={onToggleCompare}
        onGridKeyDown={handleCellKeyDown}
      />
    );
  };

  return (
    <div className="w-full select-none space-y-2">
      {/* Mobile hint banner */}
      <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2 bg-sky-950/60 border border-sky-800/60 rounded-xl text-xs text-sky-200">
        <span className="flex items-center gap-1.5 font-medium">
          ↔ Desliza la tabla para ver todos los grupos
        </span>
        {onSwitchToCards && (
          <button
            type="button"
            onClick={onSwitchToCards}
            className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] shrink-0 transition-colors shadow"
          >
            Ver en Fichas
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[1020px] max-w-full mx-auto space-y-4">
          {/* Main Grid: 18 Columns + 1 Period label column */}
          <div className="grid grid-cols-[36px_repeat(18,_minmax(0,_1fr))] gap-1.5 sm:gap-2 items-center">
            {/* Header Row: Group Numbers & Traditional CAS */}
            <div className="text-center font-mono text-[10px] text-slate-500 font-bold">
              P \ G
            </div>
          {GROUP_LABELS.map((grp) => (
            <div
              key={grp.num}
              className="text-center flex flex-col items-center justify-end py-1 text-slate-400 group relative cursor-help"
            >
              <span className="font-mono text-xs font-bold text-slate-200">
                {grp.num}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                {grp.cas}
              </span>
            </div>
          ))}

          {/* Period 1 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">1</div>
          {renderCell(1)} {/* H */}
          <div className="col-span-16 grid grid-cols-16 gap-1.5">
            {/* Blank 16 cols between H and He */}
          </div>
          {renderCell(2)} {/* He */}

          {/* Period 2 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">2</div>
          {renderCell(3)} {/* Li */}
          {renderCell(4)} {/* Be */}
          <div className="col-span-10 grid grid-cols-10 gap-1.5">
            {/* Blank 10 cols between Be and B */}
          </div>
          {renderCell(5)}  {/* B */}
          {renderCell(6)}  {/* C */}
          {renderCell(7)}  {/* N */}
          {renderCell(8)}  {/* O */}
          {renderCell(9)}  {/* F */}
          {renderCell(10)} {/* Ne */}

          {/* Period 3 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">3</div>
          {renderCell(11)} {/* Na */}
          {renderCell(12)} {/* Mg */}
          <div className="col-span-10 grid grid-cols-10 gap-1.5">
            {/* Blank 10 cols between Mg and Al */}
          </div>
          {renderCell(13)} {/* Al */}
          {renderCell(14)} {/* Si */}
          {renderCell(15)} {/* P */}
          {renderCell(16)} {/* S */}
          {renderCell(17)} {/* Cl */}
          {renderCell(18)} {/* Ar */}

          {/* Period 4 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">4</div>
          {renderCell(19)} {/* K */}
          {renderCell(20)} {/* Ca */}
          {renderCell(21)} {/* Sc */}
          {renderCell(22)} {/* Ti */}
          {renderCell(23)} {/* V */}
          {renderCell(24)} {/* Cr */}
          {renderCell(25)} {/* Mn */}
          {renderCell(26)} {/* Fe */}
          {renderCell(27)} {/* Co */}
          {renderCell(28)} {/* Ni */}
          {renderCell(29)} {/* Cu */}
          {renderCell(30)} {/* Zn */}
          {renderCell(31)} {/* Ga */}
          {renderCell(32)} {/* Ge */}
          {renderCell(33)} {/* As */}
          {renderCell(34)} {/* Se */}
          {renderCell(35)} {/* Br */}
          {renderCell(36)} {/* Kr */}

          {/* Period 5 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">5</div>
          {renderCell(37)} {/* Rb */}
          {renderCell(38)} {/* Sr */}
          {renderCell(39)} {/* Y */}
          {renderCell(40)} {/* Zr */}
          {renderCell(41)} {/* Nb */}
          {renderCell(42)} {/* Mo */}
          {renderCell(43)} {/* Tc */}
          {renderCell(44)} {/* Ru */}
          {renderCell(45)} {/* Rh */}
          {renderCell(46)} {/* Pd */}
          {renderCell(47)} {/* Ag */}
          {renderCell(48)} {/* Cd */}
          {renderCell(49)} {/* In */}
          {renderCell(50)} {/* Sn */}
          {renderCell(51)} {/* Sb */}
          {renderCell(52)} {/* Te */}
          {renderCell(53)} {/* I */}
          {renderCell(54)} {/* Xe */}

          {/* Period 6 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">6</div>
          {renderCell(55)} {/* Cs */}
          {renderCell(56)} {/* Ba */}
          {/* Lanthanide Anchor */}
          <div className="flex flex-col items-center justify-center p-1 rounded-lg border border-indigo-500/40 bg-indigo-950/30 text-indigo-300 aspect-[4/5] text-center shadow-inner">
            <span className="text-[9px] font-mono font-bold text-indigo-400">57-71</span>
            <span className="text-[10px] sm:text-xs font-bold leading-tight">La-Lu</span>
            <span className="text-[8px] text-indigo-300/80">Lantánidos</span>
            <span className="text-[9px] text-indigo-400 mt-0.5">↓</span>
          </div>
          {renderCell(72)} {/* Hf */}
          {renderCell(73)} {/* Ta */}
          {renderCell(74)} {/* W */}
          {renderCell(75)} {/* Re */}
          {renderCell(76)} {/* Os */}
          {renderCell(77)} {/* Ir */}
          {renderCell(78)} {/* Pt */}
          {renderCell(79)} {/* Au */}
          {renderCell(80)} {/* Hg */}
          {renderCell(81)} {/* Tl */}
          {renderCell(82)} {/* Pb */}
          {renderCell(83)} {/* Bi */}
          {renderCell(84)} {/* Po */}
          {renderCell(85)} {/* At */}
          {renderCell(86)} {/* Rn */}

          {/* Period 7 */}
          <div className="text-center font-mono text-xs font-bold text-slate-400">7</div>
          {renderCell(87)} {/* Fr */}
          {renderCell(88)} {/* Ra */}
          {/* Actinide Anchor */}
          <div className="flex flex-col items-center justify-center p-1 rounded-lg border border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-300 aspect-[4/5] text-center shadow-inner">
            <span className="text-[9px] font-mono font-bold text-fuchsia-400">89-103</span>
            <span className="text-[10px] sm:text-xs font-bold leading-tight">Ac-Lr</span>
            <span className="text-[8px] text-fuchsia-300/80">Actínidos</span>
            <span className="text-[9px] text-fuchsia-400 mt-0.5">↓</span>
          </div>
          {renderCell(104)} {/* Rf */}
          {renderCell(105)} {/* Db */}
          {renderCell(106)} {/* Sg */}
          {renderCell(107)} {/* Bh */}
          {renderCell(108)} {/* Hs */}
          {renderCell(109)} {/* Mt */}
          {renderCell(110)} {/* Ds */}
          {renderCell(111)} {/* Rg */}
          {renderCell(112)} {/* Cn */}
          {renderCell(113)} {/* Nh */}
          {renderCell(114)} {/* Fl */}
          {renderCell(115)} {/* Mc */}
          {renderCell(116)} {/* Lv */}
          {renderCell(117)} {/* Ts */}
          {renderCell(118)} {/* Og */}
        </div>

        {/* F-Block Series: Lanthanides & Actinides */}
        <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-2">
          {/* Lanthanides row: 57 to 71 */}
          <div className="grid grid-cols-[140px_repeat(15,_minmax(0,_1fr))] gap-1.5 sm:gap-2 items-center">
            <div className="flex items-center gap-2 px-2 text-right justify-end">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-xs font-medium text-indigo-300">Lantánidos (57-71)</span>
            </div>
            {Array.from({ length: 15 }, (_, i) => 57 + i).map((z) => renderCell(z))}
          </div>

          {/* Actinides row: 89 to 103 */}
          <div className="grid grid-cols-[140px_repeat(15,_minmax(0,_1fr))] gap-1.5 sm:gap-2 items-center">
            <div className="flex items-center gap-2 px-2 text-right justify-end">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span>
              <span className="text-xs font-medium text-fuchsia-300">Actínidos (89-103)</span>
            </div>
            {Array.from({ length: 15 }, (_, i) => 89 + i).map((z) => renderCell(z))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
