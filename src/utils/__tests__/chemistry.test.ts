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

