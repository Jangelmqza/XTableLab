import { X, Atom, CheckCircle, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Atom className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                XTableLab
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Herramienta Universitaria de Aprendizaje Cuántico
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-4">
            <h3 className="font-bold text-sky-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Objetivo Pedagógico Principal
            </h3>
            <p>
              Diseñada específicamente para estudiantes universitarios (química general, inorgánica, ingeniería, biología y medicina). El propósito central es que el estudiante <strong>comprenda por qué la tabla está organizada así</strong> a partir de principios cuánticos y periódicos fundamentales, y no solo que la consulte como un catálogo de datos.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-xs tracking-wider">
              Módulos Implementados en la Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tabla Completa de los 118 Elementos IUPAC:</strong> datos validados de radios, electronegatividades, energías de ionización, afinidades, densidades y estados estándar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mapas de Calor y Tendencias Periódicas:</strong> gradiente visual continuo con justificación de la carga nuclear efectiva (Z_eff) y apantallamiento.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Termostato Interactivo:</strong> simulación de cambio de fase (sólido, líquido, gas) desde 0 K hasta 6000 K en tiempo real.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulador del Átomo e Isótopos:</strong> modelo de Bohr dinámico con balance de carga neta, número másico y estabilidad nuclear.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulador Cuántico de Aufbau:</strong> diagrama de Moeller, principio de exclusión de Pauli y regla de multiplicidad de Hund con orbitales y espines.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulador de Enlaces Químicos:</strong> cálculo de $\Delta EN$ y carácter iónico según Pauling con dipolo permanente y compartición de carga.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Comparador Paramétrico:</strong> contrasta 2 o 3 elementos químicos y predice su reactividad mutua.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Módulo de Quizzes Didácticos:</strong> autoevaluación con explicación inmediata para fijar conceptos.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400">
            <strong>Fuentes de Validación Científica:</strong> IUPAC (International Union of Pure and Applied Chemistry) y NIST Physical Reference Data.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow"
          >
            Entendido, ¡Explorar!
          </button>
        </div>
      </div>
    </div>
  );
};
