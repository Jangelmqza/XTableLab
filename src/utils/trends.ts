import type { TrendProperty, TrendInfo, ElementData } from '../types/element';

export const TREND_INFO: Record<TrendProperty, TrendInfo> = {
  electronegativity: {
    label: 'Electronegatividad',
    unit: 'Escala de Pauling',
    description: 'Medida de la capacidad relativa de un átomo en una molécula para atraer hacia sí el par de electrones del enlace.',
    whyTrends: 'Aumenta hacia arriba y hacia la derecha en la tabla. Al aumentar la carga nuclear efectiva (Z_eff) a lo largo de un periodo sin añadir nuevas capas, los electrones son atraídos con mayor fuerza. Al descender en un grupo, el apantallamiento de capas internas disminuye la atracción del núcleo.',
    higherIs: 'Mayor atracción por electrones (Flúor: 3.98)',
    lowerIs: 'Menor atracción / electropositivo (Francio / Cesio: 0.79)',
    format: (v) => (v !== null ? v.toFixed(2) : 'N/D')
  },
  atomicRadius: {
    label: 'Radio Atómico',
    unit: 'pm (picómetros)',
    description: 'Distancia media entre el núcleo atómico y la capa de valencia de electrones más externa.',
    whyTrends: 'Aumenta hacia abajo y hacia la izquierda. Disminuye a lo largo de un periodo debido al incremento de la carga nuclear efectiva que contrae la nube electrónica. Aumenta al descender en un grupo al incorporarse nuevos niveles cuánticos principales (n).',
    higherIs: 'Átomos más voluminosos (Cesio: 298 pm)',
    lowerIs: 'Átomos más compactos (Helio: 31 pm, Hidrógeno: 53 pm)',
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
    description: 'Variación de energía que acompaña a la adición de un electrón a un átomo gaseoso para formar un ion mononegativo.',
    whyTrends: 'Tiende a ser más exotérmica (mayor magnitud) hacia arriba y hacia la derecha. Los halógenos presentan los valores más altos al necesitar un solo electrón para completar su octeto. El Cloro supera ligeramente al Flúor debido a la menor repulsión interelectrónica en la subcapa 3p.',
    higherIs: 'Gran tendencia a captar electrones (Cloro: 3.61 eV)',
    lowerIs: 'Poca o nula tendencia (Gases nobles y alcalinotérreos: ~0 eV)',
    format: (v) => (v !== null ? `${v.toFixed(2)} eV` : 'N/D')
  },
  density: {
    label: 'Densidad (en estado estándar)',
    unit: 'g/cm³',
    description: 'Relación entre la masa atómica compactada y el volumen ocupado por la red cristalina o fase a 298 K.',
    whyTrends: 'Alcanza su máximo en el centro del bloque d (periodo 6: Osmio e Iridio con ~22.6 g/cm³), donde el empaquetamiento compacto de la contracción lantánida y alta masa atómica coinciden.',
    higherIs: 'Metales ultradensos (Osmio: 22.59 g/cm³, Iridio: 22.56 g/cm³)',
    lowerIs: 'Gases y metales ligeros (Hidrógeno: 0.00009 g/cm³, Litio: 0.53 g/cm³)',
    format: (v) => (v !== null ? (v < 0.01 ? `${(v * 1000).toFixed(3)} mg/cm³` : `${v.toFixed(2)} g/cm³`) : 'N/D')
  },
  meltingPoint: {
    label: 'Punto de Fusión',
    unit: 'K (°C)',
    description: 'Temperatura a la cual la fase sólida y la fase líquida coexisten en equilibrio termodinámico a 1 atm.',
    whyTrends: 'Alcanza su pico en elementos con enlaces covalentes reticulares continuos (Carbono en diamante: ~3823 K) o metales refractarios con máxima ocupación de orbitales enlazantes d (Wolframio: 3695 K).',
    higherIs: 'Materiales refractarios (Wolframio: 3695 K / 3422 °C)',
    lowerIs: 'Fluidos criogénicos (Helio: 0.95 K / -272.2 °C)',
    format: (v) => (v !== null ? `${v.toFixed(1)} K (${(v - 273.15).toFixed(1)} °C)` : 'N/D')
  },
  boilingPoint: {
    label: 'Punto de Ebullición',
    unit: 'K (°C)',
    description: 'Temperatura a la cual la presión de vapor del líquido iguala la presión atmosférica estándar.',
    whyTrends: 'Refleja la fuerza total de las fuerzas de cohesión interatómicas o intermoleculares.',
    higherIs: 'Wolframio (5828 K / 5555 °C), Renio (5869 K)',
    lowerIs: 'Helio (4.22 K / -268.9 °C), Hidrógeno (20.28 K)',
    format: (v) => (v !== null ? `${v.toFixed(1)} K (${(v - 273.15).toFixed(1)} °C)` : 'N/D')
  },
  atomicMass: {
    label: 'Masa Atómica Relativa',
    unit: 'u (uma / Da)',
    description: 'Masa promedio ponderada de todos los isótopos naturales de un elemento en unidades de masa atómica.',
    whyTrends: 'Aumenta casi monótonamente con el número atómico Z a lo largo de toda la tabla, con raras excepciones isotópicas (como Ar vs K o Te vs I).',
    higherIs: 'Elementos transactínidos superpesados (Oganesón: ~294 u)',
    lowerIs: 'Hidrógeno (1.008 u)',
    format: (v) => (v !== null ? `${v.toFixed(3)} u` : 'N/D')
  }
};

/**
 * Returns a normalized value 0.0 - 1.0 for a given property across the dataset.
 */
export function getNormalizedTrendValue(
  element: ElementData,
  prop: TrendProperty,
  elements: ElementData[]
): number | null {
  const raw = element[prop];
  if (raw === null || raw === undefined) return null;

  // Gather valid non-null values
  const values = elements
    .map((e) => e[prop])
    .filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) return 0.5;

  return Math.max(0, Math.min(1, (raw - min) / (max - min)));
}

/**
 * Color interpolation helper returning RGBA and hex style for heatmap visualization.
 * Uses a smooth vibrant science gradient: Deep Violet -> Royal Blue -> Emerald -> Amber -> Crimson Red
 */
export function getTrendColor(normalized: number | null): {
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

  // 5-stop color gradient
  // 0.0: deep violet #4c1d95 (rgba(76, 29, 149, 0.7))
  // 0.25: azure blue #0284c7 (rgba(2, 132, 199, 0.7))
  // 0.5: emerald green #059669 (rgba(5, 150, 105, 0.7))
  // 0.75: amber orange #d97706 (rgba(217, 119, 6, 0.7))
  // 1.0: vivid crimson #e11d48 (rgba(225, 29, 72, 0.85))

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
 * Determine physical state at arbitrary temperature (in Kelvin)
 */
export function getPhaseAtTemperature(element: ElementData, tempK: number): 'solid' | 'liquid' | 'gas' | 'unknown' {
  if (element.meltingPoint === null && element.boilingPoint === null) {
    return element.phase;
  }

  const mp = element.meltingPoint;
  const bp = element.boilingPoint;

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
