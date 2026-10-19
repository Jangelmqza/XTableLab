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
 */
export function filterElements(
  elements: ElementData[],
  criteria: ElementFilterCriteria
): ElementData[] {
  const q = normalizeSearchText(criteria.searchQuery);
  return elements.filter((el) => matchesElementFilter(el, criteria, q));
}
