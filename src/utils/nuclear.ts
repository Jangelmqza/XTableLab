import type { ElementData } from '../types/element';
import { calculateOrbitalBoxes } from './electronConfig';

/**
 * Número de neutrones (N) del isótopo natural más abundante (o el más longevo para elementos sintéticos)
 * para cada número atómico Z (1 a 118). Evita errores como ⁶⁴Cu o ³⁶Cl al redondear la masa atómica promedio.
 */
export const MOST_ABUNDANT_NEUTRONS: Record<number, number> = {
  1: 0,   // ¹H
  2: 2,   // ⁴He
  3: 4,   // ⁷Li
  4: 5,   // ⁹Be
  5: 6,   // ¹¹B
  6: 6,   // ¹²C
  7: 7,   // ¹⁴N
  8: 8,   // ¹⁶O
  9: 10,  // ¹⁹F
  10: 10, // ²⁰Ne
  11: 12, // ²³Na
  12: 12, // ²⁴Mg
  13: 14, // ²⁷Al
  14: 14, // ²⁸Si
  15: 16, // ³¹P
  16: 16, // ³²S
  17: 18, // ³⁵Cl (75.8% abundante, estable; 35.45 redondeado daba 18, pero explícito)
  18: 22, // ⁴⁰Ar
  19: 20, // ³⁹K
  20: 20, // ⁴⁰Ca
  21: 24, // ⁴⁵Sc
  22: 26, // ⁴⁸Ti
  23: 28, // ⁵¹V
  24: 28, // ⁵²Cr
  25: 30, // ⁵⁵Mn
  26: 30, // ⁵⁶Fe
  27: 32, // ⁵⁹Co
  28: 30, // ⁵⁸Ni (68.1% abundante; masa promedio 58.69 daba ³¹N = ⁵⁹Ni radiactivo!)
  29: 34, // ⁶³Cu (69.2% abundante; masa promedio 63.55 daba ³⁵N = ⁶⁴Cu radiactivo!)
  30: 34, // ⁶⁴Zn (49.2% abundante; masa promedio 65.38 daba ³⁵N = ⁶⁵Zn radiactivo!)
  31: 38, // ⁶⁹Ga
  32: 42, // ⁷⁴Ge
  33: 42, // ⁷⁵As
  34: 46, // ⁸⁰Se
  35: 44, // ⁷⁹Br (50.7% abundante; masa promedio 79.90 daba ⁴⁵N = ⁸⁰Br radiactivo!)
  36: 48, // ⁸⁴Kr
  37: 48, // ⁸⁵Rb
  38: 50, // ⁸⁸Sr
  39: 50, // ⁸⁹Y
  40: 50, // ⁹⁰Zr
  41: 52, // ⁹³Nb
  42: 56, // ⁹⁸Mo
  43: 55, // ⁹⁸Tc (radiactivo, sin isótopos estables)
  44: 58, // ¹⁰²Ru
  45: 58, // ¹⁰³Rh
  46: 60, // ¹⁰⁶Pd
  47: 60, // ¹⁰⁷Ag (51.8% abundante; 107.87 daba ¹⁰⁸Ag radiactivo!)
  48: 66, // ¹¹⁴Cd
  49: 66, // ¹¹⁵In
  50: 70, // ¹²⁰Sn
  51: 70, // ¹²¹Sb (57.2% abundante; 121.76 daba ¹²²Sb radiactivo!)
  52: 78, // ¹³⁰Te
  53: 74, // ¹²⁷I
  54: 78, // ¹³²Xe
  55: 78, // ¹³³Cs
  56: 82, // ¹³⁸Ba
  57: 82, // ¹³⁹La
  58: 82, // ¹⁴⁰Ce
  59: 82, // ¹⁴¹Pr
  60: 82, // ¹⁴²Nd
  61: 84, // ¹⁴⁵Pm (radiactivo, sin isótopos estables)
  62: 90, // ¹⁵²Sm
  63: 90, // ¹⁵³Eu (52.2% abundante; 151.96 daba ¹⁵²Eu radiactivo!)
  64: 94, // ¹⁵⁸Gd
  65: 94, // ¹⁵⁹Tb
  66: 98, // ¹⁶⁴Dy
  67: 98, // ¹⁶⁵Ho
  68: 98, // ¹⁶⁶Er
  69: 100, // ¹⁶⁹Tm
  70: 104, // ¹⁷⁴Yb
  71: 104, // ¹⁷⁵Lu
  72: 108, // ¹⁸⁰Hf
  73: 108, // ¹⁸¹Ta
  74: 110, // ¹⁸⁴W
  75: 112, // ¹⁸⁷Re
  76: 116, // ¹⁹²Os
  77: 116, // ¹⁹³Ir (62.7% abundante; 192.22 daba ¹⁹²Ir radiactivo!)
  78: 117, // ¹⁹⁵Pt
  79: 118, // ¹⁹⁷Au
  80: 122, // ²⁰²Hg
  81: 124, // ²⁰⁵Tl (70.5% abundante; 204.38 daba ²⁰⁴Tl radiactivo!)
  82: 126, // ²⁰⁸Pb
  83: 126, // ²⁰⁹Bi (cuasi-estable, T½ = 1.9×10¹⁹ años)
  84: 125, // ²⁰⁹Po
  85: 125, // ²¹⁰At
  86: 136, // ²²²Rn
  87: 136, // ²²³Fr
  88: 138, // ²²⁶Ra
  89: 138, // ²²⁷Ac
  90: 142, // ²³²Th
  91: 140, // ²³¹Pa
  92: 146, // ²³⁸U
};

/**
 * Obtiene el número de neutrones por defecto para un elemento Z utilizando su isótopo natural más abundante.
 */
export function getDefaultNeutrons(el: ElementData): number {
  const known = MOST_ABUNDANT_NEUTRONS[el.atomicNumber];
  if (known !== undefined) return known;
  return Math.max(0, Math.round(el.atomicMass) - el.atomicNumber);
}

/**
 * Evalúa la estabilidad nuclear de un núclido (Z protones, N neutrones).
 * Contempla los casos reales de Tecnecio (Z=43) y Prometio (Z=61) sin isótopos estables,
 * así como los límites de estabilidad nuclear y reglas de paridad.
 */
export function checkNuclearStability(
  protons: number,
  neutrons: number
): { isStable: boolean; reason: string } {
  if (protons <= 0) {
    return { isStable: false, reason: 'Se requiere al menos 1 protón para formar un núcleo atómico.' };
  }
  if (protons === 1 && neutrons === 0) {
    return { isStable: true, reason: 'Protio (¹H): Isótopo estable más abundante del hidrógeno (99.98%).' };
  }
  if (protons === 1 && neutrons === 1) {
    return { isStable: true, reason: 'Deuterio (²H): Isótopo pesado estable del hidrógeno.' };
  }
  if (protons === 1 && neutrons === 2) {
    return { isStable: false, reason: 'Tritio (³H): Isótopo radiactivo (emisión β⁻, vida media de 12.32 años).' };
  }
  if (protons === 2 && neutrons === 1) {
    return { isStable: true, reason: 'Helio-3 (³He): Uno de los dos únicos núclidos estables con más protones que neutrones.' };
  }
  if (protons === 4 && neutrons === 4) {
    return { isStable: false, reason: 'Berilio-8 (⁸Be): Extremadamente inestable; se desintegra en dos partículas alfa en ~10⁻¹⁶ s.' };
  }
  if (protons === 43) {
    return {
      isStable: false,
      reason: 'Tecnecio (Z = 43): Anomalía nuclear; no posee ningún isótopo estable debido a la regla de isóbaros de Mattauch.',
    };
  }
  if (protons === 61) {
    return {
      isStable: false,
      reason: 'Prometio (Z = 61): Único lantánido sin isótopos estables; todos sus núclidos son radiactivos.',
    };
  }
  if (protons === 83 && neutrons === 126) {
    return {
      isStable: false,
      reason: 'Bismuto-209 (²⁰⁹Bi): Cuasi-estable (emisor alfa con vida media de 1.9 × 10¹⁹ años, mil millones de veces la edad del universo).',
    };
  }
  if (protons > 82) {
    return {
      isStable: false,
      reason: 'Núcleo pesado (Z > 82): La repulsión coulombiana entre protones supera la fuerza nuclear fuerte de corto alcance; todos sus isótopos son radiactivos.',
    };
  }

  // Si coincide exactamente con el isótopo estable de referencia de ese Z (Z <= 82, Z != 43, 61)
  if (MOST_ABUNDANT_NEUTRONS[protons] === neutrons) {
    const ratio = neutrons / protons;
    return {
      isStable: true,
      reason: `Isótopo natural estable dentro del cinturón de estabilidad nuclear (relación N/Z = ${ratio.toFixed(2)}).`,
    };
  }

  const ratio = neutrons / protons;
  let idealRatio = 1.0;
  if (protons > 20) {
    idealRatio = 1.0 + ((protons - 20) / 62) * 0.52; // hasta ~1.52 en Pb (Z=82, N=126)
  }

  // Núcleos impar-impar con Z > 7 (excepto ²H, ⁶Li, ¹⁰B, ¹⁴N) son casi todos inestables
  const isOddOdd = protons % 2 === 1 && neutrons % 2 === 1 && protons > 7;
  const tolerance = isOddOdd ? 0.04 : 0.14;

  if (Math.abs(ratio - idealRatio) <= tolerance && neutrons >= protons) {
    return {
      isStable: true,
      reason: `Núclido dentro de la franja de estabilidad nuclear (relación N/Z = ${ratio.toFixed(2)}).`,
    };
  } else if (ratio < idealRatio) {
    return {
      isStable: false,
      reason: `Déficit de neutrones (N/Z = ${ratio.toFixed(2)} < ${idealRatio.toFixed(2)}). Propenso a decaimiento por emisión de positrones (β⁺) o captura electrónica.`,
    };
  } else {
    return {
      isStable: false,
      reason: `Exceso de neutrones (N/Z = ${ratio.toFixed(2)} > ${idealRatio.toFixed(2)}). Propenso a decaimiento por emisión beta negativa (β⁻).`,
    };
  }
}

/**
 * Calcula la distribución de electrones por capa principal (n = 1..7)
 * tanto para átomos neutros como para iones, respetando el llenado cuántico de subniveles.
 */
export function calculateElectronShells(
  totalElectrons: number,
  activeElement?: ElementData | null
): number[] {
  if (totalElectrons <= 0) return [];
  if (activeElement && totalElectrons === activeElement.atomicNumber) {
    return activeElement.electronsPerShell;
  }

  const clamped = Math.min(118, totalElectrons);
  const sublevels = calculateOrbitalBoxes(clamped, 'real');
  const shellsMap = new Map<number, number>();
  let maxN = 1;

  for (const item of sublevels) {
    if (item.electronsCount > 0) {
      const n = item.sublevel.n;
      if (n > maxN) maxN = n;
      shellsMap.set(n, (shellsMap.get(n) ?? 0) + item.electronsCount);
    }
  }

  const result: number[] = [];
  for (let n = 1; n <= maxN; n++) {
    result.push(shellsMap.get(n) ?? 0);
  }
  return result;
}
