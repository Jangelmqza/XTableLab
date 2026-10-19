import type { TrendProperty, TrendInfo, ElementData } from '../types/element';

export type HeatmapPalette = 'standard' | 'colorblind';

export const TREND_INFO: Record<TrendProperty, TrendInfo> = {
  electronegativity: {
    label: 'Electronegatividad',
    unit: 'Escala de Pauling',
    description: 'Medida de la capacidad relativa de un átomo en una molécula para atraer hacia sí el par de electrones del enlace.',
    whyTrends: 'Aumenta hacia arriba y hacia la derecha en la tabla. Al aumentar la carga nuclear efectiva (Z_eff) a lo largo de un periodo sin añadir nuevas capas, los electrones son atraídos con mayor fuerza. Al descender en un grupo, el apantallamiento de capas internas disminuye la atracción del núcleo.',
    higherIs: 'Mayor atracción por electrones (Flúor: 3.98)',
    lowerIs: 'Menor atracción / electropositivo (Francio: 0.70, Cesio: 0.79)',
    format: (v) => (v !== null ? v.toFixed(2) : 'N/D')
  },
  atomicRadius: {
    label: 'Radio Atómico (van der Waals)',
    unit: 'pm (picómetros)',
    description: 'Distancia efectiva desde el núcleo atómico hasta el límite externo de su nube electrónica (radio de van der Waals / empírico IUPAC).',
    whyTrends: 'Aumenta hacia abajo y hacia la izquierda. Disminuye a lo largo de un periodo debido al incremento de la carga nuclear efectiva (Z_eff) que contrae la nube electrónica. Aumenta al descender en un grupo al incorporarse nuevos niveles cuánticos principales (n).',
    higherIs: 'Átomos más voluminosos (Francio: 348 pm, Cesio: 343 pm)',
    lowerIs: 'Átomos más compactos (Hidrógeno: 120 pm, Flúor: 135 pm, Helio: 140 pm)',
    format: (v) => (v !== null ? `${v} pm` : 'N/D')
  },
  ionizationEnergy: {
    label: '1ª Energía de Ionización',
    unit: 'eV',
    description: 'Energía mínima necesaria para arrancar el electrón más débilmente retenido de un átomo neutro en fase gaseosa.',
    whyTrends: 'Aumenta hacia arriba y hacia la derecha. Cuanto más pequeño es el átomo y mayor la carga nuclear efectiva, más fuertemente ligado está el electrón. Presenta discontinuidades didácticas entre grupos 2-13 (subcapa s llena) y 15-16 (repulsión por apareamiento en p).',
    higherIs: 'Difícil de oxidar / ionizar (Helio: 24.59 eV)',
    lowerIs: 'Fácilmente oxidable / reactivo (Cesio: 3.89 eV)',
    format: (v) => (v !== null ? `${v.toFixed(2)} eV (${(v * 96.485).toFixed(0)} kJ/mol)` : 'N/D')
  },
  electronAffinity: {
    label: 'Afinidad Electrónica',
    unit: 'eV',
    description: 'Energía liberada cuando un átomo neutro en fase gaseosa capta un electrón adicional para formar un ion mononegativo.',
    whyTrends: 'Tiende a ser más exotérmica (mayor magnitud) hacia arriba y hacia la derecha. Los halógenos presentan los valores más altos al necesitar un solo electrón para completar su octeto. El Cloro (3.62 eV) supera al Flúor (3.34 eV) por menor repulsión interelectrónica en la subcapa 3p.',
    higherIs: 'Gran tendencia a captar electrones (Cloro: 3.62 eV)',
    lowerIs: 'Poca o nula tendencia (Gases nobles y subcapas cerradas: N/D o ≤ 0 eV)',
    format: (v) => (v !== null ? `${v.toFixed(2)} eV` : 'N/D')
  },
  density: {
    label: 'Densidad (en estado estándar)',
    unit: 'g/cm³',
    description: 'Relación entre la masa atómica compactada y el volumen ocupado por la red cristalina o fase a 298 K.',
    whyTrends: 'Alcanza su máximo en el centro del bloque d (periodo 6: Osmio con 22.57 g/cm³ e Iridio con 22.42 g/cm³), donde el empaquetamiento compacto de la contracción lantánida y la alta masa atómica coinciden.',
    higherIs: 'Metales ultradensos (Osmio: 22.57 g/cm³, Iridio: 22.42 g/cm³)',
    lowerIs: 'Gases y metales ligeros (Hidrógeno: 0.090 mg/cm³, Litio: 0.53 g/cm³)',
    format: (v) => (v !== null ? (v < 0.01 ? `${(v * 1000).toFixed(3)} mg/cm³` : `${v.toFixed(2)} g/cm³`) : 'N/D')
  },
  meltingPoint: {
    label: 'Punto de Fusión',
    unit: 'K (°C)',
    description: 'Temperatura a la cual la fase sólida y la fase líquida coexisten en equilibrio termodinámico a 1 atm.',
    whyTrends: 'Alcanza su pico en elementos con enlaces covalentes reticulares (Carbono: ~3823 K) o metales refractarios con máxima ocupación de orbitales enlazantes d (Wolframio: 3695 K).',
    higherIs: 'Materiales refractarios (Carbono: 3823 K, Wolframio: 3695 K)',
    lowerIs: 'Fluidos criogénicos (Helio: 0.95 K / -272.2 °C)',
    format: (v) => (v !== null ? `${v.toFixed(1)} K (${(v - 273.15).toFixed(1)} °C)` : 'N/D')
  },
  boilingPoint: {
    label: 'Punto de Ebullición',
    unit: 'K (°C)',
    description: 'Temperatura a la cual la presión de vapor del líquido iguala la presión atmosférica estándar.',
    whyTrends: 'Refleja la fuerza total de las fuerzas de cohesión interatómicas o intermoleculares.',
    higherIs: 'Renio (5869 K / 5596 °C), Wolframio (5828 K / 5555 °C)',
    lowerIs: 'Helio (4.22 K / -268.9 °C), Hidrógeno (20.28 K)',
    format: (v) => (v !== null ? `${v.toFixed(1)} K (${(v - 273.15).toFixed(1)} °C)` : 'N/D')
  },
  atomicMass: {
    label: 'Masa Atómica Relativa',
    unit: 'u (uma / Da)',
    description: 'Masa promedio ponderada de todos los isótopos naturales de un elemento en unidades de masa atómica.',
    whyTrends: 'Aumenta casi monótonamente con el número atómico Z a lo largo de toda la tabla, con raras inversiones isotópicas (como Ar vs K, Co vs Ni, o Te vs I).',
    higherIs: 'Elementos superpesados (Oganesón: ~295.2 u)',
    lowerIs: 'Hidrógeno (1.008 u)',
    format: (v) => (v !== null ? `${v.toFixed(3)} u` : 'N/D')
  }
};

/**
 * Returns a normalized value 0.0 - 1.0 for a given property across the dataset.
 * Accepts optional precomputed min and max to avoid O(N) array scans per card render.
 */
export function getNormalizedTrendValue(
  element: ElementData,
  prop: TrendProperty,
  elements: ElementData[],
  precomputedMin?: number,
  precomputedMax?: number
): number | null {
  const raw = element[prop];
  if (raw === null || raw === undefined) return null;

  let min = precomputedMin;
  let max = precomputedMax;

  if (min === undefined || max === undefined) {
    const values = elements
      .map((e) => e[prop])
      .filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) return null;

    min = Math.min(...values);
    max = Math.max(...values);
  }

  if (max === min) return 0.5;

  return Math.max(0, Math.min(1, (raw - min) / (max - min)));
}

/**
 * Color interpolation helper returning RGBA and hex style for heatmap visualization.
 * Supports both 'standard' (Violet -> Blue -> Emerald -> Amber -> Crimson)
 * and 'colorblind' (Cividis-inspired Deep Navy -> Teal Slate -> Warm Ochre -> Bright Gold)
 */
export function getTrendColor(
  normalized: number | null,
  palette: HeatmapPalette = 'standard'
): {
  bg: string;
  border: string;
  glow: string;
  text: string;
} {
  if (normalized === null) {
    return {
      bg: 'rgba(30, 41, 59, 0.4)',
      border: 'rgba(71, 85, 105, 0.4)',
      glow: 'rgba(71, 85, 105, 0.1)',
      text: '#94a3b8'
    };
  }

  if (palette === 'colorblind') {
    // Cividis / Viridis perceptual colorblind-safe gradient:
    // 0.00: Deep Indigo/Navy (30, 58, 138)
    // 0.33: Steel Blue/Cyan (14, 116, 144)
    // 0.66: Olive/Ochre (161, 98, 7)
    // 1.00: Bright Solar Yellow (250, 204, 21)
    let r = 30, g = 58, b = 138;
    if (normalized <= 0.33) {
      const t = normalized / 0.33;
      r = Math.round(30 + (14 - 30) * t);
      g = Math.round(58 + (116 - 58) * t);
      b = Math.round(138 + (144 - 138) * t);
    } else if (normalized <= 0.66) {
      const t = (normalized - 0.33) / 0.33;
      r = Math.round(14 + (161 - 14) * t);
      g = Math.round(116 + (98 - 116) * t);
      b = Math.round(144 + (7 - 144) * t);
    } else {
      const t = (normalized - 0.66) / 0.34;
      r = Math.round(161 + (250 - 161) * t);
      g = Math.round(98 + (204 - 98) * t);
      b = Math.round(7 + (21 - 7) * t);
    }

    return {
      bg: `rgba(${r}, ${g}, ${b}, 0.38)`,
      border: `rgba(${r}, ${g}, ${b}, 0.85)`,
      glow: `rgba(${r}, ${g}, ${b}, 0.5)`,
      text: normalized > 0.6 ? '#fef08a' : '#e0f2fe'
    };
  }

  // Standard 5-stop color gradient
  let r = 76, g = 29, b = 149;

  if (normalized <= 0.25) {
    const t = normalized / 0.25;
    r = Math.round(76 + (2 - 76) * t);
    g = Math.round(29 + (132 - 29) * t);
    b = Math.round(149 + (199 - 149) * t);
  } else if (normalized <= 0.5) {
    const t = (normalized - 0.25) / 0.25;
    r = Math.round(2 + (5 - 2) * t);
    g = Math.round(132 + (150 - 132) * t);
    b = Math.round(199 + (105 - 199) * t);
  } else if (normalized <= 0.75) {
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(5 + (217 - 5) * t);
    g = Math.round(150 + (119 - 150) * t);
    b = Math.round(105 + (6 - 105) * t);
  } else {
    const t = (normalized - 0.75) / 0.25;
    r = Math.round(217 + (225 - 217) * t);
    g = Math.round(119 + (29 - 119) * t);
    b = Math.round(6 + (72 - 6) * t);
  }

  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.35)`,
    border: `rgba(${r}, ${g}, ${b}, 0.75)`,
    glow: `rgba(${r}, ${g}, ${b}, 0.5)`,
    text: normalized > 0.6 ? '#fecdd3' : '#e0e7ff'
  };
}

/**
 * Determine physical state at arbitrary temperature (in Kelvin).
 * Handles elements that sublimate at 1 atm (where meltingPoint > boilingPoint, e.g. Arsenic).
 */
export function getPhaseAtTemperature(
  element: ElementData,
  tempK: number
): 'solid' | 'liquid' | 'gas' | 'unknown' {
  if (element.meltingPoint === null && element.boilingPoint === null) {
    return element.phase;
  }

  const mp = element.meltingPoint;
  const bp = element.boilingPoint;

  // Sublimation case at 1 atm (e.g. Arsenic: sublimation at 887 K, triple-point mp at 1090 K)
  if (mp !== null && bp !== null && mp > bp) {
    return tempK >= bp ? 'gas' : 'solid';
  }

  if (mp !== null && tempK < mp) {
    return 'solid';
  }

  if (bp !== null && tempK >= bp) {
    return 'gas';
  }

  if (mp !== null && bp !== null && tempK >= mp && tempK < bp) {
    return 'liquid';
  }

  if (mp !== null && tempK >= mp && bp === null) {
    return 'liquid';
  }

  return element.phase;
}
