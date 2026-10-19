import { useState, useEffect } from 'react';
import type { ElementData } from '../../types/element';
import {
  calculateOrbitalBoxes,
  formatConfigurationString,
  getAnomalyNote,
} from '../../utils/electronConfig';
import { Zap, Play, Pause, SkipForward, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';

interface ElectronConfigSimulatorProps {
  elements: ElementData[];
  initialElement?: ElementData | null;
}

export const ElectronConfigSimulator: React.FC<ElectronConfigSimulatorProps> = ({
  elements,
  initialElement,
}) => {
  const [totalElectrons, setTotalElectrons] = useState<number>(
    initialElement ? initialElement.atomicNumber : 11 // Sodium default
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [configMode, setConfigMode] = useState<'real' | 'aufbau'>('real');
  const [notationOrder, setNotationOrder] = useState<'filling' | 'shell'>('filling');

  // Auto-play animation cleanly without synchronous setState in useEffect
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      if (totalElectrons >= 118) {
        setIsPlaying(false);
      } else {
        setTotalElectrons((prev) => Math.min(118, prev + 1));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [isPlaying, totalElectrons]);

  const currentElement = elements.find((e) => e.atomicNumber === totalElectrons) || null;
  const anomaly = getAnomalyNote(totalElectrons);
  const orbitalData = calculateOrbitalBoxes(totalElectrons, configMode);
  const configString = formatConfigurationString(orbitalData, notationOrder);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Configuración Electrónica Cuántica (Aufbau &amp; Moeller)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza el llenado sistemático de orbitales atómicos según el principio de Aufbau, la regla de máxima multiplicidad de Hund, el principio de exclusión de Pauli y las anomalías cuánticas reales.
          </p>
        </div>

        {/* Stepper & Animation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher: Real vs Idealized Aufbau */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setConfigMode('real')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                configMode === 'real'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Muestra la configuración experimental real (incluyendo anomalías como Cr, Cu, Pd, Au)"
            >
              Real (Experimental)
            </button>
            <button
              type="button"
              onClick={() => setConfigMode('aufbau')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                configMode === 'aufbau'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Muestra el llenado ideal estricto según la regla de las diagonales (n + l)"
            >
              Aufbau Teórico
            </button>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-sky-600 text-white hover:bg-sky-500'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pausar' : 'Llenado Animado'}</span>
          </button>

          <button
            onClick={() => setTotalElectrons((prev) => Math.min(118, prev + 1))}
            disabled={totalElectrons >= 118}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-40 transition-colors"
            title="+1 electrón"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setTotalElectrons(1);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Reiniciar a 1 electrón"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Slider & Active Element Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-sky-950/70 border border-sky-600/40 rounded-xl flex flex-col items-center justify-center font-mono">
              <span className="text-[10px] text-slate-400 font-bold">{totalElectrons}</span>
              <span className="text-xl font-black text-sky-300">
                {currentElement ? currentElement.symbol : 'Z'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentElement ? currentElement.name : `Elemento Z=${totalElectrons}`}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {totalElectrons} electrones totales •{' '}
                {currentElement ? currentElement.category : ''}
              </p>
            </div>
          </div>

          {/* Quick presets for university milestones */}
          <div className="flex flex-wrap gap-1 text-xs">
            {[
              { z: 1, label: 'H (1s¹)' },
              { z: 6, label: 'C (2p²)' },
              { z: 10, label: 'Ne (Octeto)' },
              { z: 24, label: 'Cr (Anomalía)' },
              { z: 26, label: 'Fe (3d⁶)' },
              { z: 29, label: 'Cu (Anomalía)' },
              { z: 46, label: 'Pd (5s⁰)' },
              { z: 79, label: 'Au (Oro)' },
            ].map((p) => (
              <button
                key={p.z}
                onClick={() => {
                  setIsPlaying(false);
                  setTotalElectrons(p.z);
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] border transition-colors ${
                  totalElectrons === p.z
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Z = 1 (Hidrógeno)</span>
            <span className="font-mono font-bold text-white">Electrones: {totalElectrons}</span>
            <span>Z = 118 (Oganesón)</span>
          </div>
          <input
            type="range"
            min="1"
            max="118"
            value={totalElectrons}
            aria-label="Seleccionar número de electrones (Z)"
            onChange={(e) => {
              setIsPlaying(false);
              setTotalElectrons(parseInt(e.target.value, 10));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Written Configuration with notation toggle */}
        <div
          aria-live="polite"
          className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner"
        >
          <div className="font-mono text-sm text-sky-300 overflow-x-auto whitespace-nowrap">
            <span className="text-slate-400 mr-2 text-xs font-sans">
              Configuración ({configMode === 'real' ? 'experimental' : 'Aufbau ideal'}):
            </span>
            <span className="font-bold">{configString}</span>
            {currentElement && (
              <span className="ml-3 text-xs text-indigo-300">
                ({currentElement.electronConfiguration})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] shrink-0">
            <span className="text-slate-500 mr-1">Orden:</span>
            <button
              type="button"
              onClick={() => setNotationOrder('filling')}
              className={`px-2 py-0.5 rounded border ${
                notationOrder === 'filling'
                  ? 'bg-sky-950 text-sky-300 border-sky-700 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Llenado (n+l)
            </button>
            <button
              type="button"
              onClick={() => setNotationOrder('shell')}
              className={`px-2 py-0.5 rounded border ${
                notationOrder === 'shell'
                  ? 'bg-sky-950 text-sky-300 border-sky-700 font-semibold'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Por capa (n)
            </button>
          </div>
        </div>

        {/* Quantum Anomaly Alert if triggered */}
        {anomaly && (
          <div
            role="status"
            aria-live="polite"
            className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-semibold mb-0.5">
                Excepción al Principio de Aufbau Detectada ({configMode === 'real' ? 'Aplicada en el diagrama' : 'Modo teórico activo — cambia a Real para verla en las cajas'}):
              </strong>
              <span>{anomaly}</span>
            </div>
          </div>
        )}
      </div>

      {/* Orbital Box Diagram Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          Diagrama de Cajas Cuánticas y Espines de Electrones (↑ = +½, ↓ = -½)
        </h3>

        <div className="flex flex-wrap gap-4 items-end">
          {orbitalData.map((item) => (
            <div
              key={item.sublevel.name}
              className="flex flex-col items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80"
            >
              {/* Sublevel Label */}
              <span className="text-xs font-mono font-bold text-sky-400 mb-1.5">
                {item.sublevel.name}
                <sup className="text-slate-300">{item.electronsCount}</sup>
              </span>

              {/* Orbital Boxes */}
              <div className="flex items-center gap-1">
                {item.orbitals.map((box, bIdx) => (
                  <div
                    key={bIdx}
                    className={`w-9 h-11 border rounded-lg flex items-center justify-center font-mono text-base font-bold shadow-inner ${
                      box.up || box.down
                        ? 'border-sky-500/60 bg-sky-950/30 text-white'
                        : 'border-slate-800 bg-slate-900/40 text-slate-600'
                    }`}
                  >
                    <span className="flex items-center tracking-tighter">
                      {box.up && <span className="text-sky-300">↑</span>}
                      {box.down && <span className="text-rose-400">↓</span>}
                      {!box.up && !box.down && <span className="text-slate-700 text-xs">-</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pedagogical legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Principio de Aufbau:</strong>
            Los electrones ocupan primero los orbitales de menor energía disponible siguiendo la regla de las diagonales (n + l), con excepciones en metales de transición por estabilidad de subcapas d/f.
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Regla de Hund:</strong>
            En orbitales degenerados (misma energía), los electrones se distribuyen desapareados con espines paralelos (↑) antes de aparearse.
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Principio de Pauli:</strong>
            Dos electrones en un mismo orbital no pueden tener los mismos cuatro números cuánticos; deben poseer espines antiparalelos (+½ y -½).
          </div>
        </div>
      </div>
    </div>
  );
};
