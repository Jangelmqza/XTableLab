<div align="center">

# ⚗️ XTableLab — Tabla Periódica Interactiva / Interactive Periodic Table

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[🇪🇸 Español](#español) · [🇬🇧 English](#english)**

</div>

---

## 🇪🇸 Español

### ¿Por qué construí esto?

Estudiar la tabla periódica siempre ha sido un reto, tanto para estudiantes de preparatoria que la ven por primera vez como para universitarios que necesitan comprenderla a un nivel más profundo (química general, inorgánica, ingeniería, biología, medicina). Las herramientas existentes suelen ser simples fichas de consulta: muestran los datos, pero no te ayudan a *entender* por qué la tabla está organizada así ni la lógica detrás de las tendencias periódicas.

Desarrollé **XTableLab** para cambiar eso. El objetivo no es que el estudiante *consulte* la tabla, sino que la *entienda*. Cada elemento, simulador y módulo fue diseñado con esa pregunta en mente: ¿cómo puedo hacer que esto haga clic en la cabeza del estudiante?

### ¿Para quién es?

| Nivel | Uso principal |
|---|---|
| 🏫 **Preparatoria** | Introducción visual e intuitiva a la tabla periódica y los conceptos básicos de química |
| 🎓 **Universidad** | Herramienta didáctica de estudio con profundidad universitaria: configuración electrónica, tendencias periódicas, enlaces, simulaciones |

### ✨ Funcionalidades

- **Tabla periódica interactiva** — 118 elementos, 18 columnas, 7 periodos, con lantánidos y actínidos correctamente posicionados
- **Filtros avanzados** — por categoría, bloque cuántico (s/p/d/f), radioactividad, buscador en tiempo real y termostato de 0 K a 6 000 K para ver el estado de la materia
- **Mapa de calor de tendencias** — visualiza electronegatividad, radio atómico, energía de ionización, afinidad electrónica, densidad, puntos de fusión/ebullición y masa
- **Ficha de elemento** — vista rápida + sección universitaria "A fondo" + modelo de Bohr animado
- **Comparador de elementos** — compara 2 o 3 elementos en paralelo con predicción de tipo de enlace
- **Simulador de átomo** — modelo de Bohr dinámico, isótopos, carga neta y franja de estabilidad nuclear N/Z
- **Simulador de configuración electrónica** — diagrama de Moeller, Aufbau, Pauli, regla de Hund, cajas de orbitales y explicación de anomalías reales (Cr, Cu, Au)
- **Simulador de enlaces químicos** — diferencia de electronegatividad de Pauling, porcentaje de carácter iónico, visualización vectorial de dipolos
- **Módulo de quiz** — 4 modalidades de autoevaluación con retroalimentación teórica inmediata

### 🚀 Cómo correrlo localmente

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/xtablelab.git
cd xtablelab

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

### 🛠️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Tipado estático |
| Vite | 8 | Bundler y dev server |
| Tailwind CSS | 4 | Estilos |
| Lucide React | latest | Íconos |

### 📁 Estructura del proyecto

```
src/
├── components/
│   ├── PeriodicTable/     # Tabla, tarjetas, filtros, mapa de calor
│   ├── ElementModal/      # Ficha de elemento + modelo de Bohr
│   ├── Comparator/        # Comparador de elementos
│   ├── Simulators/        # Simuladores de átomo, config. electrónica y enlaces
│   ├── Quiz/              # Módulo de quizzes
│   ├── Navbar/            # Barra de navegación
│   └── InfoModal/         # Modal informativo
├── data/
│   └── elementsData.ts    # Dataset de 118 elementos (IUPAC/NIST)
├── types/
│   └── element.ts         # Tipos TypeScript
└── utils/
    └── trends.ts          # Lógica de tendencias periódicas
```

### 🗺️ Roadmap

- [ ] PWA — modo sin conexión
- [ ] Visualización 3D de moléculas (VSEPR / Three.js)
- [ ] Modo oscuro / daltonismo
- [ ] Modo profesor: compartir ejercicios por enlace

---

## 🇬🇧 English

### Why I built this

Studying the periodic table has always been a challenge — for high school students encountering it for the first time, and for university students who need to understand it at a deeper level (general chemistry, inorganic chemistry, engineering, biology, medicine). Most existing tools are simple reference cards: they show the data, but they don't help you *understand* why the table is organized the way it is, or the logic behind periodic trends.

I built **XTableLab** to change that. The goal isn't for students to *look up* the table — it's for them to *understand* it. Every element card, simulator, and module was designed with one question in mind: how can I make this click in the student's head?

### Who is it for?

| Level | Main use |
|---|---|
| 🏫 **High School** | Visual and intuitive introduction to the periodic table and basic chemistry concepts |
| 🎓 **University** | Educational study tool with university-level depth: electron configuration, periodic trends, chemical bonding, simulations |

### ✨ Features

- **Interactive periodic table** — 118 elements, 18 columns, 7 periods, with lanthanides and actinides correctly placed
- **Advanced filters** — by category, quantum block (s/p/d/f), radioactivity, real-time search, and a 0K–6000K thermostat to visualize states of matter
- **Periodic trend heatmap** — visualize electronegativity, atomic radius, ionization energy, electron affinity, density, melting/boiling points, and atomic mass
- **Element detail card** — quick view + "In Depth" university section + animated Bohr model
- **Element comparator** — compare 2 or 3 elements side by side with bond type prediction
- **Atom simulator** — dynamic Bohr model, isotopes, net charge, and N/Z nuclear stability band
- **Electron configuration simulator** — Moeller diagram, Aufbau, Pauli, Hund's rule, orbital boxes, and explanation of real anomalies (Cr, Cu, Au)
- **Chemical bond simulator** — Pauling electronegativity difference, ionic character percentage, dipole vector visualization
- **Quiz module** — 4 self-assessment modes with immediate theoretical feedback

### 🚀 Getting started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/xtablelab.git
cd xtablelab

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🛠️ Tech stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Static typing |
| Vite | 8 | Bundler & dev server |
| Tailwind CSS | 4 | Styling |
| Lucide React | latest | Icons |

---

<div align="center">

Hecho con ❤️ para alguien especial  · Made with ❤️ for someone special

</div>
