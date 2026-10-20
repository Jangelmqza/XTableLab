import { ELEMENTS_DATA } from '../data/elementsData';
import type { ElementData } from '../types/element';
import type {
  ElectronGeometry,
  MolecularGeometry,
  Hybridization,
  VseprAtom,
  LonePairPosition,
} from '../types/vsepr';

export interface CustomLigand {
  id: string;
  symbol: string;
  name: string;
  bondOrder: 1 | 2 | 3; // single, double, triple
  color?: string;
  radius?: number;
}

export interface GeneratedVseprMolecule {
  formula: string;
  name: string;
  axe: string;
  stericNumber: number;
  bondedCount: number;
  lonePairsCount: number;
  electronGeometry: ElectronGeometry;
  molecularGeometry: MolecularGeometry;
  hybridization: Hybridization;
  idealAngle: string;
  realAngle: string;
  polarity: 'Polar' | 'No polar';
  dipoleMomentD: number;
  atoms: VseprAtom[];
  lonePairs: LonePairPosition[];
  bonds: {
    atom1: number;
    atom2: number;
    order: 1 | 2 | 3;
  }[];
  description: string;
  academicNotes: string;
}

/**
 * Returns valence electrons for main group elements (Groups 1, 2, 13-18).
 */
export function getValenceElectrons(element: ElementData): number {
  const g = element.group;
  if (!g) return 1;
  if (g === 1) return 1;
  if (g === 2) return 2;
  if (g >= 13 && g <= 18) return g - 10;
  // Transition metals approximation: outermost s + d
  return element.electronsPerShell[element.electronsPerShell.length - 1] || 2;
}

/**
 * Automatically computes lone pairs on central atom based on Lewis valence rules.
 */
export function calculateAutoLonePairs(
  centralElement: ElementData,
  ligands: CustomLigand[]
): number {
  const valElectrons = getValenceElectrons(centralElement);
  const totalBonds = ligands.reduce((acc, l) => acc + l.bondOrder, 0);

  // Valence electrons left over on central atom
  const leftover = Math.max(0, valElectrons - totalBonds);
  return Math.min(3, Math.floor(leftover / 2));
}

/**
 * Returns the CPK color and radius for an element symbol from dataset.
 */
export function getElementVisualProps(symbol: string): { color: string; radius: number; name: string } {
  const el = ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase());
  if (!el) {
    return { color: '#0284c7', radius: 0.4, name: symbol };
  }
  const color = el.cpkColor ? `#${el.cpkColor}` : '#0284c7';
  // Scale radius for 3D visualization: normalise ~ 0.28 to 0.55
  const rawRadius = el.atomicRadius || 100;
  const radius = Math.max(0.28, Math.min(0.55, rawRadius / 220));
  return { color, radius, name: el.name };
}

/**
 * Calculates 3D positions for X ligands and E lone pairs according to VSEPR theory.
 */
export function generateVsepr3DGeometry(
  centralElement: ElementData,
  ligands: CustomLigand[],
  lonePairsCount: number
): GeneratedVseprMolecule {
  const X = ligands.length;
  const E = Math.max(0, Math.min(3, lonePairsCount));
  const rawSN = X + E;
  const SN = Math.min(6, Math.max(2, rawSN));

  const centralProps = getElementVisualProps(centralElement.symbol);
  const centralAtom: VseprAtom = {
    symbol: centralElement.symbol,
    name: centralElement.name,
    position: [0, 0, 0],
    color: centralProps.color,
    radius: centralProps.radius * 1.1,
    isCentral: true,
  };

  const atoms: VseprAtom[] = [centralAtom];
  const lonePairs: LonePairPosition[] = [];
  const bonds: { atom1: number; atom2: number; order: 1 | 2 | 3 }[] = [];

  let electronGeometry: ElectronGeometry = 'Lineal';
  let molecularGeometry: MolecularGeometry = 'Lineal';
  let hybridization: Hybridization = 'sp';
  let idealAngle = '180°';
  let realAngle = '180°';
  let description = '';
  let academicNotes = '';

  // Standard bond length in 3D units
  const bondDist = 1.8;
  const lpDist = 1.35;

  if (SN === 2) {
    // AX2: Linear (180°)
    electronGeometry = 'Lineal';
    hybridization = 'sp';
    idealAngle = '180°';
    realAngle = '180°';
    molecularGeometry = 'Lineal';
    description = 'Geometría lineal con hibridación sp y ángulo de enlace de 180°.';
    academicNotes = 'Los dos dominios electrónicos se ubican en extremos opuestos minimizando al máximo la repulsión coulómbica.';

    const directions: [number, number, number][] = [
      [0, 0, bondDist],
      [0, 0, -bondDist],
    ];

    ligands.forEach((lig, idx) => {
      const p = directions[idx] || [0, (idx === 0 ? 1 : -1) * bondDist, 0];
      const props = getElementVisualProps(lig.symbol);
      atoms.push({
        symbol: lig.symbol,
        name: props.name,
        position: p,
        color: props.color,
        radius: props.radius,
      });
      bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
    });
  } else if (SN === 3) {
    // SN = 3: Trigonal Planar (120°)
    electronGeometry = 'Trigonal plana';
    hybridization = 'sp²';
    idealAngle = '120°';

    if (E === 0) {
      molecularGeometry = 'Trigonal plana';
      realAngle = '120°';
      description = 'Molécula perfectamente coplanar con 3 dominios a 120° exactos.';
      academicNotes = 'Hibridación sp² con un orbital p puro perpendicular al plano que puede formar enlaces pi (π).';
    } else {
      molecularGeometry = 'Angular';
      realAngle = '~119°';
      description = 'Molécula angular derivada de una distribución trigonal plana con 1 par solitario.';
      academicNotes = 'La fuerte repulsión par libre - par enlazante (LP-BP) comprime el ángulo entre enlaces por debajo de 120°.';
    }

    if (E === 0) {
      // 3 ligandos en plano xy
      const angles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
      ligands.forEach((lig, i) => {
        const ang = angles[i];
        const p: [number, number, number] = [
          Math.cos(ang) * bondDist,
          Math.sin(ang) * bondDist,
          0,
        ];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else {
      // 1 Lone Pair at apex (angle = 90° -> [0, 1, 0])
      lonePairs.push({ direction: [0, lpDist, 0], label: 'Par solitario sp²' });
      // 2 ligands at bottom, angle ~ 119° apart
      const halfAng = (119 * Math.PI) / 360;
      const ligDirs: [number, number, number][] = [
        [Math.sin(halfAng) * bondDist, -Math.cos(halfAng) * bondDist, 0],
        [-Math.sin(halfAng) * bondDist, -Math.cos(halfAng) * bondDist, 0],
      ];
      ligands.forEach((lig, i) => {
        const p = ligDirs[i] || [0, -bondDist, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    }
  } else if (SN === 4) {
    // SN = 4: Tetrahedral (109.5°)
    electronGeometry = 'Tetraédrica';
    hybridization = 'sp³';
    idealAngle = '109.5°';

    // 4 tetrahedral unit vectors
    const tetDirs: [number, number, number][] = [
      [0, 1, 0],
      [Math.sqrt(8) / 3, -1 / 3, 0],
      [-Math.sqrt(2) / 3, -1 / 3, Math.sqrt(2 / 3)],
      [-Math.sqrt(2) / 3, -1 / 3, -Math.sqrt(2 / 3)],
    ];

    if (E === 0) {
      molecularGeometry = 'Tetraédrica';
      realAngle = '109.5°';
      description = 'Geometría tetraédrica perfecta con 4 enlaces a 109.47°.';
      academicNotes = 'Cuatro orbitales híbridos sp³ equivalentes dirigidos a los vértices de un tetraedro regular.';

      ligands.forEach((lig, i) => {
        const d = tetDirs[i];
        const p: [number, number, number] = [d[0] * bondDist, d[1] * bondDist, d[2] * bondDist];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else if (E === 1) {
      molecularGeometry = 'Piramidal trigonal';
      realAngle = '~107°';
      description = 'Geometría piramidal trigonal (tipo amoníaco) con 1 par solitario apical.';
      academicNotes = 'El par libre comprime los 3 enlaces basales de 109.5° a ~107° aumentando la densidad dipolar.';

      // Lone pair at top
      lonePairs.push({ direction: [0, lpDist, 0], label: 'Par solitario apical sp³' });

      // Ligands at 3 base positions (slightly compressed)
      const baseDirs: [number, number, number][] = [
        [1.25, -0.7, 0],
        [-0.625, -0.7, 1.08],
        [-0.625, -0.7, -1.08],
      ];
      ligands.forEach((lig, i) => {
        const d = baseDirs[i];
        const p: [number, number, number] = [d[0], d[1], d[2]];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else {
      // E >= 2: Angular bent (H2O)
      molecularGeometry = 'Angular';
      realAngle = '~104.5°';
      description = 'Geometría angular con 2 pares solitarios (tipo agua).';
      academicNotes = 'Doble interacción repulsiva LP-LP que comprime fuertemente el ángulo de enlace hasta ~104.5°.';

      // 2 lone pairs
      lonePairs.push({ direction: [0, 0.9 * lpDist, 0.8 * lpDist], label: 'Par libre 1' });
      lonePairs.push({ direction: [0, 0.9 * lpDist, -0.8 * lpDist], label: 'Par libre 2' });

      // 2 ligands at angle ~104.5° in xy plane
      const half = (104.5 * Math.PI) / 360;
      const ligs: [number, number, number][] = [
        [Math.sin(half) * bondDist, -Math.cos(half) * bondDist, 0],
        [-Math.sin(half) * bondDist, -Math.cos(half) * bondDist, 0],
      ];
      ligands.forEach((lig, i) => {
        const p = ligs[i] || [0, -bondDist, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    }
  } else if (SN === 5) {
    // SN = 5: Trigonal Bipyramidal (sp3d)
    electronGeometry = 'Bipirámide trigonal';
    hybridization = 'sp³d';
    idealAngle = '90° / 120°';

    if (E === 0) {
      molecularGeometry = 'Bipirámide trigonal';
      realAngle = '90° / 120°';
      description = 'Bipirámide trigonal regular con 2 posiciones axiales y 3 ecuatoriales.';
      academicNotes = 'Los enlaces axiales (90°) sufren mayor repulsión y son más largos que los ecuatoriales (120°).';

      // 2 axial (along z)
      const axDirs: [number, number, number][] = [
        [0, 0, bondDist * 1.1],
        [0, 0, -bondDist * 1.1],
      ];
      // 3 equatorial (in xy plane)
      const eqDirs: [number, number, number][] = [
        [0, bondDist, 0],
        [bondDist * 0.866, -bondDist * 0.5, 0],
        [-bondDist * 0.866, -bondDist * 0.5, 0],
      ];
      const allDirs = [...axDirs, ...eqDirs];
      ligands.forEach((lig, i) => {
        const p = allDirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else if (E === 1) {
      // Seesaw / Balancin (SF4)
      molecularGeometry = 'Balancín (Seesaw)';
      realAngle = '87° (ax) / 102° (eq)';
      description = 'Geometría de balancín (Seesaw). El par solitario se coloca en el plano ecuatorial.';
      academicNotes = 'Regla de Bent: los pares libres ocupan exclusivamente las posiciones ecuatoriales para minimizar repulsiones a 90°.';

      lonePairs.push({ direction: [-lpDist, 0, 0], label: 'Par solitario ecuatorial' });
      const dirs: [number, number, number][] = [
        [-0.15, 0, bondDist],
        [-0.15, 0, -bondDist],
        [bondDist * 0.75, bondDist * 0.6, 0],
        [bondDist * 0.75, -bondDist * 0.6, 0],
      ];
      ligands.forEach((lig, i) => {
        const p = dirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else if (E === 2) {
      // T-shaped (ClF3)
      molecularGeometry = 'Forma de T';
      realAngle = '87.5°';
      description = 'Geometría en forma de T con 2 pares solitarios ecuatoriales a 120°.';
      academicNotes = 'Dos pares solitarios en el plano ecuatorial doblan ligeramente los enlaces axiales hacia atrás.';

      lonePairs.push({ direction: [-lpDist * 0.8, lpDist * 0.6, 0], label: 'Par ecuatorial 1' });
      lonePairs.push({ direction: [-lpDist * 0.8, -lpDist * 0.6, 0], label: 'Par ecuatorial 2' });
      const dirs: [number, number, number][] = [
        [-0.1, 0, bondDist],
        [-0.1, 0, -bondDist],
        [bondDist, 0, 0],
      ];
      ligands.forEach((lig, i) => {
        const p = dirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else {
      // E === 3: Linear (XeF2)
      molecularGeometry = 'Lineal';
      realAngle = '180°';
      description = 'Geometría lineal con 3 pares solitarios coplanares a 120°.';
      academicNotes = 'Tres pares libres llenan simétricamente el ecuador; los dos enlaces restantes quedan en el eje axial a 180°.';

      lonePairs.push({ direction: [0, lpDist, 0], label: 'Par ecuatorial 1' });
      lonePairs.push({ direction: [lpDist * 0.866, -lpDist * 0.5, 0], label: 'Par ecuatorial 2' });
      lonePairs.push({ direction: [-lpDist * 0.866, -lpDist * 0.5, 0], label: 'Par ecuatorial 3' });
      const dirs: [number, number, number][] = [
        [0, 0, bondDist],
        [0, 0, -bondDist],
      ];
      ligands.forEach((lig, i) => {
        const p = dirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    }
  } else {
    // SN = 6: Octahedral (sp3d2)
    electronGeometry = 'Octaédrica';
    hybridization = 'sp³d²';
    idealAngle = '90°';

    if (E === 0) {
      molecularGeometry = 'Octaédrica';
      realAngle = '90°';
      description = 'Geometría octaédrica regular de máxima simetría (Oh).';
      academicNotes = 'Todos los 6 vértices son geométricamente equivalentes con ángulos rectos exactos de 90°.';

      const octDirs: [number, number, number][] = [
        [bondDist, 0, 0],
        [-bondDist, 0, 0],
        [0, bondDist, 0],
        [0, -bondDist, 0],
        [0, 0, bondDist],
        [0, 0, -bondDist],
      ];
      ligands.forEach((lig, i) => {
        const p = octDirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else if (E === 1) {
      // Square Pyramidal (BrF5)
      molecularGeometry = 'Piramidal cuadrangular';
      realAngle = '~85°';
      description = 'Piramidal cuadrangular con 1 par libre basal que repele a los cuatro ligandos.';
      academicNotes = 'La repulsión del par solitario curva los 4 enlaces basales hacia arriba (84.8°).';

      lonePairs.push({ direction: [0, 0, -lpDist], label: 'Par solitario inferior' });
      const dirs: [number, number, number][] = [
        [0, 0, bondDist],
        [bondDist, 0, -0.15],
        [-bondDist, 0, -0.15],
        [0, bondDist, -0.15],
        [0, -bondDist, -0.15],
      ];
      ligands.forEach((lig, i) => {
        const p = dirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    } else {
      // Square Planar (XeF4)
      molecularGeometry = 'Cuadrada plana';
      realAngle = '90°';
      description = 'Cuadrada plana. Los dos pares solitarios se colocan en posiciones trans (180°).';
      academicNotes = 'Los dos pares solitarios ocupan polos opuestos en simetría D4h, cancelando su distorsión angular.';

      lonePairs.push({ direction: [0, 0, lpDist], label: 'Par axial superior' });
      lonePairs.push({ direction: [0, 0, -lpDist], label: 'Par axial inferior' });
      const dirs: [number, number, number][] = [
        [bondDist, 0, 0],
        [-bondDist, 0, 0],
        [0, bondDist, 0],
        [0, -bondDist, 0],
      ];
      ligands.forEach((lig, i) => {
        const p = dirs[i] || [0, 0, 0];
        const props = getElementVisualProps(lig.symbol);
        atoms.push({
          symbol: lig.symbol,
          name: props.name,
          position: p,
          color: props.color,
          radius: props.radius,
        });
        bonds.push({ atom1: 0, atom2: atoms.length - 1, order: lig.bondOrder });
      });
    }
  }

  // Calculate Net Dipole Moment Vector
  const centralEN = centralElement.electronegativity || 2.5;
  let netDipole = [0, 0, 0];

  atoms.forEach((atom, idx) => {
    if (idx === 0) return; // skip central
    const el = ELEMENTS_DATA.find((e) => e.symbol.toLowerCase() === atom.symbol.toLowerCase());
    const ligandEN = el?.electronegativity || 2.5;
    const deltaEN = ligandEN - centralEN;

    // Vector from central to ligand
    const p = atom.position;
    const mag = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]) || 1;
    const norm = [p[0] / mag, p[1] / mag, p[2] / mag];

    netDipole[0] += norm[0] * deltaEN;
    netDipole[1] += norm[1] * deltaEN;
    netDipole[2] += norm[2] * deltaEN;
  });

  const dipoleMag = Math.sqrt(
    netDipole[0] * netDipole[0] + netDipole[1] * netDipole[1] + netDipole[2] * netDipole[2]
  );

  const dipoleMomentD = Number((dipoleMag * 1.1).toFixed(2));
  const polarity: 'Polar' | 'No polar' = dipoleMomentD > 0.15 ? 'Polar' : 'No polar';

  // Construct Chemical Formula e.g. "CCl4" or "H2O"
  const ligandCounts: Record<string, number> = {};
  ligands.forEach((l) => {
    ligandCounts[l.symbol] = (ligandCounts[l.symbol] || 0) + 1;
  });

  let formula = centralElement.symbol;
  Object.entries(ligandCounts).forEach(([sym, count]) => {
    formula += sym + (count > 1 ? count : '');
  });

  const axe = `AX${X}${E > 0 ? `E${E}` : ''}`;
  const name = `${centralElement.name} con ${X} ligando${X !== 1 ? 's' : ''}`;

  return {
    formula,
    name,
    axe,
    stericNumber: SN,
    bondedCount: X,
    lonePairsCount: E,
    electronGeometry,
    molecularGeometry,
    hybridization,
    idealAngle,
    realAngle,
    polarity,
    dipoleMomentD,
    atoms,
    lonePairs,
    bonds,
    description,
    academicNotes,
  };
}
