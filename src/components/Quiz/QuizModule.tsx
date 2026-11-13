import { useState, useEffect } from 'react';
import type { ElementData } from '../../types/element';
import {
  generateQuestion,
  type QuizCategory,
  type Question,
} from '../../utils/quizGenerator';
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
            Módulo Didáctico de Evaluación &amp; Quizzes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pon a prueba tu comprensión de nomenclatura, tendencias periódicas, configuraciones electrónicas y enlaces químicos con retroalimentación inmediata.
          </p>
        </div>

        {/* Score & Streak Stats */}
        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-3 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800"
        >
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
              aria-label="Reiniciar estadísticas del quiz"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category selector */}
      <div
        role="tablist"
        aria-label="Categorías del quiz"
        className="flex flex-wrap gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800"
      >
        {[
          { key: 'symbols', label: 'Símbolos & Nombres' },
          { key: 'trends', label: 'Tendencias Periódicas' },
          { key: 'config', label: 'Electrones & Cuántica' },
          { key: 'bonds', label: 'Predicción de Enlaces' },
        ].map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={category === tab.key}
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
                  aria-pressed={selectedIndex === idx}
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
              role="status"
              aria-live="polite"
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
