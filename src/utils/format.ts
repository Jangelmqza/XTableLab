import type { ElementData } from '../types/element';

/**
 * Elementos radiactivos que sí tienen peso atómico estándar IUPAC
 * (composición isotópica terrestre característica): Torio, Protactinio y Uranio.
 */
const RADIOACTIVE_WITH_STANDARD_WEIGHT = new Set([90, 91, 92]);

/**
 * Indica si el elemento carece de peso atómico estándar IUPAC
 * (no tiene isótopos estables ni composición terrestre característica).
 */
export function hasNoStandardAtomicWeight(el: ElementData): boolean {
  return el.radioactive && !RADIOACTIVE_WITH_STANDARD_WEIGHT.has(el.atomicNumber);
}

/**
 * Formatea la masa atómica según la convención IUPAC:
 * - Elementos con peso estándar: valor decimal (ej. 208.98 para Bi).
 * - Elementos sin isótopos estables: número másico del isótopo más estable
 *   entre corchetes (ej. [209] para Po, [98] para Tc).
 */
export function formatAtomicMass(el: ElementData, decimals = 2): string {
  if (hasNoStandardAtomicWeight(el)) {
    return `[${Math.round(el.atomicMass)}]`;
  }
  return el.atomicMass.toFixed(decimals);
}
