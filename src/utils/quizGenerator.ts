import type { ElementData } from '../types/element';
import { CATEGORY_COLORS } from '../data/elementsData';
import { classifyBond, type QuizBondLabel } from './bonds';
import { formatElectronConfiguration } from './electronConfig';

export type QuizCategory = 'symbols' | 'trends' | 'config' | 'bonds';

export interface Question {
  category: QuizCategory;
  title: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Barajado uniforme Fisher-Yates que devuelve un nuevo arreglo.
 */
function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const BOND_QUIZ_PAIRS: [string, string][] = [
  // Enlaces Iónicos
  ['Na', 'Cl'],
  ['K', 'F'],
  ['Mg', 'O'],
  ['Ca', 'Cl'],
  ['Ca', 'F'],
  ['Li', 'Br'],
  ['Ba', 'S'],
  // Enlaces Covalentes Polares
  ['H', 'O'],
  ['H', 'Cl'],
  ['H', 'F'],
  ['C', 'O'],
  ['N', 'H'],
  ['P', 'Cl'],
  ['S', 'O'],
  ['B', 'F'],
  ['Si', 'O'],
  // Enlaces Covalentes No Polares / Apolares
  ['C', 'H'],
  ['C', 'C'],
  ['N', 'N'],
  ['O', 'O'],
  ['Cl', 'Cl'],
  ['Br', 'Br'],
  // Enlaces Metálicos / Aleaciones
  ['Cu', 'Zn'],
  ['Fe', 'Ni'],
  ['Au', 'Ag'],
  ['Pt', 'Au'],
  ['Ti', 'Al'],
];

/**
 * Genera una pregunta aleatoria para la categoría indicada del módulo de Quiz.
 */
export function generateQuestion(cat: QuizCategory, elements: ElementData[]): Question {
  // 1. Symbols & Names
  if (cat === 'symbols') {
    const target = elements[Math.floor(Math.random() * elements.length)];
    const isNameToSymbol = Math.random() > 0.5;

    const wrong = shuffleArray(
      elements.filter((e) => e.atomicNumber !== target.atomicNumber)
    ).slice(0, 3);

    if (isNameToSymbol) {
      const options = shuffleArray([target.symbol, ...wrong.map((w) => w.symbol)]);
      const correctIndex = options.indexOf(target.symbol);
      return {
        category: 'symbols',
        title: 'Símbolos Químicos',
        prompt: `¿Cuál es el símbolo químico correcto para el elemento "${target.name}" (Z = ${target.atomicNumber})?`,
        options,
        correctIndex,
        explanation: `El símbolo de ${target.name} es ${target.symbol}. Su masa atómica aproximada es ${target.atomicMass.toFixed(2)} u y pertenece a la categoría de ${CATEGORY_COLORS[target.category]?.name || target.category}.`,
      };
    } else {
      const options = shuffleArray([target.name, ...wrong.map((w) => w.name)]);
      const correctIndex = options.indexOf(target.name);
      const discoveryText =
        String(target.yearDiscovered).toLowerCase().includes('antig')
          ? 'conocido desde la Antigüedad'
          : `descubierto en ${target.yearDiscovered}`;
      return {
        category: 'symbols',
        title: 'Nomenclatura Elemental',
        prompt: `¿A qué elemento químico corresponde el símbolo "${target.symbol}"?`,
        options,
        correctIndex,
        explanation: `El símbolo "${target.symbol}" corresponde al ${target.name} (Z = ${target.atomicNumber}), ${discoveryText}.`,
      };
    }
  }

  // 2. Periodic Trends
  if (cat === 'trends') {
    const valid = elements.filter(
      (e) =>
        e.electronegativity !== null &&
        e.atomicRadius !== null &&
        e.ionizationEnergy !== null
    );
    const e1 = valid[Math.floor(Math.random() * valid.length)];
    const candidates = valid.filter(
      (e) =>
        e.atomicNumber !== e1.atomicNumber &&
        e.electronegativity !== e1.electronegativity &&
        e.atomicRadius !== e1.atomicRadius &&
        e.ionizationEnergy !== e1.ionizationEnergy
    );
    const e2 = candidates[Math.floor(Math.random() * candidates.length)] || valid[0];

    const trendType = Math.random();
    if (trendType < 0.33) {
      const higher = e1.electronegativity! > e2.electronegativity! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = shuffleArray([higher.name, lower.name]);
      return {
        category: 'trends',
        title: 'Tendencia: Electronegatividad',
        prompt: `Entre el ${e1.name} (${e1.symbol}) y el ${e2.name} (${e2.symbol}), ¿cuál posee MAYOR electronegatividad en la escala de Pauling?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} tiene una electronegatividad de ${higher.electronegativity?.toFixed(2)}, superior a la de ${lower.name} (${lower.electronegativity?.toFixed(2)}). La electronegatividad aumenta hacia arriba y a la derecha por incremento de carga nuclear efectiva Z_eff.`,
      };
    } else if (trendType < 0.66) {
      const higher = e1.atomicRadius! > e2.atomicRadius! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = shuffleArray([higher.name, lower.name]);
      return {
        category: 'trends',
        title: 'Tendencia: Radio Atómico',
        prompt: `¿Cuál de estos dos elementos posee un MAYOR radio atómico: ${e1.name} o ${e2.name}?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} posee un radio de ${higher.atomicRadius} pm frente a ${lower.atomicRadius} pm de ${lower.name}. El radio atómico aumenta hacia abajo (más capas principales n) y hacia la izquierda (menor contracción por Z_eff).`,
      };
    } else {
      const higher = e1.ionizationEnergy! > e2.ionizationEnergy! ? e1 : e2;
      const lower = higher === e1 ? e2 : e1;
      const options = shuffleArray([higher.name, lower.name]);
      return {
        category: 'trends',
        title: 'Tendencia: 1ª Energía de Ionización',
        prompt: `¿Qué elemento requiere MAYOR energía para arrancar su electrón más externo: ${e1.name} o ${e2.name}?`,
        options,
        correctIndex: options.indexOf(higher.name),
        explanation: `${higher.name} requiere ${higher.ionizationEnergy?.toFixed(2)} eV frente a ${lower.ionizationEnergy?.toFixed(2)} eV de ${lower.name}. Los átomos más pequeños y con mayor Z_eff retienen más fuertemente sus electrones.`,
      };
    }
  }

  // 3. Electron Configuration (main-group s & p block elements up to Z=36 for unambiguous valence shell count)
  if (cat === 'config') {
    const mainGroupElements = elements.filter(
      (e) => e.atomicNumber <= 36 && (e.block === 's' || e.block === 'p')
    );
    const target =
      mainGroupElements[Math.floor(Math.random() * mainGroupElements.length)] || elements[0];
    const valenceElectrons = target.electronsPerShell[target.electronsPerShell.length - 1];

    const distractorPool = [1, 2, 3, 4, 5, 6, 7, 8].filter((n) => n !== valenceElectrons);
    const chosenNumbers = [
      valenceElectrons,
      ...shuffleArray(distractorPool).slice(0, 3),
    ];

    const correctLabel = `${valenceElectrons} ${valenceElectrons === 1 ? 'electrón' : 'electrones'}`;
    const shuffled = shuffleArray(
      chosenNumbers.map((n) => `${n} ${n === 1 ? 'electrón' : 'electrones'}`)
    );

    return {
      category: 'config',
      title: 'Electrones de Valencia',
      prompt: `¿Cuántos electrones tiene en su capa de valencia más externa un átomo neutro de ${target.name} (${target.symbol}, Z = ${target.atomicNumber})?`,
      options: shuffled,
      correctIndex: shuffled.indexOf(correctLabel),
      explanation: `El ${target.name} presenta la configuración ${formatElectronConfiguration(target.electronConfiguration)}, con distribución por capas [${target.electronsPerShell.join(', ')}]. Su nivel principal más externo contiene exactamente ${valenceElectrons} ${valenceElectrons === 1 ? 'electrón' : 'electrones'}.`,
    };
  }

  // 4. Chemical Bonds (unified with classifyBond)
  const [symA, symB] = BOND_QUIZ_PAIRS[Math.floor(Math.random() * BOND_QUIZ_PAIRS.length)];
  const elA = elements.find((e) => e.symbol === symA) || elements[0];
  const elB = elements.find((e) => e.symbol === symB) || elements[1];
  const bondInfo = classifyBond(elA, elB);

  const bondOptions: QuizBondLabel[] = [
    'Enlace Iónico',
    'Enlace Covalente Polar',
    'Enlace Covalente No Polar',
    'Enlace Metálico',
  ];

  return {
    category: 'bonds',
    title: 'Predicción de Enlace Químico',
    prompt: `¿Qué tipo de enlace químico predomina al unirse átomos de ${elA.name} (${elA.symbol}) y ${elB.name} (${elB.symbol})?`,
    options: bondOptions,
    correctIndex: bondOptions.indexOf(bondInfo.quizLabel),
    explanation: bondInfo.description,
  };
}
