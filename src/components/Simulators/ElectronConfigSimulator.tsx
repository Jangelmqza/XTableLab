import { useState, useEffect } from 'react';
import type { ElementData } from '../../types/element';
import { Zap, Play, Pause, SkipForward, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';

interface ElectronConfigSimulatorProps {
  elements: ElementData[];
  initialElement?: ElementData | null;
}

interface Sublevel {
  name: string;
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  capacity: number;
  orbitalsCount: number;
}

// Aufbau filling sequence according to (n + l) rule
const AUFBAU_SEQUENCE: Sublevel[] = [
  { name: '1s', n: 1, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '2s', n: 2, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '2p', n: 2, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '3s', n: 3, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '3p', n: 3, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '4s', n: 4, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '3d', n: 3, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '4p', n: 4, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '5s', n: 5, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '4d', n: 4, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '5p', n: 5, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '6s', n: 6, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '4f', n: 4, l: 3, capacity: 14, orbitalsCount: 7 },
  { name: '5d', n: 5, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '6p', n: 6, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '7s', n: 7, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '5f', n: 5, l: 3, capacity: 14, orbitalsCount: 7 },
  { name: '6d', n: 6, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '7p', n: 7, l: 1, capacity: 6, orbitalsCount: 3 },
];

export const ElectronConfigSimulator: React.FC<ElectronConfigSimulatorProps> = ({
  elements,
  initialElement,
}) => {
  const [totalElectrons, setTotalElectrons] = useState<number>(
    initialElement ? initialElement.atomicNumber : 11 // Sodium default
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play animation
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTotalElectrons((prev) => {
          if (prev >= 118) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentElement = elements.find((e) => e.atomicNumber === totalElectrons) || null;

  // Real-world quantum anomalies
  const getAnomalyNote = (z: number): string | null => {
    if (z === 24) return 'Cromo (Z=24): Configuración anómala [Ar] 4s¹ 3d⁵ en lugar de 4s² 3d⁴. La estabilidad adicional por energía de canje de la subcapa 3d exactamente semi-llena promueve un electrón 4s hacia el orbital 3d.';
    if (z === 29) return 'Cobre (Z=29): Configuración anómala [Ar] 4s¹ 3d¹⁰ en lugar de 4s² 3d⁹. La subcapa 3d completamente llena ofrece una simetría esférica y menor apantallamiento que estabiliza el átomo.';
    if (z === 42) return 'Molibdeno (Z=42): Configuración [Kr] 5s¹ 4d⁵ análoga al cromo por subcapa d semi-llena.';
    if (z === 46) return 'Paladio (Z=46): Configuración [Kr] 4d¹⁰ 5s⁰. Ambos electrones 5s pasan a llenar la capa 4d.';
    if (z === 47) return 'Plata (Z=47): Configuración [Kr] 5s¹ 4d¹⁰ por subcapa 4d completa.';
    if (z === 79) return 'Oro (Z=79): Configuración [Xe] 4f¹⁴ 5d¹⁰ 6s¹ estabilizada por efectos relativistas y subcapa 5d llena.';
    return null;
  };

  const anomaly = getAnomalyNote(totalElectrons);

  // Calculate electron distribution across sublevels obeying Aufbau and Hund's rule
  const calculateOrbitalBoxes = (numElectrons: number) => {
    let remaining = numElectrons;
    const distribution: {
      sublevel: Sublevel;
      electronsCount: number;
      orbitals: { up: boolean; down: boolean }[];
    }[] = [];

    for (const sub of AUFBAU_SEQUENCE) {
      if (remaining <= 0) break;

      const count = Math.min(remaining, sub.capacity);
      remaining -= count;

      // Fill orbital boxes using Hund's Rule:
      // First pass: put 1 spin UP in each orbital
      // Second pass: put spin DOWN in each orbital
      const boxes: { up: boolean; down: boolean }[] = Array.from(
        { length: sub.orbitalsCount },
        () => ({ up: false, down: false })
      );

      for (let i = 0; i < count; i++) {
        if (i < sub.orbitalsCount) {
          boxes[i].up = true; // Hund's parallel spin
        } else {
          boxes[i - sub.orbitalsCount].down = true; // Pauli pairing
        }
      }

      distribution.push({
        sublevel: sub,
        electronsCount: count,
        orbitals: boxes,
      });
    }

    return distribution;
  };

  const orbitalData = calculateOrbitalBoxes(totalElectrons);

  // Formatted string: 1s² 2s² 2p⁶...
  const configString = orbitalData
    .map((item) => `${item.sublevel.name}${toSuperscript(item.electronsCount)}`)
    .join(' ');

  function toSuperscript(num: number): string {
    const digits: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    };
    return num.toString().split('').map((d) => digits[d] || d).join('');
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Configuración Electrónica Cuántica (Aufbau & Moeller)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualiza el llenado sistemático de orbitales atómicos según el principio de Aufbau, la regla de máxima multiplicidad de Hund y el principio de exclusión de Pauli.
          </p>
        </div>

        {/* Stepper & Animation Controls */}
        <div className="flex items-center gap-2">
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
            onChange={(e) => {
              setIsPlaying(false);
              setTotalElectrons(parseInt(e.target.value, 10));
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>

        {/* Written Configuration */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-sm text-sky-300 overflow-x-auto whitespace-nowrap shadow-inner">
          <span className="text-slate-500 mr-2 text-xs font-sans">Configuración electrónica:</span>
          <span className="font-bold">{configString}</span>
        </div>

        {/* Quantum Anomaly Alert if triggered */}
        {anomaly && (
          <div className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-semibold mb-0.5">
                Excepción al Principio de Aufbau Detectada:
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
          {orbitalData.map((item, idx) => (
            <div
              key={idx}
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
            Los electrones ocupan primero los orbitales de menor energía disponible siguiendo la regla de las diagonales (n + l).
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Regla de Hund:</strong>
            En orbitales degenerados (misma energía), los electrones se distribuyen desapareados con espines paralelos (↑) antes de aparearse.
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Principio de Pauli:</strong>
            Dos electrones en un mismo orbital no pueden tener los mismos números cuánticos; deben tener espines opuestos (+½ y -½).
          </div>
        </div>
      </div>
    </div>
  );
};
