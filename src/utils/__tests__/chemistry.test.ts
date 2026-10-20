import { describe, it, expect } from 'vitest';
import { ELEMENTS_DATA } from '../../data/elementsData';
import { normalizeSearchText, matchesElementFilter, filterElements } from '../filters';
import { classifyBond, calculateIonicPercentage, isMetallicElement } from '../bonds';
import {
  calculateOrbitalBoxes,
  formatConfigurationString,
  getAnomalyNote,
} from '../electronConfig';
import {
  getDefaultNeutrons,
  checkNuclearStability,
  calculateElectronShells,
} from '../nuclear';
import {
  getNormalizedTrendValue,
  getTrendColor,
  getPhaseAtTemperature,
  TREND_INFO,
} from '../trends';
import { VSEPR_MOLECULES } from '../../data/vseprData';
import {
  getValenceElectrons,
  calculateAutoLonePairs,
  generateVsepr3DGeometry,
} from '../vseprEngine';
import { generateQuestion } from '../../components/Quiz/QuizModule';

const getElementByZ = (z: number) => {
  const el = ELEMENTS_DATA.find((e) => e.atomicNumber === z);
  if (!el) throw new Error(`Element Z=${z} not found`);
  return el;
};

describe('filters.ts — Búsqueda y filtrado unificado', () => {
  it('normaliza acentos, mayúsculas y espacios correctamente', () => {
    expect(normalizeSearchText('  Hidrógeno  ')).toBe('hidrogeno');
    expect(normalizeSearchText('LANTÁNIDO')).toBe('lantanido');
    expect(normalizeSearchText('Fósforo')).toBe('fosforo');
  });

  it('encuentra elementos por nombre con o sin acentos, símbolo o número atómico', () => {
    const hydrogen = getElementByZ(1);
    expect(
      matchesElementFilter(hydrogen, {
        selectedCategory: 'all',
        selectedBlock: 'all',
        onlyRadioactive: false,
        searchQuery: 'hidrogeno',
      })
    ).toBe(true);

    expect(
      matchesElementFilter(hydrogen, {
        selectedCategory: 'all',
        selectedBlock: 'all',
        onlyRadioactive: false,
        searchQuery: '1',
      })
    ).toBe(true);
  });

  it('filtra el dataset completo por categoría, bloque y radiactividad', () => {
    const nobleGases = filterElements(ELEMENTS_DATA, {
      selectedCategory: 'noble-gas',
      selectedBlock: 'all',
      onlyRadioactive: false,
      searchQuery: '',
    });
    expect(nobleGases.length).toBe(7);

    const radioactiveOnly = filterElements(ELEMENTS_DATA, {
      selectedCategory: 'all',
      selectedBlock: 'all',
      onlyRadioactive: true,
      searchQuery: '',
    });
    expect(radioactiveOnly.every((e) => e.radioactive)).toBe(true);
  });
});

describe('bonds.ts — Clasificación unificada de enlaces químicos (D5)', () => {
  it('clasifica dos metales como Enlace Metálico (ej. Fe + Cu, Au + Au)', () => {
    const fe = getElementByZ(26);
    const cu = getElementByZ(29);
    const au = getElementByZ(79);

    expect(isMetallicElement(fe)).toBe(true);
    expect(classifyBond(fe, cu).bondClass).toBe('metallic');
    expect(classifyBond(fe, cu).quizLabel).toBe('Enlace Metálico');
    expect(classifyBond(au, au).bondClass).toBe('metallic');
  });

  it('clasifica enlaces covalentes apolares, polares e iónicos según Δχ', () => {
    const c = getElementByZ(6); // EN = 2.55
    const h = getElementByZ(1); // EN = 2.20 -> ΔEN = 0.35 (apolar)
    const o = getElementByZ(8); // EN = 3.44 -> ΔEN(O-H) = 1.24 (polar)
    const na = getElementByZ(11); // EN = 0.93
    const cl = getElementByZ(17); // EN = 3.16 -> ΔEN(Na-Cl) = 2.23 (iónico)

    expect(classifyBond(c, h).bondClass).toBe('nonpolar-covalent');
    expect(classifyBond(o, h).bondClass).toBe('polar-covalent');
    expect(classifyBond(na, cl).bondClass).toBe('ionic');
  });

  it('calcula el porcentaje de carácter iónico de Pauling', () => {
    expect(calculateIonicPercentage(0)).toBe(0);
    expect(calculateIonicPercentage(2.0)).toBeGreaterThan(60);
  });
});

describe('electronConfig.ts — Configuración electrónica Real vs. Ideal (D1, D2)', () => {
  it('respeta las anomalías cuánticas reales en Cr (Z=24), Cu (Z=29) y Pd (Z=46)', () => {
    const crReal = calculateOrbitalBoxes(24, 'real');
    const crIdeal = calculateOrbitalBoxes(24, 'aufbau');
    expect(formatConfigurationString(crReal, 'filling')).toContain('4s¹ 3d⁵');
    expect(formatConfigurationString(crIdeal, 'filling')).toContain('4s² 3d⁴');

    const cuReal = calculateOrbitalBoxes(29, 'real');
    expect(formatConfigurationString(cuReal, 'filling')).toContain('4s¹ 3d¹⁰');

    const pdReal = calculateOrbitalBoxes(46, 'real');
    // Pd tiene 5s⁰ 4d¹⁰ en modo real
    expect(pdReal.find((i) => i.sublevel.name === '5s')?.electronsCount).toBe(0);
    expect(pdReal.find((i) => i.sublevel.name === '4d')?.electronsCount).toBe(10);
  });

  it('ordena la notación por secuencia de llenado (Madelung) o por capa cuántica (n)', () => {
    const feReal = calculateOrbitalBoxes(26, 'real');
    const fillingStr = formatConfigurationString(feReal, 'filling');
    const shellStr = formatConfigurationString(feReal, 'shell');

    expect(fillingStr.endsWith('4s² 3d⁶')).toBe(true);
    expect(shellStr.endsWith('3d⁶ 4s²')).toBe(true);
  });

  it('devuelve nota explicativa para elementos con anomalía cuántica', () => {
    expect(getAnomalyNote(24)).toBeTruthy();
    expect(getAnomalyNote(29)).toBeTruthy();
    expect(getAnomalyNote(6)).toBeNull();
  });
});

describe('nuclear.ts — Isótopos más abundantes, estabilidad nuclear y capas de iones (D4)', () => {
  it('asigna el isótopo natural estable más abundante en Cu (63Cu), Ni (58Ni) y Br (79Br)', () => {
    const cu = getElementByZ(29);
    const ni = getElementByZ(28);
    const br = getElementByZ(35);

    expect(cu.atomicNumber + getDefaultNeutrons(cu)).toBe(63);
    expect(ni.atomicNumber + getDefaultNeutrons(ni)).toBe(58);
    expect(br.atomicNumber + getDefaultNeutrons(br)).toBe(79);
  });

  it('identifica correctamente la inestabilidad de Tc (Z=43), Pm (Z=61), Bi (Z=83) y 8Be', () => {
    expect(checkNuclearStability(43, 55).isStable).toBe(false); // Tc
    expect(checkNuclearStability(61, 84).isStable).toBe(false); // Pm
    expect(checkNuclearStability(83, 126).isStable).toBe(false); // Bi-209
    expect(checkNuclearStability(4, 4).isStable).toBe(false); // Be-8

    // Isótopos estables clásicos
    expect(checkNuclearStability(6, 6).isStable).toBe(true); // C-12
    expect(checkNuclearStability(7, 7).isStable).toBe(true); // N-14 (impar-impar ligero estable)
    expect(checkNuclearStability(29, 34).isStable).toBe(true); // Cu-63
  });

  it('calcula la distribución por capas para átomos neutros e iones', () => {
    const ca = getElementByZ(20);
    const fe = getElementByZ(26);
    // Calcio neutro (Z=20): [2, 8, 8, 2]
    expect(calculateElectronShells(20, ca)).toEqual([2, 8, 8, 2]);
    // Catión Ca2+ (18 e-): [2, 8, 8]
    expect(calculateElectronShells(18, ca)).toEqual([2, 8, 8]);
    // Hierro neutro (Z=26): [2, 8, 14, 2]
    expect(calculateElectronShells(26, fe)).toEqual([2, 8, 14, 2]);
  });
});

describe('trends.ts — Tendencias periódicas, paleta daltonismo y sublimación (D3)', () => {
  it('usa min y max precomputados en getNormalizedTrendValue', () => {
    const boron = getElementByZ(5); // EN = 2.04
    const helium = getElementByZ(2); // EN = null
    expect(getNormalizedTrendValue(boron, 'electronegativity', ELEMENTS_DATA, 0, 4.08)).toBeCloseTo(
      0.5,
      2
    );
    expect(getNormalizedTrendValue(helium, 'electronegativity', ELEMENTS_DATA, 0, 4)).toBeNull();
  });

  it('genera colores distintos para paleta estándar y modo daltonismo (Cividis)', () => {
    const stdColor = getTrendColor(0.5, 'standard');
    const cbColor = getTrendColor(0.5, 'colorblind');
    expect(stdColor.bg).not.toBe(cbColor.bg);
    expect(cbColor.bg).toMatch(/^rgba\(/);
  });

  it('maneja correctamente la sublimación del Arsénico (Z=33, mp > bp a 1 atm)', () => {
    const arsenic = getElementByZ(33);
    expect(getPhaseAtTemperature(arsenic, 300)).toBe('solid');
    expect(getPhaseAtTemperature(arsenic, 950)).toBe('gas');
  });

  it('describe correctamente los extremos de radio atómico y electronegatividad (D3)', () => {
    expect(TREND_INFO.atomicRadius.higherIs).toContain('Francio: 348 pm');
    expect(TREND_INFO.atomicRadius.higherIs).toContain('Cesio: 343 pm');
    expect(TREND_INFO.electronegativity.higherIs).toContain('Flúor: 3.98');
    expect(TREND_INFO.electronegativity.lowerIs).toContain('Francio: 0.70');
  });
});

describe('QuizModule.tsx — Generador de preguntas científicas sin duplicados', () => {
  it('genera preguntas válidas con opciones únicas en las 4 categorías', () => {
    const categories = ['symbols', 'trends', 'config', 'bonds'] as const;
    for (const cat of categories) {
      const expectedOptionsCount = cat === 'trends' ? 2 : 4;
      for (let i = 0; i < 15; i++) {
        const q = generateQuestion(cat, ELEMENTS_DATA);
        expect(q.options.length).toBe(expectedOptionsCount);
        expect(new Set(q.options).size).toBe(expectedOptionsCount);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(expectedOptionsCount);
      }
    }
  });
});

describe('vseprData.ts — Validación matemática y química de moléculas 3D VSEPR', () => {
  it('contiene moléculas con conteo coherente de número estérico (SN = X + E)', () => {
    expect(VSEPR_MOLECULES.length).toBeGreaterThanOrEqual(14);
    for (const mol of VSEPR_MOLECULES) {
      expect(mol.stericNumber).toBe(mol.bondedAtomsCount + mol.lonePairsCount);
      expect(mol.stericNumber).toBeGreaterThanOrEqual(2);
      expect(mol.stericNumber).toBeLessThanOrEqual(6);
      expect(mol.atoms.length).toBe(mol.bondedAtomsCount + 1); // 1 central + X ligandos
      expect(mol.lonePairs.length).toBe(mol.lonePairsCount);
    }
  });

  it('verifica que las coordenadas 3D de átomos y enlaces sean válidas', () => {
    for (const mol of VSEPR_MOLECULES) {
      // Posición del átomo central en o cerca del origen
      const central = mol.atoms.find((a) => a.isCentral);
      expect(central).toBeDefined();

      for (const atom of mol.atoms) {
        expect(atom.position.length).toBe(3);
        atom.position.forEach((coord) => {
          expect(typeof coord).toBe('number');
          expect(isNaN(coord)).toBe(false);
        });
      }

      // Enlaces apuntan a índices válidos dentro de atoms
      for (const [i1, i2] of mol.bonds) {
        expect(i1).toBeGreaterThanOrEqual(0);
        expect(i1).toBeLessThan(mol.atoms.length);
        expect(i2).toBeGreaterThanOrEqual(0);
        expect(i2).toBeLessThan(mol.atoms.length);
        expect(i1).not.toBe(i2);
      }
    }
  });

  it('clasifica polaridad y geometrías canónicas correctamente', () => {
    const h2o = VSEPR_MOLECULES.find((m) => m.id === 'h2o');
    expect(h2o?.molecularGeometry).toBe('Angular');
    expect(h2o?.polarity).toBe('Polar');
    expect(h2o?.hybridization).toBe('sp³');

    const ch4 = VSEPR_MOLECULES.find((m) => m.id === 'ch4');
    expect(ch4?.molecularGeometry).toBe('Tetraédrica');
    expect(ch4?.polarity).toBe('No polar');
    expect(ch4?.hybridization).toBe('sp³');

    const sf6 = VSEPR_MOLECULES.find((m) => m.id === 'sf6');
    expect(sf6?.molecularGeometry).toBe('Octaédrica');
    expect(sf6?.polarity).toBe('No polar');
    expect(sf6?.hybridization).toBe('sp³d²');
  });

  it('motor interactivo vseprEngine calcula pares libres y geometrías dinámicas personalizadas', () => {
    const carbon = getElementByZ(6);
    const nitrogen = getElementByZ(7);
    const oxygen = getElementByZ(8);

    expect(getValenceElectrons(carbon)).toBe(4);
    expect(getValenceElectrons(nitrogen)).toBe(5);
    expect(getValenceElectrons(oxygen)).toBe(6);

    // CH4: 4 enlaces simples -> 0 pares libres
    const ch4Ligands = [
      { id: '1', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
      { id: '2', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
      { id: '3', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
      { id: '4', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
    ];
    expect(calculateAutoLonePairs(carbon, ch4Ligands)).toBe(0);

    // H2O: 2 enlaces simples en O -> 2 pares libres
    const h2oLigands = [
      { id: '1', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
      { id: '2', symbol: 'H', name: 'Hidrógeno', bondOrder: 1 as const },
    ];
    expect(calculateAutoLonePairs(oxygen, h2oLigands)).toBe(2);

    // Generar geometría personalizada para CO2 (C con 2 oxígenos de doble enlace)
    const co2Ligands = [
      { id: '1', symbol: 'O', name: 'Oxígeno', bondOrder: 2 as const },
      { id: '2', symbol: 'O', name: 'Oxígeno', bondOrder: 2 as const },
    ];
    const co2Mol = generateVsepr3DGeometry(carbon, co2Ligands, 0);
    expect(co2Mol.molecularGeometry).toBe('Lineal');
    expect(co2Mol.hybridization).toBe('sp');
    expect(co2Mol.idealAngle).toBe('180°');
    expect(co2Mol.atoms.length).toBe(3);
    expect(co2Mol.bonds.length).toBe(2);
    expect(co2Mol.bonds[0].order).toBe(2);

    // Caso diatómico (X = 1): sin ángulo interatómico aplicable
    const hclLigands = [{ id: '1', symbol: 'Cl', name: 'Cloro', bondOrder: 1 as const }];
    const hydrogen = getElementByZ(1);
    const hclMol = generateVsepr3DGeometry(hydrogen, hclLigands, 0);
    expect(hclMol.molecularGeometry).toBe('Lineal');
    expect(hclMol.idealAngle).toBe('N/A');
    expect(hclMol.realAngle).toBe('N/A');
    expect(hclMol.atoms.length).toBe(2);

    // Limitación física: X + E no excede 6 dominios
    const fiveLigands = [
      { id: '1', symbol: 'F', name: 'Flúor', bondOrder: 1 as const },
      { id: '2', symbol: 'F', name: 'Flúor', bondOrder: 1 as const },
      { id: '3', symbol: 'F', name: 'Flúor', bondOrder: 1 as const },
      { id: '4', symbol: 'F', name: 'Flúor', bondOrder: 1 as const },
      { id: '5', symbol: 'F', name: 'Flúor', bondOrder: 1 as const },
    ];
    const sulfur = getElementByZ(16);
    // Intentar 3 pares libres con 5 ligandos (5+3=8) debe acotarse a 1 par libre máximo (5+1=6)
    const clampedMol = generateVsepr3DGeometry(sulfur, fiveLigands, 3);
    expect(clampedMol.stericNumber).toBe(6);
    expect(clampedMol.lonePairsCount).toBe(1);
    expect(clampedMol.bondedCount).toBe(5);
  });
});


