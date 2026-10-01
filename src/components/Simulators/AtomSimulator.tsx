import { useState } from 'react';
import type { ElementData } from '../../types/element';
import { Atom, Plus, Minus, RotateCcw, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface AtomSimulatorProps {
  elements: ElementData[];
  initialElement?: ElementData | null;
}

export const AtomSimulator: React.FC<AtomSimulatorProps> = ({ elements, initialElement }) => {
  // Protons, Neutrons, Electrons state
  const defaultZ = initialElement ? initialElement.atomicNumber : 6; // Carbon default
  const defaultMass = initialElement ? Math.round(initialElement.atomicMass) : 12;
  const defaultN = Math.max(0, defaultMass - defaultZ);

  const [protons, setProtons] = useState(defaultZ);
  const [neutrons, setNeutrons] = useState(defaultN);
  const [electrons, setElectrons] = useState(defaultZ);

  // Find active element based on Z
  const activeElement = elements.find((e) => e.atomicNumber === protons) || null;

  // Mass number A
  const massNumber = protons + neutrons;

  // Net charge
  const netCharge = protons - electrons;

  // Nuclear stability check
  // For Z <= 20: N/Z around 1.0 is stable
  // For 20 < Z <= 82: N/Z increases up to ~1.5
  // For Z > 82: All isotopes are radioactive
  const checkStability = (): { isStable: boolean; reason: string } => {
    if (protons === 0) return { isStable: false, reason: 'Se requiere al menos 1 protón para un núcleo atómico.' };
    if (protons === 1 && neutrons === 0) return { isStable: true, reason: 'Protio (¹H): Isótopo estable más simple sin neutrones.' };
    if (protons === 1 && neutrons === 1) return { isStable: true, reason: 'Deuterio (²H): Isótopo estable del hidrógeno.' };
    if (protons === 1 && neutrons === 2) return { isStable: false, reason: 'Tritio (³H): Radiactivo (emisión β⁻, vida media 12.3 años).' };
    if (protons > 82) return { isStable: false, reason: 'Elemento superpesado (Z > 82). Todos los núcleos son intrínsecamente radiactivos.' };

    const ratio = neutrons / protons;
    let idealRatio = 1.0;
    if (protons > 20) {
      idealRatio = 1.0 + ((protons - 20) / 62) * 0.5; // up to ~1.5 at Pb (82)
    }

    if (Math.abs(ratio - idealRatio) < 0.22 && neutrons >= protons - 2) {
      return { isStable: true, reason: `Isótopo estable dentro del cinturón de estabilidad nuclear (relación N/Z = ${ratio.toFixed(2)}).` };
    } else if (ratio < idealRatio) {
      return { isStable: false, reason: `Déficit de neutrones (N/Z = ${ratio.toFixed(2)}). Propenso a decaimiento por emisión de positrones (β⁺) o captura electrónica.` };
    } else {
      return { isStable: false, reason: `Exceso de neutrones (N/Z = ${ratio.toFixed(2)}). Propenso a decaimiento por emisión de electrones (β⁻).` };
    }
  };

  const stability = checkStability();

  // Distribute electrons into Bohr shells: 2, 8, 18, 32...
  const calculateShells = (totalE: number): number[] => {
    if (totalE <= 0) return [];
    if (activeElement && totalE === activeElement.atomicNumber) {
      return activeElement.electronsPerShell;
    }
    const maxCapacity = [2, 8, 18, 32, 50, 72];
    const res: number[] = [];
    let rem = totalE;
    for (const cap of maxCapacity) {
      if (rem <= 0) break;
      const count = Math.min(rem, cap);
      res.push(count);
      rem -= count;
    }
    return res;
  };

  const currentShells = calculateShells(electrons);

  // Load a preset
  const loadElement = (z: number) => {
    const el = elements.find((e) => e.atomicNumber === z);
    if (!el) return;
    setProtons(el.atomicNumber);
    const m = Math.round(el.atomicMass);
    setNeutrons(Math.max(0, m - el.atomicNumber));
    setElectrons(el.atomicNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Atom className="w-6 h-6 text-sky-400" />
            Simulador Interactivo del Átomo e Isótopos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modifica protones, neutrones y electrones para observar la formación de elementos, calcular la carga neta y verificar la estabilidad nuclear en el cinturón de núclidos.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Cargar átomo:</span>
          {[
            { z: 1, label: '¹H' },
            { z: 6, label: '¹²C' },
            { z: 7, label: '¹⁴N' },
            { z: 8, label: '¹⁶O' },
            { z: 11, label: '²³Na' },
            { z: 26, label: '⁵⁶Fe' },
            { z: 79, label: '¹⁹⁷Au' },
            { z: 92, label: '²³⁸U' },
          ].map((preset) => (
            <button
              key={preset.z}
              onClick={() => loadElement(preset.z)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => {
              setProtons(1);
              setNeutrons(0);
              setElectrons(1);
            }}
            title="Reiniciar a Hidrógeno neutro"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Particle Controls (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Protons Control */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                Protones (p⁺)
              </span>
              <span className="text-xs text-slate-400">Define el elemento (Z)</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setProtons((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-3xl font-black font-mono text-white">{protons}</span>
              <button
                onClick={() => setProtons((p) => Math.min(118, p + 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Neutrons Control */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
                Neutrones (n⁰)
              </span>
              <span className="text-xs text-slate-400">Estabilidad e isótopos</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setNeutrons((n) => Math.max(0, n - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-3xl font-black font-mono text-white">{neutrons}</span>
              <button
                onClick={() => setNeutrons((n) => Math.min(180, n + 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-indigo-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Electrons Control */}
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                Electrones (e⁻)
              </span>
              <span className="text-xs text-slate-400">Carga neta y química</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setElectrons((e) => Math.max(0, e - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-3xl font-black font-mono text-white">{electrons}</span>
              <button
                onClick={() => setElectrons((e) => Math.min(118, e + 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-900/40 text-white flex items-center justify-center border border-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Balance Button */}
          <button
            onClick={() => setElectrons(protons)}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Neutralizar átomo (e⁻ = p⁺)
          </button>
        </div>

        {/* Central Bohr Canvas (Middle 5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[380px]">
          <div className="absolute top-3 left-4 text-xs font-mono text-slate-500">
            Capas cuánticas K, L, M, N...
          </div>

          {/* SVG Atomic Model */}
          <div className="relative w-[320px] h-[320px] flex items-center justify-center">
            <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible">
              {/* Concentric Shells */}
              {currentShells.map((count, idx) => {
                const r = 36 + idx * 24;
                return (
                  <g key={`orbit-${idx}`}>
                    <circle
                      cx="160"
                      cy="160"
                      r={r}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.3)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {Array.from({ length: count }, (_, eIdx) => {
                      const angle = (2 * Math.PI * eIdx) / count - Math.PI / 2;
                      const cx = 160 + r * Math.cos(angle);
                      const cy = 160 + r * Math.sin(angle);
                      return (
                        <circle
                          key={`e-${idx}-${eIdx}`}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#38bdf8"
                          filter="drop-shadow(0 0 6px #0284c7)"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Nucleus Core */}
              <circle
                cx="160"
                cy="160"
                r="26"
                fill="url(#nucleus-sim-grad)"
                stroke="#e11d48"
                strokeWidth="2"
                filter="drop-shadow(0 0 15px rgba(225, 29, 72, 0.6))"
              />
              <text
                x="160"
                y="157"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="black"
                fontFamily="monospace"
              >
                {activeElement ? activeElement.symbol : 'X'}
              </text>
              <text
                x="160"
                y="172"
                textAnchor="middle"
                fill="#fecdd3"
                fontSize="8.5"
                fontWeight="bold"
              >
                {protons}p | {neutrons}n
              </text>

              <defs>
                <radialGradient id="nucleus-sim-grad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="70%" stopColor="#9f1239" />
                  <stop offset="100%" stopColor="#4c0519" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Shell breakdown bar */}
          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {currentShells.map((count, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
              >
                n={i + 1}: <strong className="text-sky-400">{count}e⁻</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Real-Time Atom Status & Isotope Card (Right 3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Identity & Isotope Symbol */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Identidad Atómica
            </h3>

            <div className="flex items-center gap-3">
              {/* Standard Nuclide Notation: ^A_Z X */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center font-mono">
                <div className="flex flex-col text-[11px] text-right font-bold text-slate-400 leading-tight mr-1">
                  <span>{massNumber}</span>
                  <span>{protons}</span>
                </div>
                <span className="text-2xl font-black text-white">
                  {activeElement ? activeElement.symbol : 'X'}
                </span>
                {netCharge !== 0 && (
                  <sup className="text-xs font-bold text-amber-400 ml-0.5">
                    {netCharge > 0 ? `+${netCharge}` : `${netCharge}`}
                  </sup>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {activeElement ? activeElement.name : 'Elemento Desconocido'}
                </h4>
                <span className="text-xs text-slate-400">
                  {activeElement ? activeElement.category : 'N/A'}
                </span>
              </div>
            </div>

            {/* Net charge badge */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Estado electrostático:</span>
                <span
                  className={`font-bold ${
                    netCharge === 0
                      ? 'text-emerald-400'
                      : netCharge > 0
                      ? 'text-rose-400'
                      : 'text-sky-400'
                  }`}
                >
                  {netCharge === 0
                    ? 'Átomo Neutro (0)'
                    : netCharge > 0
                    ? `Catión (+${netCharge})`
                    : `Anión (${netCharge})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Número Másico (A = p + n):</span>
                <span className="font-mono font-bold text-white">{massNumber} u</span>
              </div>
            </div>
          </div>

          {/* Nuclear Stability */}
          <div
            className={`border rounded-2xl p-4 shadow-xl space-y-2 ${
              stability.isStable
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {stability.isStable ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <h4 className="text-sm font-bold">
                {stability.isStable ? 'Núcleo Estable' : 'Núcleo Inestable / Radiactivo'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{stability.reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
