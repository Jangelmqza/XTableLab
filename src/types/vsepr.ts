export type Hybridization = 'sp' | 'sp²' | 'sp³' | 'sp³d' | 'sp³d²';

export type ElectronGeometry =
  | 'Lineal'
  | 'Trigonal plana'
  | 'Tetraédrica'
  | 'Bipirámide trigonal'
  | 'Octaédrica';

export type MolecularGeometry =
  | 'Lineal'
  | 'Angular'
  | 'Trigonal plana'
  | 'Tetraédrica'
  | 'Piramidal trigonal'
  | 'Bipirámide trigonal'
  | 'Balancín (Seesaw)'
  | 'Forma de T'
  | 'Octaédrica'
  | 'Piramidal cuadrangular'
  | 'Cuadrada plana';

export interface VseprAtom {
  symbol: string;
  name: string;
  position: [number, number, number]; // [x, y, z] in Ångströms or relative units
  color?: string; // CPK hex
  radius?: number; // relative sphere size
  isCentral?: boolean;
}

export interface LonePairPosition {
  direction: [number, number, number]; // normalized vector from central atom
  label?: string;
}

export interface VseprMolecule {
  id: string;
  formula: string;
  name: string;
  axe: string; // e.g. "AX₂E₂"
  stericNumber: number; // bonded + lone pairs
  bondedAtomsCount: number; // X
  lonePairsCount: number; // E
  electronGeometry: ElectronGeometry;
  molecularGeometry: MolecularGeometry;
  hybridization: Hybridization;
  idealAngle: string; // e.g. "109.5°"
  realAngle: string; // e.g. "104.5°"
  polarity: 'Polar' | 'No polar';
  dipoleMomentD: number; // in Debyes
  centralAtom: string; // symbol, e.g. "O"
  ligands: string[]; // symbols, e.g. ["H", "H"]
  atoms: VseprAtom[];
  lonePairs: LonePairPosition[];
  bonds: [number, number][]; // pairs of atom indices in atoms array
  description: string;
  academicNotes: string;
}
