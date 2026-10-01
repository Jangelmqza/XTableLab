export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export type ElementBlock = 's' | 'p' | 'd' | 'f';

export type ElementPhase = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  nameEn: string;
  atomicMass: number;
  category: ElementCategory;
  block: ElementBlock;
  period: number;
  group: number | null; // 1-18 or null for f-block series
  phase: ElementPhase;
  electronegativity: number | null; // Pauling scale
  atomicRadius: number | null; // pm
  ionizationEnergy: number | null; // eV or kJ/mol
  electronAffinity: number | null; // kJ/mol or eV
  oxidationStates: string;
  electronConfiguration: string;
  electronConfigurationFull?: string;
  electronsPerShell: number[];
  density: number | null; // g/cm³
  meltingPoint: number | null; // K
  boilingPoint: number | null; // K
  discoveredBy: string;
  yearDiscovered: string | number;
  summary: string;
  deepDive: string;
  commonUses: string[];
  radioactive: boolean;
  cpkColor?: string;
}

export type TrendProperty =
  | 'atomicMass'
  | 'electronegativity'
  | 'atomicRadius'
  | 'ionizationEnergy'
  | 'electronAffinity'
  | 'density'
  | 'meltingPoint'
  | 'boilingPoint';

export interface TrendInfo {
  label: string;
  unit: string;
  description: string;
  whyTrends: string;
  higherIs: string;
  lowerIs: string;
  format: (val: number | null) => string;
}
