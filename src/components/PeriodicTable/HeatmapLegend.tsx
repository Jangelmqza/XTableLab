import React from 'react';
import type { TrendProperty } from '../../types/element';
import { TREND_INFO } from '../../utils/trends';
import { Info, TrendingUp } from 'lucide-react';

interface HeatmapLegendProps {
  trend: TrendProperty;
  minVal: number;
  maxVal: number;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = ({ trend, minVal, maxVal }) => {
  const info = TREND_INFO[trend];

  return (
    <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 shadow-xl backdrop-blur-md mb-4 text-xs sm:text-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              Tendencia Periódica: {info.label}
              <span className="text-xs font-mono text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/50">
                {info.unit}
              </span>
            </h3>
            <p className="text-slate-400 text-xs">{info.description}</p>
          </div>
        </div>

        {/* Min / Max Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-slate-400 block">Mínimo registrado</span>
            <span className="font-mono font-medium text-indigo-300">{info.format(minVal)}</span>
          </div>
          <div className="w-48 h-3.5 rounded-full shadow-inner border border-slate-700 overflow-hidden relative"
            style={{
              background: 'linear-gradient(to right, rgb(76, 29, 149), rgb(2, 132, 199), rgb(5, 150, 105), rgb(217, 119, 6), rgb(225, 29, 72))'
            }}
          />
          <div>
            <span className="text-slate-400 block">Máximo registrado</span>
            <span className="font-mono font-medium text-rose-300">{info.format(maxVal)}</span>
          </div>
        </div>
      </div>

      {/* Didactic explanation card */}
      <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2 text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="text-amber-300 font-medium">¿Por qué sigue esta tendencia a nivel cuántico y atómico? </span>
          <span>{info.whyTrends}</span>
        </div>
      </div>
    </div>
  );
};
