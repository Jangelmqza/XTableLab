export interface Sublevel {
  name: string;
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  capacity: number;
  orbitalsCount: number;
}

export interface OrbitalBoxItem {
  sublevel: Sublevel;
  electronsCount: number;
  orbitals: { up: boolean; down: boolean }[];
}

// Secuencia estándar de llenado de Aufbau según la regla (n + l) de Madelung / Moeller
export const AUFBAU_SEQUENCE: Sublevel[] = [
  { name: '1s', n: 1, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '2s', n: 2, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '2p', n: 2, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '3s', n: 3, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '3p', n: 3, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '4s', n: 4, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '3d', n: 3, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '4p', n: 4, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '5s', n: 5, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '4d', n: 4, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '5p', n: 5, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '6s', n: 6, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '4f', n: 4, l: 3, capacity: 14, orbitalsCount: 7 },
  { name: '5d', n: 5, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '6p', n: 6, l: 1, capacity: 6, orbitalsCount: 3 },
  { name: '7s', n: 7, l: 0, capacity: 2, orbitalsCount: 1 },
  { name: '5f', n: 5, l: 3, capacity: 14, orbitalsCount: 7 },
  { name: '6d', n: 6, l: 2, capacity: 10, orbitalsCount: 5 },
  { name: '7p', n: 7, l: 1, capacity: 6, orbitalsCount: 3 },
];

export interface QuantumAnomalyInfo {
  overrides: Record<string, number>;
  note: string;
}

/**
 * Excepciones experimentales reales a la regla de Aufbau (Madelung) en estado fundamental neutro.
 */
export const QUANTUM_ANOMALIES: Record<number, QuantumAnomalyInfo> = {
  24: {
    overrides: { '4s': 1, '3d': 5 },
    note: 'Cromo (Z=24): Configuración real [Ar] 3d⁵ 4s¹ (en vez de 3d⁴ 4s²). La subcapa 3d semi-llena maximiza la energía de canje (intercambio) y reduce la repulsión interelectrónica.',
  },
  29: {
    overrides: { '4s': 1, '3d': 10 },
    note: 'Cobre (Z=29): Configuración real [Ar] 3d¹⁰ 4s¹ (en vez de 3d⁹ 4s²). La subcapa 3d completamente llena aporta simetría esférica y mayor estabilidad energética.',
  },
  41: {
    overrides: { '5s': 1, '4d': 4 },
    note: 'Niobio (Z=41): Configuración real [Kr] 4d⁴ 5s¹ (en vez de 4d³ 5s²) por reducción de la repulsión electrón-electrón en el orbital 5s.',
  },
  42: {
    overrides: { '5s': 1, '4d': 5 },
    note: 'Molibdeno (Z=42): Configuración real [Kr] 4d⁵ 5s¹ análoga al cromo, estabilizada por la subcapa 4d exactamente semi-llena.',
  },
  44: {
    overrides: { '5s': 1, '4d': 7 },
    note: 'Rutenio (Z=44): Configuración real [Kr] 4d⁷ 5s¹ (en vez de 4d⁶ 5s²) debido a la proximidad energética entre 4d y 5s.',
  },
  45: {
    overrides: { '5s': 1, '4d': 8 },
    note: 'Rodio (Z=45): Configuración real [Kr] 4d⁸ 5s¹ (en vez de 4d⁷ 5s²).',
  },
  46: {
    overrides: { '5s': 0, '4d': 10 },
    note: 'Paladio (Z=46): Caso único [Kr] 4d¹⁰ 5s⁰. Ambos electrones 5s pasan al subnivel 4d para cerrar completamente la subcapa d.',
  },
  47: {
    overrides: { '5s': 1, '4d': 10 },
    note: 'Plata (Z=47): Configuración real [Kr] 4d¹⁰ 5s¹ por estabilidad de la subcapa 4d llena.',
  },
  57: {
    overrides: { '4f': 0, '5d': 1 },
    note: 'Lantano (Z=57): Configuración real [Xe] 5d¹ 6s²; el orbital 5d se encuentra ligeramente por debajo del 4f al inicio de los lantánidos.',
  },
  58: {
    overrides: { '4f': 1, '5d': 1 },
    note: 'Cerio (Z=58): Configuración real [Xe] 4f¹ 5d¹ 6s² por competencia energética estrecha entre los niveles 4f y 5d.',
  },
  64: {
    overrides: { '4f': 7, '5d': 1 },
    note: 'Gadolinio (Z=64): Configuración real [Xe] 4f⁷ 5d¹ 6s² para conservar la subcapa 4f exactamente semi-llena (7 electrones desapareados).',
  },
  78: {
    overrides: { '6s': 1, '5d': 9 },
    note: 'Platino (Z=78): Configuración real [Xe] 4f¹⁴ 5d⁹ 6s¹ impulsada por contracción relativista del orbital 6s y menor repulsión en 5d.',
  },
  79: {
    overrides: { '6s': 1, '5d': 10 },
    note: 'Oro (Z=79): Configuración real [Xe] 4f¹⁴ 5d¹⁰ 6s¹ estabilizada por efectos relativistas y subcapa 5d completa.',
  },
  89: {
    overrides: { '5f': 0, '6d': 1 },
    note: 'Actinio (Z=89): Configuración real [Rn] 6d¹ 7s² análoga al lantano.',
  },
  90: {
    overrides: { '5f': 0, '6d': 2 },
    note: 'Torio (Z=90): Configuración real [Rn] 6d² 7s² sin electrones 5f en su estado basal.',
  },
  91: {
    overrides: { '5f': 2, '6d': 1 },
    note: 'Protactinio (Z=91): Configuración real [Rn] 5f² 6d¹ 7s².',
  },
  92: {
    overrides: { '5f': 3, '6d': 1 },
    note: 'Uranio (Z=92): Configuración real [Rn] 5f³ 6d¹ 7s².',
  },
  93: {
    overrides: { '5f': 4, '6d': 1 },
    note: 'Neptunio (Z=93): Configuración real [Rn] 5f⁴ 6d¹ 7s².',
  },
  96: {
    overrides: { '5f': 7, '6d': 1 },
    note: 'Curio (Z=96): Configuración real [Rn] 5f⁷ 6d¹ 7s², estabilizada por la subcapa 5f exactamente semi-llena.',
  },
};

export function getAnomalyNote(z: number): string | null {
  return QUANTUM_ANOMALIES[z]?.note ?? null;
}

export function toSuperscript(num: number): string {
  const digits: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return num
    .toString()
    .split('')
    .map((d) => digits[d] || d)
    .join('');
}

function buildBoxesForSublevel(sub: Sublevel, count: number): OrbitalBoxItem {
  const boxes: { up: boolean; down: boolean }[] = Array.from(
    { length: sub.orbitalsCount },
    () => ({ up: false, down: false })
  );

  // Regla de Hund: primero espines paralelos (↑), luego apareamiento de Pauli (↓)
  for (let i = 0; i < count; i++) {
    if (i < sub.orbitalsCount) {
      boxes[i].up = true;
    } else {
      boxes[i - sub.orbitalsCount].down = true;
    }
  }

  return {
    sublevel: sub,
    electronsCount: count,
    orbitals: boxes,
  };
}

/**
 * Calcula las cajas cuánticas de orbitales para un número de electrones Z.
 * Si mode === 'real', aplica las excepciones experimentales reales (Cr, Cu, Mo, Pd, Ag, Pt, Au, etc.).
 * Si mode === 'aufbau', aplica el orden idealizado estricto de Madelung.
 */
export function calculateOrbitalBoxes(
  numElectrons: number,
  mode: 'real' | 'aufbau' = 'real'
): OrbitalBoxItem[] {
  let remaining = Math.max(0, Math.min(118, numElectrons));
  const countsMap = new Map<string, number>();

  for (const sub of AUFBAU_SEQUENCE) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, sub.capacity);
    countsMap.set(sub.name, count);
    remaining -= count;
  }

  if (mode === 'real' && QUANTUM_ANOMALIES[numElectrons]) {
    const { overrides } = QUANTUM_ANOMALIES[numElectrons];
    for (const [subName, newCount] of Object.entries(overrides)) {
      countsMap.set(subName, newCount);
    }
  }

  const distribution: OrbitalBoxItem[] = [];
  for (const sub of AUFBAU_SEQUENCE) {
    const count = countsMap.get(sub.name);
    if (count === undefined) continue;
    // Mostrar orbitales con electrones, o el orbital s vacío en caso de anomalía como Pd (5s⁰)
    if (count > 0 || (mode === 'real' && QUANTUM_ANOMALIES[numElectrons]?.overrides[sub.name] === 0)) {
      distribution.push(buildBoxesForSublevel(sub, count));
    }
  }

  return distribution;
}

/**
 * Formatea la cadena de configuración electrónica en orden de llenado (Aufbau) o en orden de nivel cuántico n (espectroscópico).
 */
export function formatConfigurationString(
  items: OrbitalBoxItem[],
  order: 'filling' | 'shell' = 'filling'
): string {
  const list =
    order === 'shell'
      ? [...items].sort((a, b) => a.sublevel.n - b.sublevel.n || a.sublevel.l - b.sublevel.l)
      : items;
  return list
    .filter((item) => item.electronsCount > 0)
    .map((item) => `${item.sublevel.name}${toSuperscript(item.electronsCount)}`)
    .join(' ');
}
