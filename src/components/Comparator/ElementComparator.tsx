import React, { useState } from 'react';
import type { ElementData } from '../../types/element';
import { CATEGORY_COLORS } from '../../data/elementsData';
import { BohrModel } from '../ElementModal/BohrModel';
import { Scale, Trash2, Zap } from 'lucide-react';

interface ElementComparatorProps {
  elements: ElementData[];
  comparisonList: ElementData[];
  onRemoveFromCompare: (atomicNumber: number) => void;
  onAddElement: (element: ElementData) => void;
  onClearAll: () => void;
}

export const ElementComparator: React.FC<ElementComparatorProps> = ({
  elements,
  comparisonList,
  onRemoveFromCompare,
  onAddElement,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSearch = elements
    .filter(
      (e) =>
        !comparisonList.some((c) => c.atomicNumber === e.atomicNumber) &&
        (e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.atomicNumber.toString() === searchTerm.trim())
    )
    .slice(0, 8);

  // Bonding prediction between element 0 and 1
  const renderBondPrediction = () => {
    if (comparisonList.length < 2) return null;
    const el1 = comparisonList[0];
    const el2 = comparisonList[1];

    if (el1.electronegativity === null || el2.electronegativity === null) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
          No hay datos de electronegatividad suficientes para predecir el enlace entre {el1.name} y {el2.name}.
        </div>
      );
    }

    const deltaEN = Math.abs(el1.electronegativity - el2.electronegativity);
    let bondType = '';
    let explanation = '';
    let badgeColor = '';

    const isMetal1 = el1.category.includes('metal') && !el1.category.includes('metalloid');
    const isMetal2 = el2.category.includes('metal') && !el2.category.includes('metalloid');

    if (isMetal1 && isMetal2) {
      bondType = 'Enlace Metálico';
      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      explanation = `Ambos elementos (${el1.symbol} y ${el2.symbol}) son metales electropositivos. Al unirse, forman una red cristalina de cationes inmersos en un mar de electrones deslocalizados de valencia, dando lugar a una aleación o compuesto intermetálico con alta conductividad térmica y eléctrica.`;
    } else if (deltaEN > 1.7) {
      bondType = 'Enlace Iónico Predominante (ΔEN > 1.7)';
      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      const donor = el1.electronegativity < el2.electronegativity ? el1 : el2;
      const receiver = donor === el1 ? el2 : el1;
      explanation = `La gran diferencia de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}) propicia la transferencia completa de electrones: ${donor.name} se oxida formando un catión y ${receiver.name} se reduce formando un anión. La atracción electrostática multidireccional genera una red cristalina salina con alto punto de fusión.`;
    } else if (deltaEN >= 0.4) {
      bondType = 'Enlace Covalente Polar (0.4 ≤ ΔEN ≤ 1.7)';
      badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      const negative = el1.electronegativity > el2.electronegativity ? el1 : el2;
      const positive = negative === el1 ? el2 : el1;
      explanation = `La diferencia moderada de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}) genera una compartición asimétrica del par electrónico. Se produce un momento dipolar permanente con densidad de carga parcial negativa (δ⁻) sobre ${negative.name} y parcial positiva (δ⁺) sobre ${positive.name}.`;
    } else {
      bondType = 'Enlace Covalente No Polar / Puro (ΔEN < 0.4)';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      explanation = `Con una diferencia de electronegatividad mínima (ΔEN = ${deltaEN.toFixed(2)}), los electrones compartidos se distribuyen de manera simétrica y homogénea entre ambos núcleos, sin dipolos permanentes apreciables.`;
    }

    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              Predicción de Enlace: {el1.name} + {el2.name}
            </h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            {bondType}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">EN ({el1.symbol}):</span>{' '}
            <strong className="text-white">{el1.electronegativity.toFixed(2)}</strong>
          </div>
          <div>
            <span className="text-slate-400">EN ({el2.symbol}):</span>{' '}
            <strong className="text-white">{el2.electronegativity.toFixed(2)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Diferencia |ΔEN|:</span>{' '}
            <strong className="text-amber-400 font-mono text-sm">{deltaEN.toFixed(2)}</strong>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
          {explanation}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            Comparador Paramétrico de Elementos Químicos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Contrasta de 2 a 3 elementos periódicos en paralelo para entender sus diferencias atómicas, radios, energías y predecir enlaces químicos.
          </p>
        </div>

        {/* Add Element Search / Selector */}
        <div className="flex items-center gap-2 relative">
          {comparisonList.length < 3 ? (
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Añadir elemento (ej. Fe)..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 sm:w-56"
              />
              {showDropdown && searchTerm.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800">
                  {filteredSearch.map((el) => (
                    <button
                      key={el.atomicNumber}
                      onClick={() => {
                        onAddElement(el);
                        setSearchTerm('');
                        setShowDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200 transition-colors"
                    >
                      <span>
                        <strong className="text-white">{el.symbol}</strong> - {el.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Z={el.atomicNumber}</span>
                    </button>
                  ))}
                  {filteredSearch.length === 0 && (
                    <div className="p-3 text-xs text-slate-500 text-center">No se encontraron elementos</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-amber-400/90 font-medium bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-800/40">
              Máximo 3 elementos simultáneos
            </span>
          )}

          {comparisonList.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-800/40 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {comparisonList.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Scale className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">
            No has seleccionado elementos para comparar
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Puedes añadir hasta 3 elementos químicos utilizando el buscador superior o haciendo clic en cualquier celda de la Tabla Periódica y seleccionando "Añadir a Comparador".
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparisonList.length} gap-4`}>
            {comparisonList.map((el) => {
              const cat = CATEGORY_COLORS[el.category];
              return (
                <div
                  key={el.atomicNumber}
                  className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCompare(el.atomicNumber)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                    title="Quitar de la comparación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Element Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-16 rounded-xl border flex flex-col items-center justify-center shadow-lg ${cat.bg} ${cat.border}`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {el.atomicNumber}
                      </span>
                      <span className={`text-2xl font-black ${cat.text}`}>{el.symbol}</span>
                      <span className="text-[8px] font-mono text-slate-400">
                        {el.atomicMass.toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{el.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">({el.nameEn})</span>
                      <span className="block text-[11px] text-slate-300 mt-1">{cat.name}</span>
                    </div>
                  </div>

                  {/* Compact Bohr visualization */}
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex justify-center">
                    <BohrModel element={el} size={150} />
                  </div>

                  {/* Properties table */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Electronegatividad:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {el.electronegativity !== null ? el.electronegativity.toFixed(2) : 'N/D'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Radio Atómico:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {el.atomicRadius !== null ? `${el.atomicRadius} pm` : 'N/D'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">1ª Energía de Ionización:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {el.ionizationEnergy !== null ? `${el.ionizationEnergy.toFixed(2)} eV` : 'N/D'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Densidad (298 K):</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {el.density !== null ? `${el.density.toFixed(2)} g/cm³` : 'N/D'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Punto de Fusión:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {el.meltingPoint !== null ? `${el.meltingPoint} K` : 'N/D'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Configuración:</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[150px]">
                        {el.electronConfiguration}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Estados de Oxidación:</span>
                      <span className="font-mono text-purple-300">{el.oxidationStates}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bond Prediction if 2 elements */}
          {renderBondPrediction()}
        </div>
      )}
    </div>
  );
};
