import React, { useState } from 'react';
import type { ElementData } from '../../types/element';
import { CATEGORY_COLORS, PHASE_NAMES } from '../../data/elementsData';
import { BohrModel } from './BohrModel';
import {
  X,
  Scale,
  Atom,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Radiation,
} from 'lucide-react';

interface ElementModalProps {
  element: ElementData | null;
  onClose: () => void;
  onNavigate: (step: number) => void;
  onAddToCompare: (element: ElementData) => void;
  isInComparison: boolean;
  onGoToSimulator: (type: 'atom' | 'electron' | 'bond', element: ElementData) => void;
}

export const ElementModal: React.FC<ElementModalProps> = ({
  element,
  onClose,
  onNavigate,
  onAddToCompare,
  isInComparison,
  onGoToSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'deep'>('quick');

  if (!element) return null;

  const cat = CATEGORY_COLORS[element.category] || CATEGORY_COLORS['unknown'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl border flex flex-col items-center justify-center shadow-lg ${cat.bg} ${cat.border}`}
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400">
                {element.atomicNumber}
              </span>
              <span className={`text-2xl sm:text-3xl font-black ${cat.text}`}>
                {element.symbol}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {element.atomicMass.toFixed(2)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {element.name}
                </h2>
                <span className="text-xs sm:text-sm text-slate-400 font-mono">
                  ({element.nameEn})
                </span>
                {element.radioactive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                    <Radiation className="w-3 h-3 animate-pulse" />
                    Radiactivo
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                <span
                  className="px-2.5 py-0.5 rounded-full font-medium border"
                  style={{
                    backgroundColor: cat.glow.replace('0.4', '0.15'),
                    borderColor: cat.border,
                    color: '#e2e8f0',
                  }}
                >
                  {cat.name}
                </span>

                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  Bloque {element.block.toUpperCase()}
                </span>

                <span className="text-slate-400">
                  Periodo <strong className="text-white">{element.period}</strong>
                  {element.group ? (
                    <>
                      {' '}
                      • Grupo <strong className="text-white">{element.group}</strong>
                    </>
                  ) : (
                    <> • Serie f</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate(-1)}
              title="Elemento anterior (Z - 1)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate(1)}
              title="Elemento siguiente (Z + 1)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              title="Cerrar ficha"
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-950/60 hover:text-rose-300 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Visión rápida vs A fondo universitario */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'quick'
                ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Visión Rápida & General</span>
          </button>
          <button
            onClick={() => setActiveTab('deep')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'deep'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>A Fondo (Nivel Universitario)</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Grid: Left Bohr model & Right summary / properties */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Bohr Diagram */}
            <div className="md:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner">
              <span className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-sky-400" />
                Modelo de Capas Atómicas (Bohr)
              </span>
              <BohrModel element={element} size={230} />
            </div>

            {/* Right Summary / In-depth text */}
            <div className="md:col-span-7 space-y-4">
              {activeTab === 'quick' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-1.5">Resumen Conceptual</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{element.summary}</p>
                  </div>

                  {/* Discovery card */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Descubierto por</span>
                      <span className="font-semibold text-slate-200">{element.discoveredBy}</span>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">Año de descubrimiento</span>
                      <span className="font-semibold text-slate-200">{element.yearDiscovered}</span>
                    </div>
                  </div>

                  {/* Uses */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Aplicaciones Principales
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {element.commonUses.map((use, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 text-slate-200 border border-slate-700/60"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 border border-indigo-950 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-indigo-300 mb-1.5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      Análisis Cuántico y Reactividad Química
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{element.deepDive}</p>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Configuración electrónica condensada:</span>
                      <span className="font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {element.electronConfiguration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Electrones por nivel (K, L, M, N...):</span>
                      <span className="font-mono text-indigo-300">
                        {element.electronsPerShell.join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estados de oxidación estables:</span>
                      <span className="font-mono font-semibold text-emerald-400">
                        {element.oxidationStates}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Physicochemical Properties Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Constantes Fisicoquímicas y Cuánticas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Electronegatividad</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.electronegativity !== null ? element.electronegativity.toFixed(2) : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">Escala de Pauling</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Radio Atómico</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.atomicRadius !== null ? `${element.atomicRadius} pm` : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">Picómetros</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">1ª Energía de Ionización</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.ionizationEnergy !== null
                    ? `${element.ionizationEnergy.toFixed(2)} eV`
                    : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {element.ionizationEnergy !== null
                    ? `~${(element.ionizationEnergy * 96.485).toFixed(0)} kJ/mol`
                    : 'Potencial de ionización'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Afinidad Electrónica</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.electronAffinity !== null
                    ? `${element.electronAffinity.toFixed(2)} eV`
                    : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">Energía de enlace</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Densidad (298 K)</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.density !== null
                    ? element.density < 0.01
                      ? `${(element.density * 1000).toFixed(2)} mg/cm³`
                      : `${element.density.toFixed(2)} g/cm³`
                    : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">Estado estándar</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Punto de Fusión</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.meltingPoint !== null ? `${element.meltingPoint} K` : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {element.meltingPoint !== null
                    ? `${(element.meltingPoint - 273.15).toFixed(1)} °C`
                    : 'Transición sólida'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Punto de Ebullición</span>
                <span className="font-mono text-base font-bold text-white">
                  {element.boilingPoint !== null ? `${element.boilingPoint} K` : 'N/D'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {element.boilingPoint !== null
                    ? `${(element.boilingPoint - 273.15).toFixed(1)} °C`
                    : 'Transición gaseosa'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                <span className="text-slate-500 block">Estado Físico (298 K)</span>
                <span className="font-mono text-base font-bold text-white">
                  {PHASE_NAMES[element.phase] || element.phase}
                </span>
                <span className="text-[10px] text-slate-500 block">A 1 atm y 25 °C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAddToCompare(element)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isInComparison
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span>{isInComparison ? 'En comparación (Quitar)' : 'Añadir a Comparador'}</span>
            </button>

            <button
              onClick={() => onGoToSimulator('atom', element)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/60 transition-colors"
            >
              <Atom className="w-4 h-4 text-sky-400" />
              <span>Simular Átomo</span>
            </button>

            <button
              onClick={() => onGoToSimulator('electron', element)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 hover:bg-indigo-900/60 transition-colors"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Simular Aufbau (Moeller)</span>
            </button>

            <button
              onClick={() => onGoToSimulator('bond', element)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Simular Enlace</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
