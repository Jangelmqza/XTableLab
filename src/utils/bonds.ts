import type { ElementData } from '../types/element';

export type BondClass = 'metallic' | 'ionic' | 'polar-covalent' | 'nonpolar-covalent';

export type QuizBondLabel =
  | 'Enlace Iónico'
  | 'Enlace Covalente Polar'
  | 'Enlace Covalente No Polar'
  | 'Enlace Metálico';

export interface BondClassification {
  bondClass: BondClass;
  quizLabel: QuizBondLabel;
  title: string;
  badgeClass: string;
  deltaEN: number;
  ionicPercentage: number;
  covalentPercentage: number;
  description: string;
}

/**
 * Calcula el porcentaje de carácter iónico según la ecuación empírica de Linus Pauling:
 * % Iónico = (1 - exp(-0.25 * ΔEN²)) * 100
 */
export function calculateIonicPercentage(deltaEN: number): number {
  return Math.round((1 - Math.exp(-0.25 * Math.pow(deltaEN, 2))) * 100);
}

/**
 * Determina si un elemento actúa químicamente como metal (excluyendo metaloides y gases nobles/no metales).
 */
export function isMetallicElement(el: ElementData): boolean {
  return (
    el.category === 'alkali-metal' ||
    el.category === 'alkaline-earth' ||
    el.category === 'transition-metal' ||
    el.category === 'post-transition-metal' ||
    el.category === 'lanthanide' ||
    el.category === 'actinide'
  );
}

/**
 * Clasifica el enlace químico predominante entre dos elementos utilizando ΔEN y su naturaleza metálica/no metálica.
 */
export function classifyBond(elementA: ElementData, elementB: ElementData): BondClassification {
  const enA = elementA.electronegativity ?? 0;
  const enB = elementB.electronegativity ?? 0;
  const deltaEN = Math.abs(enA - enB);
  const ionicPercentage = calculateIonicPercentage(deltaEN);
  const covalentPercentage = 100 - ionicPercentage;

  const isMetalA = isMetallicElement(elementA);
  const isMetalB = isMetallicElement(elementB);

  if (isMetalA && isMetalB) {
    return {
      bondClass: 'metallic',
      quizLabel: 'Enlace Metálico',
      title: 'Enlace Metálico',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      deltaEN,
      ionicPercentage,
      covalentPercentage,
      description: `Al interactuar dos metales electropositivos (${elementA.name} y ${elementB.name}), los electrones de valencia se deslocalizan en un 'mar de electrones' colectivo que rodea a los cationes metálicos empaquetados. Esto produce aleaciones o fases intermetálicas con alta conductividad térmica y eléctrica.`,
    };
  }

  // Enlace iónico: ΔEN > 1.7 o par metal + no-metal con ΔEN >= 1.5
  const isMetalNonMetalPair = (isMetalA && !isMetalB) || (!isMetalA && isMetalB);
  if (deltaEN > 1.7 || (isMetalNonMetalPair && deltaEN >= 1.5)) {
    const cation = enA <= enB ? elementA : elementB;
    const anion = cation === elementA ? elementB : elementA;
    return {
      bondClass: 'ionic',
      quizLabel: 'Enlace Iónico',
      title: 'Enlace Iónico Predominante',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      deltaEN,
      ionicPercentage,
      covalentPercentage,
      description: `La elevada diferencia de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}, carácter iónico ~${ionicPercentage}%) entre ${cation.name} y ${anion.name} propicia la transferencia de electrones de valencia: ${cation.name} forma un catión (${cation.symbol}⁺) y ${anion.name} un anión (${anion.symbol}⁻), unidos por atracciones electrostáticas en una red cristalina iónica.`,
    };
  }

  if (deltaEN >= 0.4) {
    const negative = enA >= enB ? elementA : elementB;
    const positive = negative === elementA ? elementB : elementA;
    return {
      bondClass: 'polar-covalent',
      quizLabel: 'Enlace Covalente Polar',
      title: 'Enlace Covalente Polar',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
      deltaEN,
      ionicPercentage,
      covalentPercentage,
      description: `La diferencia moderada de electronegatividad (ΔEN = ${deltaEN.toFixed(2)}) provoca una compartición asimétrica del par electrónico hacia ${negative.name} (carga parcial δ⁻), dejando a ${positive.name} con carga parcial positiva (δ⁺) y generando un momento dipolar permanente.`,
    };
  }

  return {
    bondClass: 'nonpolar-covalent',
    quizLabel: 'Enlace Covalente No Polar',
    title: 'Enlace Covalente Apolar (No Polar)',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    deltaEN,
    ionicPercentage,
    covalentPercentage,
    description: `La diferencia de electronegatividad es muy baja (ΔEN = ${deltaEN.toFixed(2)} < 0.4). Los electrones se comparten de forma casi simétrica entre ambos núcleos, sin generar momentos dipolares intensos.`,
  };
}
