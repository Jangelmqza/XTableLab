import type { ElementData, ElementCategory, ElementBlock } from '../types/element';

export interface ElementFilterCriteria {
  selectedCategory: ElementCategory | 'all';
  selectedBlock: ElementBlock | 'all';
  onlyRadioactive: boolean;
  searchQuery: string;
}

/**
 * Normaliza un texto eliminando diacríticos/acentos y convirtiendo a minúsculas.
 */
export function normalizeSearchText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Evalúa si un elemento cumple con todos los criterios de búsqueda y filtrado activos.
 */
export function matchesElementFilter(
  el: ElementData,
  criteria: ElementFilterCriteria,
  normalizedQuery?: string
): boolean {
  if (criteria.selectedCategory !== 'all' && el.category !== criteria.selectedCategory) {
    return false;
  }
  if (criteria.selectedBlock !== 'all' && el.block !== criteria.selectedBlock) {
    return false;
  }
  if (criteria.onlyRadioactive && !el.radioactive) {
    return false;
  }

  const q = normalizedQuery !== undefined ? normalizedQuery : normalizeSearchText(criteria.searchQuery);
  if (q) {
    const matchName = normalizeSearchText(el.name).includes(q);
    const matchNameEn = normalizeSearchText(el.nameEn).includes(q);
    const matchSymbol =
      el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
    const matchNumber = el.atomicNumber.toString() === q;
    if (!matchName && !matchNameEn && !matchSymbol && !matchNumber) {
      return false;
    }
  }

  return true;
}

/**
 * Filtra una lista de elementos según los criterios indicados.
 * Si hay término de búsqueda, los resultados se ordenan por relevancia
 * (coincidencia exacta primero: «Fe» → Hierro, «Oro» → Oro).
 */
export function filterElements(
  elements: ElementData[],
  criteria: ElementFilterCriteria
): ElementData[] {
  const q = normalizeSearchText(criteria.searchQuery);
  const filtered = elements.filter((el) => matchesElementFilter(el, criteria, q));
  if (!q) return filtered;
  return filtered
    .map((el, idx) => ({ el, idx, score: getSearchMatchScore(el, q) }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((x) => x.el);
}

/** Puntuación mínima que se considera «coincidencia exacta». */
export const EXACT_MATCH_SCORE = 90;

/**
 * Puntúa qué tan bien coincide un elemento con la búsqueda normalizada.
 * 100 = símbolo o número atómico exacto · 90 = nombre exacto (es/en)
 * 60 = el nombre empieza por la búsqueda · 50 = el símbolo empieza por la búsqueda
 * 20 = subcadena del nombre · 0 = sin coincidencia.
 */
export function getSearchMatchScore(el: ElementData, normalizedQuery: string): number {
  const q = normalizedQuery;
  if (!q) return 0;
  const symbol = el.symbol.toLowerCase();
  const name = normalizeSearchText(el.name);
  const nameEn = normalizeSearchText(el.nameEn);

  if (symbol === q || el.atomicNumber.toString() === q) return 100;
  if (name === q || nameEn === q) return EXACT_MATCH_SCORE;
  if (name.startsWith(q) || nameEn.startsWith(q)) return 60;
  if (symbol.startsWith(q)) return 50;
  if (name.includes(q) || nameEn.includes(q)) return 20;
  return 0;
}

/**
 * Devuelve los números atómicos de las coincidencias exactas para la búsqueda
 * (para destacarlas en la tabla). Vacío si no hay búsqueda o no hay exactas.
 */
export function getExactMatchZs(elements: ElementData[], searchQuery: string): Set<number> {
  const q = normalizeSearchText(searchQuery);
  const result = new Set<number>();
  if (!q) return result;
  for (const el of elements) {
    if (getSearchMatchScore(el, q) >= EXACT_MATCH_SCORE) result.add(el.atomicNumber);
  }
  return result;
}
