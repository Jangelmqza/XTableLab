import { useState } from 'react';
import type { ElementData } from '../../types/element';
import { Flame, Sparkles, Info } from 'lucide-react';

interface ChemicalBondSimulatorProps {
  elements: ElementData[];
  initialElement?: ElementData | null;
}

export const ChemicalBondSimulator: React.FC<ChemicalBondSimulatorProps> = ({
  elements,
  initialElement,
}) => {
  // Elements with valid electronegativities
  const validElements = elements.filter((e) => e.electronegativity !== null);

  const [elementA, setElementA] = useState<ElementData>(
    initialElement || elements.find((e) => e.symbol === 'Na') || elements[0]
  );
  const [elementB, setElementB] = useState<ElementData>(
    elements.find((e) => e.symbol === 'Cl') || elements[16]
  );

  const enA = elementA.electronegativity ?? 0;
  const enB = elementB.electronegativity ?? 0;
  const deltaEN = Math.abs(enA - enB);

  // Pauling's formula for % ionic character:
  // % Ionic = (1 - exp(-0.25 * deltaEN^2)) * 100%
  const ionicPercentage = Math.round((1 - Math.exp(-0.25 * Math.pow(deltaEN, 2))) * 100);
  const covalentPercentage = 100 - ionicPercentage;

  // Determine bond type
  const isMetalA = elementA.category.includes('metal') && !elementA.category.includes('metalloid');
  const isMetalB = elementB.category.includes('metal') && !elementB.category.includes('metalloid');

  let bondClass = '';
  let bondTitle = '';
  let bondBadge = '';
  let bondDescription = '';

  if (isMetalA && isMetalB) {
    bondClass = 'metallic';
    bondTitle = 'Enlace Metálico';
    bondBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    bondDescription = `Al interactuar dos metales electropositivos (${elementA.name} y ${elementB.name}), los electrones de valencia se deslocalizan en un 'mar de electrones' colectivo que baña a los cationes metálicos empaquetados. Esto produce aleaciones o fases intermetálicas con conductividad térmica y eléctrica excepcionales.`;
  } else if (deltaEN > 1.7) {
    bondClass = 'ionic';
    bondTitle = 'Enlace Iónico Predominante';
    bondBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    const cation = enA < enB ? elementA : elementB;
    const anion = cation === elementA ? elementB : elementA;
    bondDescription = `La diferencia de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}) supera el umbral estándar de 1.7. ${cation.name} cede sus electrones de valencia a ${anion.name}, formándose un catión (${cation.symbol}⁺) y un anión (${anion.symbol}⁻) unidos por intensas atracciones electrostáticas omnidireccionales (red cristalina iónica).`;
  } else if (deltaEN >= 0.4) {
    bondClass = 'polar-covalent';
    bondTitle = 'Enlace Covalente Polar';
    bondBadge = 'bg-sky-500/20 text-sky-300 border-sky-500/50';
    const negative = enA > enB ? elementA : elementB;
    const positive = negative === elementA ? elementB : elementA;
    bondDescription = `La diferencia moderada de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}) provoca que el par de electrones del enlace sea atraído con mayor densidad hacia el átomo de ${negative.name} (adquiriendo carga parcial negativa δ⁻), dejando a ${positive.name} con carga parcial positiva (δ⁺) y creando un momento dipolar permanente.`;
  } else {
    bondClass = 'nonpolar-covalent';
    bondTitle = 'Enlace Covalente Apolar (No Polar)';
    bondBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
    bondDescription = `La diferencia de electronegatividad es casi nula (ΔEN = ${deltaEN.toFixed(2)} < 0.4). Los electrones se comparten con una distribución de densidad espacialmente simétrica y uniforme entre ambos núcleos, sin momentos dipolares permanentes significativos.`;
  }

  // Quick preset pairs
  const presetPairs = [
    { name: 'Cloruro de sodio (NaCl)', symA: 'Na', symB: 'Cl' },
    { name: 'Agua (H-O)', symA: 'H', symB: 'O' },
    { name: 'Ácido clorhídrico (HCl)', symA: 'H', symB: 'Cl' },
    { name: 'Metano (C-H)', symA: 'C', symB: 'H' },
    { name: 'Fluoruro de potasio (KF)', symA: 'K', symB: 'F' },
    { name: 'Oxígeno diatómico (O₂)', symA: 'O', symB: 'O' },
    { name: 'Latón / Aleación (Cu-Zn)', symA: 'Cu', symB: 'Zn' },
  ];

  const loadPreset = (symA: string, symB: string) => {
    const a = elements.find((e) => e.symbol === symA);
    const b = elements.find((e) => e.symbol === symB);
    if (a && b) {
      setElementA(a);
      setElementB(b);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500" />
            Simulador Didáctico de Enlaces Químicos (ΔEN)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Selecciona dos elementos para calcular su diferencia de electronegatividad (escala de Pauling), estimar el porcentaje de carácter iónico y visualizar el comportamiento de la densidad electrónica.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Ejemplos:</span>
          {presetPairs.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p.symA, p.symB)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
            >
              {p.symA}-{p.symB}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors and Bond Gauge Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Element A Selector */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Elemento A
            </span>
            <select
              value={elementA.atomicNumber}
              onChange={(e) => {
                const z = parseInt(e.target.value, 10);
                const found = elements.find((el) => el.atomicNumber === z);
                if (found) setElementA(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              {validElements.map((el) => (
                <option key={el.atomicNumber} value={el.atomicNumber}>
                  {el.atomicNumber}. {el.name} ({el.symbol}) - EN: {el.electronegativity?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Element A Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="w-14 h-16 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex flex-col items-center justify-center font-mono">
              <span className="text-[10px] text-slate-400 font-bold">{elementA.atomicNumber}</span>
              <span className="text-2xl font-black">{elementA.symbol}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{elementA.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Electronegatividad:{' '}
                <strong className="text-sky-300 font-bold text-sm">
                  {enA ? enA.toFixed(2) : 'N/D'}
                </strong>
              </p>
              <span className="text-[11px] text-slate-400">{elementA.category}</span>
            </div>
          </div>
        </div>

        {/* Delta EN Center Gauge (4 cols) */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col items-center justify-between text-center space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Diferencia de Electronegatividad
          </span>

          <div>
            <span className="text-xs text-slate-400 block mb-1">
              |EN({elementA.symbol}) - EN({elementB.symbol})|
            </span>
            <span className="text-4xl font-black font-mono text-amber-400 drop-shadow-md">
              ΔEN = {deltaEN.toFixed(2)}
            </span>
          </div>

          {/* Pauling's % Ionic Character */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-sky-300">Carácter Covalente: {covalentPercentage}%</span>
              <span className="text-rose-300">Carácter Iónico: {ionicPercentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${covalentPercentage}%` }}
                className="bg-sky-500 h-full transition-all duration-300"
              />
              <div
                style={{ width: `${ionicPercentage}%` }}
                className="bg-rose-500 h-full transition-all duration-300"
              />
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bondBadge}`}>
            {bondTitle}
          </span>
        </div>

        {/* Element B Selector */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Elemento B
            </span>
            <select
              value={elementB.atomicNumber}
              onChange={(e) => {
                const z = parseInt(e.target.value, 10);
                const found = elements.find((el) => el.atomicNumber === z);
                if (found) setElementB(found);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              {validElements.map((el) => (
                <option key={el.atomicNumber} value={el.atomicNumber}>
                  {el.atomicNumber}. {el.name} ({el.symbol}) - EN: {el.electronegativity?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Element B Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="w-14 h-16 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex flex-col items-center justify-center font-mono">
              <span className="text-[10px] text-slate-400 font-bold">{elementB.atomicNumber}</span>
              <span className="text-2xl font-black">{elementB.symbol}</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{elementB.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Electronegatividad:{' '}
                <strong className="text-rose-300 font-bold text-sm">
                  {enB ? enB.toFixed(2) : 'N/D'}
                </strong>
              </p>
              <span className="text-[11px] text-slate-400">{elementB.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphical Electron Cloud Simulation & Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Modelo Gráfico del Enlace y Nube Electrónica
        </h3>

        {/* SVG Diagram */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <svg width="460" height="150" viewBox="0 0 460 150" className="overflow-visible select-none max-w-full">
            {/* Connecting Bond Axis */}
            <line x1="120" y1="75" x2="340" y2="75" stroke="rgba(100, 116, 139, 0.4)" strokeDasharray="4 4" strokeWidth="2" />

            {/* Electron density cloud representation */}
            {bondClass === 'ionic' && (
              <>
                {/* Arrow of complete electron transfer */}
                <path
                  d={enA < enB ? "M 150 50 Q 230 10 310 50" : "M 310 50 Q 230 10 150 50"}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                <text x="230" y="25" fill="#f43f5e" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Transferencia total de e⁻
                </text>
              </>
            )}

            {bondClass === 'polar-covalent' && (
              <>
                {/* Dipole Moment Arrow */}
                <line
                  x1={enA < enB ? 170 : 290}
                  y1="35"
                  x2={enA < enB ? 290 : 170}
                  y2="35"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />
                <polygon
                  points={enA < enB ? "290,30 300,35 290,40" : "170,30 160,35 170,40"}
                  fill="#38bdf8"
                />
                <line
                  x1={enA < enB ? 170 : 290}
                  y1="28"
                  x2={enA < enB ? 170 : 290}
                  y2="42"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="230" y="25" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Momento Dipolar (μ)
                </text>
              </>
            )}

            {bondClass === 'nonpolar-covalent' && (
              <>
                <ellipse cx="230" cy="75" rx="55" ry="32" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1.5" />
                <text x="230" y="25" fill="#34d399" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Compartición Equitativa
                </text>
              </>
            )}

            {/* Atom A */}
            <circle cx="120" cy="75" r="32" fill="#0284c7" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="120" y="79" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {elementA.symbol}
            </text>
            <text x="120" y="125" fill="#94a3b8" fontSize="11" textAnchor="middle">
              {bondClass === 'ionic'
                ? enA < enB ? 'Catión (+)' : 'Anión (-)'
                : bondClass === 'polar-covalent'
                ? enA < enB ? 'Carga δ⁺' : 'Carga δ⁻'
                : 'Carga neutra'}
            </text>

            {/* Atom B */}
            <circle cx="340" cy="75" r="32" fill="#e11d48" fillOpacity="0.3" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="340" y="79" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {elementB.symbol}
            </text>
            <text x="340" y="125" fill="#94a3b8" fontSize="11" textAnchor="middle">
              {bondClass === 'ionic'
                ? enB < enA ? 'Catión (+)' : 'Anión (-)'
                : bondClass === 'polar-covalent'
                ? enB < enA ? 'Carga δ⁺' : 'Carga δ⁻'
                : 'Carga neutra'}
            </text>
          </svg>
        </div>

        {/* Detailed Explanation Text */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Info className="w-4 h-4" />
            Justificación Química Didáctica
          </div>
          <p className="leading-relaxed">{bondDescription}</p>
        </div>
      </div>
    </div>
  );
};
