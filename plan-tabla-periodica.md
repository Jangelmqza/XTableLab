 # Plan de trabajo: Tabla periódica didáctica e interactiva

**Público:** estudiantes universitarios (química general, inorgánica, ingeniería, biología, medicina)
**Duración estimada:** 8-10 semanas
**Objetivo:** que el estudiante *entienda* por qué la tabla está organizada así, no solo que la consulte.

---

## Control y Seguimiento del Proyecto

### Tareas pendientes
- [ ] Módulo de visualización tridimensional de moléculas (VSEPR / Three.js)

### Tareas realizadas
- [x] Optimizar experiencia responsive para móvil (vista Fichas, scroll asistido, touch) y modo sin conexión (PWA instalable, Service Worker y WebApp Manifest)
- [x] Lectura, análisis del plan de trabajo y estructuración del sistema de tareas en `plan-tabla-periodica.md`
- [x] Inicializar proyecto frontend con stack completo (React 19 + Vite 8 + Tailwind CSS v4 + Lucide Icons)
- [x] Estructurar dataset completo y verificado de los 118 elementos periódicos (IUPAC / NIST) con datos atómicos, capas de Bohr, constates fisicoquímicas, resúmenes didácticos y análisis cuántico universitario en español
- [x] Desarrollar cuadrícula periódica interactiva con 18 columnas, 7 periodos, anclajes de lantánidos/actínidos y filas f independientes
- [x] Desarrollar sistema de filtros por categoría, bloques cuánticos s/p/d/f, radioactividad, buscador en tiempo real y termostato de 0 K a 6000 K
- [x] Desarrollar mapa de calor para tendencias periódicas (electronegatividad, radio atómico, 1ª energía de ionización, afinidad electrónica, densidad, fusión, ebullición, masa) con leyenda didáctica
- [x] Desarrollar panel/modal interactivo de elemento con visión rápida, sección universitaria "A fondo", modelo orbital de Bohr y constantes fisicoquímicas
- [x] Desarrollar comparador paramétrico simultáneo de 2 a 3 elementos con predicción teórica de enlace y contraste de propiedades
- [x] Desarrollar simulador interactivo del átomo e isótopos (modelo de Bohr dinámico, carga neta, número másico y franja de estabilidad nuclear N/Z)
- [x] Desarrollar simulador cuántico de configuración electrónica (diagrama de Moeller, orden de Aufbau, principio de Pauli, regla de Hund con cajas de orbitales y explicación de anomalías reales como Cr, Cu, Au)
- [x] Desarrollar simulador didáctico de enlaces químicos (cálculo de ΔEN de Pauling, porcentaje de carácter iónico, clasificación y visualización vectorial de dipolos)
- [x] Desarrollar módulo de autoevaluación y quizzes con 4 modalidades formativas y retroalimentación teórica inmediata

---

## 1. Definición del proyecto (semana 1)

- **Plataforma recomendada:** web (funciona en celular y computadora, sin instalar). Convertible a PWA para uso sin internet.
- **Stack sugerido:**
  - React + Vite
  - D3.js (gráficas y tendencias)
  - Three.js (modelos 3D)
  - Canvas/SVG (animaciones)
  - Tailwind CSS (estilos)
- **Entregables:** tabla interactiva, simulaciones, módulo de estudio (quizzes y flashcards), versión publicada.

---

## 2. Datos (semana 1-2)

- Usar un dataset abierto en JSON (PubChem, *Periodic-Table-JSON* en GitHub) y limpiarlo.
- Propiedades necesarias:
  - Número y masa atómica
  - Configuración electrónica
  - Electronegatividad
  - Radio atómico
  - Energía de ionización y afinidad electrónica
  - Estados de oxidación
  - Puntos de fusión y ebullición, densidad
  - Isótopos
  - Categoría, descubrimiento y usos
- Validar contra una fuente confiable (IUPAC / NIST). En una herramienta educativa, un dato erróneo cuesta mucho.

---

## 3. Tabla base interactiva (semana 2-3)

- Tabla completa con colores por categoría, bloque, estado de la materia o grupo.
- Ficha detallada por elemento (clic o toque).
- Buscador y filtros combinables.
- **Mapa de calor de tendencias:** colorear la tabla por radio atómico, electronegatividad, energía de ionización, etc.
- Comparador de 2 o 3 elementos.

---

## 4. Simulaciones (semana 3-7)

| Simulación | Qué aprende el estudiante |
|---|---|
| **Átomo interactivo** (Bohr y orbitales) | Agregar protones, neutrones y electrones y ver cómo cambia el elemento, la carga y la estabilidad |
| **Configuración electrónica (Aufbau)** | Llenado animado de orbitales con reglas de Hund y Pauli |
| **Tendencias periódicas** | Gráficas dinámicas por periodo y grupo, con explicación del porqué |
| **Enlaces químicos** | Elegir dos elementos y ver si el enlace es iónico, covalente polar o no polar según la diferencia de electronegatividad |
| **Moléculas 3D (VSEPR / Lewis)** | Geometría molecular rotable en 3D |
| **Reacciones y balanceo** | Balancear ecuaciones paso a paso con retroalimentación |
| **Estequiometría** | Masa molar, moles, reactivo limitante |
| **Isótopos y decaimiento radiactivo** | Vida media, series de decaimiento, simulación de muestras |
| **Espectros de emisión** | Líneas espectrales de cada elemento y su relación con los niveles de energía |
| **Gases** | PV = nRT con partículas en movimiento |

**Prioridad inicial:** átomo interactivo, configuración electrónica, tendencias y enlaces (mayor valor didáctico por esfuerzo).

---

## 5. Capa didáctica (semana 5-8)

- Explicaciones en dos niveles: "rápido" y "a fondo".
- Quizzes y flashcards con repetición espaciada.
- Modo reto: "ubica el elemento", "predice la tendencia", "adivina por propiedades".
- Progreso del estudiante: logros, racha, temas dominados.
- Modo profesor (opcional): compartir ejercicios o quizzes por enlace.

---

## 6. Calidad y lanzamiento (semana 8-10)

- Pruebas en celulares y navegadores distintos.
- Accesibilidad: contraste, paletas para daltonismo, navegación con teclado.
- Rendimiento: carga rápida y animaciones fluidas a 60 fps.
- Revisión de contenido con un profesor o estudiante de química.
- Publicación (Vercel, Netlify o GitHub Pages) y recolección de retroalimentación.

---

## Cronograma resumido

| Semana | Entregable |
|---|---|
| 1 | Definición, stack, estructura del proyecto |
| 1-2 | Dataset limpio y validado |
| 2-3 | Tabla interactiva + fichas + mapa de calor |
| 3-5 | Simulaciones prioritarias (átomo, Aufbau, tendencias, enlaces) |
| 5-7 | Simulaciones restantes |
| 5-8 | Quizzes, flashcards, gamificación |
| 8-10 | Pruebas, accesibilidad, publicación |

---

## Priorización

- **MVP (semanas 1-4):** tabla interactiva, fichas, mapa de calor de tendencias y 2 simulaciones (átomo y configuración electrónica).
- **Versión 1.0:** resto de simulaciones clave y quizzes.
- **Después:** moléculas 3D, modo profesor, idiomas, modo offline.

---

## Riesgos principales

| Riesgo | Mitigación |
|---|---|
| Alcance excesivo (demasiadas simulaciones posibles) | Cerrar la lista de simulaciones antes de empezar y trabajar por MVP |
| Datos incorrectos o incompletos | Validar contra IUPAC/NIST desde el inicio |
| Bajo rendimiento en celulares | Usar 3D con moderación y optimizar animaciones |
| Contenido didáctico poco claro | Revisión con docentes y pruebas con estudiantes reales |
