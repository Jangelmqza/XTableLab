import { useState, useEffect } from 'react';
import type { ElementData } from '../../types/element';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface QuizModuleProps {
  elements: ElementData[];
}

type QuizCategory = 'symbols' | 'trends' | 'config' | 'bonds';

interface Question {
  category: QuizCategory;
  title: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Standalone question generator function
function generateQuestion(cat: QuizCategory, elements: ElementData[]): Question {
  // 1. Symbols & Names
  if (cat === 'symbols') {
    const target = elements[Math.floor(Math.random() * elements.length)];
    const isNameToSymbol = Math.random() > 0.5;

    // Distractors
    const wrong = elements
      .filter((e) => e.atomicNumber !== target.atomicNumber)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    if (isNameToSymbol) {
      const options = [target.symbol, ...wrong.map((w) => w.symbol)].sort(
        () => 0.5 - Math.random()
      );
      const correctIndex = options.indexOf(target.symbol);
      return {
        category: 'symbols',
        title: 'Símbolos Químicos',
        prompt: `¿Cuál es el símbolo químico correcto para el elemento "${target.name}" (Z = ${target.atomicNumber})?`,
        options,
        correctIndex,
        explanation: `El símbolo de ${target.name} es ${target.symbol}. Su masa atómica aproximada es ${target.atomicMass.toFixed(2)} u y pertenece a la categoría de ${target.category}.`,
      };
    } else {
      const options = [target.name, ...wrong.map((w) => w.name)].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(target.name);
      return {
        category: 'symbols',
        title: 'Nomenclatura Elemental',
        prompt: `¿A qué elemento químico corresponde el símbolo "${target.symbol}"?`,
        options,
        correctIndex,
        explanation: `El símbolo "${target.symbol}" corresponde al ${target.name} (Z = ${target.atomicNumber}), descubierto en ${target.yearDiscovered}.`,
      };
    }
  }

  // 2. Periodic Trends
  if (cat === 'trends') {
    const valid = elements.filter(
      (e) => e.electronegativity !== null && e.atomicRadius !== null && e.ionizationEnergy !== null
    );
    const e1 = valid[Math.floor(Math.random() * valid.length)];
    const e2 = valid.filter((e) => e.atomicNumber !== e1.atomicNumber)[
      Math.floor(Math.random() * (valid.length - 1))
    ];

    const trendType = Math.random();
    if (trendType < 0.33) {
      // Electronegativity
      const higher = e1.electronegativity! > e2.electronegativity! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = [higher.name, lower.name].sort(() => 0.5 - Math.random());
      return {
        category: 'trends',
        title: 'Tendencia: Electronegatividad',
        prompt: `Entre el ${e1.name} (${e1.symbol}) y el ${e2.name} (${e2.symbol}), ¿cuál posee MAYOR electronegatividad en la escala de Pauling?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} tiene una electronegatividad de ${higher.electronegativity?.toFixed(2)}, superior a la de ${lower.name} (${lower.electronegativity?.toFixed(2)}). La electronegatividad aumenta hacia arriba y a la derecha por incremento de carga nuclear efectiva Z_eff.`,
      };
    } else if (trendType < 0.66) {
      // Atomic Radius
      const higher = e1.atomicRadius! > e2.atomicRadius! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = [higher.name, lower.name].sort(() => 0.5 - Math.random());
      return {
        category: 'trends',
        title: 'Tendencia: Radio Atómico',
        prompt: `¿Cuál de estos dos elementos posee un MAYOR radio atómico: ${e1.name} o ${e2.name}?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} posee un radio de ${higher.atomicRadius} pm frente a ${lower.atomicRadius} pm de ${lower.name}. El radio atómico aumenta hacia abajo (más capas principales n) y hacia la izquierda (menor contracción por Z_eff).`,
      };
    } else {
      // Ionization Energy
      const higher = e1.ionizationEnergy! > e2.ionizationEnergy! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = [higher.name, lower.name].sort(() => 0.5 - Math.random());
      return {
        category: 'trends',
        title: 'Tendencia: 1ª Energía de Ionización',
        prompt: `¿Qué elemento requiere MAYOR energía para arrancar su electrón más externo: ${e1.name} o ${e2.name}?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} requiere ${higher.ionizationEnergy?.toFixed(2)} eV frente a ${lower.ionizationEnergy?.toFixed(2)} eV de ${lower.name}. Los átomos más pequeños y con mayor Z_eff retienen más fuertemente sus electrones.`,
      };
    }
  }

  // 3. Electron Configuration
  if (cat === 'config') {
    const interestingElements = elements.filter((e) => e.atomicNumber <= 36);
    const target = interestingElements[Math.floor(Math.random() * interestingElements.length)];
    const valenceElectrons = target.electronsPerShell[target.electronsPerShell.length - 1];

    const options = Array.from(
      new Set([valenceElectrons, (valenceElectrons % 8) + 1, Math.max(1, valenceElectrons - 1), Math.min(8, valenceElectrons + 2)])
    )
      .slice(0, 4)
      .map((n) => `${n} electrones`);

    const correctLabel = `${valenceElectrons} electrones`;
    const shuffled = options.sort(() => 0.5 - Math.random());

    return {
      category: 'config',
      title: 'Electrones de Valencia',
      prompt: `¿Cuántos electrones de valencia tiene en su capa más externa un átomo neutro de ${target.name} (${target.symbol}, Z = ${target.atomicNumber})?`,
      options: shuffled,
      correctIndex: shuffled.indexOf(correctLabel),
      explanation: `El ${target.name} presenta la configuración ${target.electronConfiguration}, con capas [${target.electronsPerShell.join(', ')}]. Su capa más externa contiene exactamente ${valenceElectrons} electrón(es) de valencia.`,
    };
  }

  // 4. Chemical Bonds
  const pairs = [
    { a: 'Na', b: 'Cl', type: 'Enlace Iónico', why: 'ΔEN = 2.23 > 1.7 entre metal alcalino y halógeno.' },
    { a: 'H', b: 'O', type: 'Enlace Covalente Polar', why: 'ΔEN = 1.24 (entre 0.4 y 1.7), creando dipolo permanente.' },
    { a: 'C', b: 'H', type: 'Enlace Covalente Apolar / Débilmente Polar', why: 'ΔEN = 0.35 < 0.4, compartición casi equitativa de carga.' },
    { a: 'K', b: 'F', type: 'Enlace Iónico', why: 'ΔEN = 3.16, transferencia total de electrones con formación de red cristalina.' },
    { a: 'N', b: 'N', type: 'Enlace Covalente No Polar', why: 'ΔEN = 0.00 entre átomos idénticos, compartición simétrica.' },
    { a: 'Cu', b: 'Zn', type: 'Enlace Metálico', why: 'Unión entre dos metales electropositivos con mar de electrones.' },
  ];
  const chosen = pairs[Math.floor(Math.random() * pairs.length)];
  const bondOptions = [
    'Enlace Iónico',
    'Enlace Covalente Polar',
    'Enlace Covalente No Polar',
    'Enlace Metálico',
  ];

  return {
    category: 'bonds',
    title: 'Predicción de Enlace Químico',
    prompt: `¿Qué tipo de enlace predomina entre átomos de ${chosen.a} y ${chosen.b}?`,
    options: bondOptions,
    correctIndex: bondOptions.indexOf(chosen.type),
    explanation: `${chosen.why}`,
  };
}

export const QuizModule: React.FC<QuizModuleProps> = ({ elements }) => {
  const [category, setCategory] = useState<QuizCategory>('symbols');
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() =>
    generateQuestion('symbols', elements)
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Persistent stats from localStorage
  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('xtablelab_quiz_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [totalAnswered, setTotalAnswered] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('xtablelab_quiz_total');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState<number>(0);

  const [bestStreak, setBestStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('xtablelab_quiz_best_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Save stats on change
  useEffect(() => {
    try {
      localStorage.setItem('xtablelab_quiz_score', score.toString());
      localStorage.setItem('xtablelab_quiz_total', totalAnswered.toString());
      localStorage.setItem('xtablelab_quiz_best_streak', bestStreak.toString());
    } catch {
      // Ignorar en caso de cuota de storage llena o modo privado estricto
    }
  }, [score, totalAnswered, bestStreak]);

  const handleResetStats = () => {
    if (window.confirm('¿Deseas reiniciar tus estadísticas de aciertos y rachas acumuladas?')) {
      setScore(0);
      setTotalAnswered(0);
      setStreak(0);
      setBestStreak(0);
      try {
        localStorage.removeItem('xtablelab_quiz_score');
        localStorage.removeItem('xtablelab_quiz_total');
        localStorage.removeItem('xtablelab_quiz_best_streak');
      } catch {
        //
      }
    }
  };

  const nextQuestion = (cat: QuizCategory = category) => {
    setSelectedIndex(null);
    setCurrentQuestion(generateQuestion(cat, elements));
  };

  const handleCategoryChange = (newCat: QuizCategory) => {
    setCategory(newCat);
    nextQuestion(newCat);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedIndex !== null || !currentQuestion) return;
    setSelectedIndex(idx);
    setTotalAnswered((t) => t + 1);

    if (idx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Módulo Didáctico de Evaluación & Quizzes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pon a prueba tu comprensión de nomenclatura, tendencias periódicas, configuraciones electrónicas y enlaces químicos con retroalimentación inmediata.
          </p>
        </div>

        {/* Score & Streak Stats */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold" title="Aciertos acumulados">
            <Trophy className="w-4 h-4" />
            <span>
              {score}/{totalAnswered} ({totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-bold" title="Racha actual">
            <Flame className="w-4 h-4" />
            <span>Racha: {streak}</span>
          </div>

          {bestStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-slate-400 font-medium text-[11px]" title="Mejor racha histórica">
              <span>(Récord: <strong className="text-amber-300">{bestStreak}</strong>)</span>
            </div>
          )}

          {totalAnswered > 0 && (
            <button
              type="button"
              onClick={handleResetStats}
              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
              title="Reiniciar estadísticas del quiz"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
        {[
          { key: 'symbols', label: 'Símbolos & Nombres' },
          { key: 'trends', label: 'Tendencias Periódicas' },
          { key: 'config', label: 'Electrones & Cuántica' },
          { key: 'bonds', label: 'Predicción de Enlaces' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key as QuizCategory)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              category === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
              {currentQuestion.title}
            </span>
            <span className="text-xs text-slate-500">Pregunta de selección múltiple</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion.prompt}
          </h3>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt, idx) => {
              let optionStyle = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';

              if (selectedIndex !== null) {
                if (idx === currentQuestion.correctIndex) {
                  optionStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-200 font-bold';
                } else if (idx === selectedIndex) {
                  optionStyle = 'bg-rose-950/50 border-rose-500 text-rose-200';
                } else {
                  optionStyle = 'opacity-40 bg-slate-950/40 border-slate-900';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedIndex !== null}
                  className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between shadow-inner ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {selectedIndex !== null && idx === currentQuestion.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {selectedIndex !== null &&
                    idx === selectedIndex &&
                    idx !== currentQuestion.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 ml-2" />
                    )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Answer */}
          {selectedIndex !== null && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                selectedIndex === currentQuestion.correctIndex
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-sm">
                {selectedIndex === currentQuestion.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>¡Correcto! Excelente razonamiento.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Incorrecto. Revisa el fundamento teórico:</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-slate-300">{currentQuestion.explanation}</p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => nextQuestion()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <span>Siguiente Pregunta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
