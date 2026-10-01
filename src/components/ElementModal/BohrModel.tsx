import React from 'react';
import type { ElementData } from '../../types/element';

interface BohrModelProps {
  element: ElementData;
  size?: number;
}

export const BohrModel: React.FC<BohrModelProps> = ({ element, size = 260 }) => {
  const shells = element.electronsPerShell || [1];
  const center = size / 2;
  const maxRadius = center - 16;
  const minRadius = 32;
  const shellCount = shells.length;
  const radiusStep = shellCount > 1 ? (maxRadius - minRadius) / (shellCount - 1) : 0;

  const shellNames = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none drop-shadow-md"
        >
          {/* Subtle background glow */}
          <circle
            cx={center}
            cy={center}
            r={center - 8}
            fill="rgba(15, 23, 42, 0.4)"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeDasharray="4 4"
          />

          {/* Electron orbits */}
          {shells.map((electronCount, shellIdx) => {
            const r = shellCount === 1 ? center / 2 : minRadius + shellIdx * radiusStep;
            return (
              <g key={`shell-${shellIdx}`}>
                {/* Orbit ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.25)"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />

                {/* Electrons on this orbit */}
                {Array.from({ length: electronCount }, (_, eIdx) => {
                  const angle = (2 * Math.PI * eIdx) / electronCount - Math.PI / 2;
                  const cx = center + r * Math.cos(angle);
                  const cy = center + r * Math.sin(angle);

                  return (
                    <g key={`electron-${shellIdx}-${eIdx}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="#38bdf8"
                        className="transition-all hover:scale-150 duration-150"
                        filter="drop-shadow(0 0 4px #0284c7)"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r="1.5"
                        fill="#ffffff"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Nucleus */}
          <circle
            cx={center}
            cy={center}
            r="20"
            fill="url(#nucleus-gradient)"
            stroke="rgba(244, 63, 94, 0.8)"
            strokeWidth="2"
            filter="drop-shadow(0 0 10px rgba(244, 63, 94, 0.6))"
          />
          <text
            cx={center}
            cy={center - 2}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {element.symbol}
          </text>
          <text
            cx={center}
            cy={center + 10}
            textAnchor="middle"
            fill="#fecdd3"
            fontSize="7.5"
            fontWeight="600"
          >
            {element.atomicNumber}p⁺
          </text>

          {/* Gradients */}
          <defs>
            <radialGradient id="nucleus-gradient" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="60%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Shell legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        {shells.map((count, idx) => (
          <span
            key={`legend-${idx}`}
            className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] flex items-center gap-1.5 shadow"
          >
            <span className="text-sky-400 font-semibold">{shellNames[idx] || `n=${idx + 1}`}:</span>
            <span className="font-bold text-white">{count} e⁻</span>
          </span>
        ))}
      </div>
    </div>
  );
};
