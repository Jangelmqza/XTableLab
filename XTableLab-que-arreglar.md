# XTableLab — Todo lo que se debe arreglar

**Sitio:** https://xtablelab.vercel.app/
**Versión revisada:** v2.0.0 (datos IUPAC & NIST)
**Fecha de revisión:** 11 de noviembre de 2026
**Revisión:** funcional completa en navegador, sin modificar nada en el sitio.

## Lo que sí funciona (no tocar)

- La página carga correctamente y la tabla muestra los 118 elementos, del Hidrógeno (Z 1) al Oganesón (Z 118).
- Lantánidos (57–71) y Actínidos (89–103) aparecen en filas separadas.
- Filtro **Filtrar categoría**: funciona. Opciones: Todas, Metales alcalinos, Alcalinotérreos, Metales de transición, Metales post-transición, Metaloides, No metales reactivos, Gases nobles, Lantánidos, Actínidos y Propiedades desconocidas. Probado: Gases nobles = 7/118 (He, Ne, Ar, Kr, Xe, Rn, Og); los demás se atenúan y aparece el botón «Limpiar filtros».
- Filtro **Bloque**: funciona. Opciones: Todos, s, p, d, f y Radiactivos. Probado: bloque d = 40/118 y Radiactivos = 37/118, ambos conteos correctos.
- Buscador: sí existe («Buscar por nombre, símbolo químico o número atómico»).
- Ficha de detalle: al hacer clic en un elemento se abre su ficha (URL `?el=Fe` / `?el=O`) con pestañas «Resumen» y «A Fondo», con número atómico, masa, categoría, bloque, periodo, grupo, configuración electrónica, electrones por capa, oxidación, modelo de Bohr, electronegatividad, radio atómico, energía de ionización, afinidad electrónica, densidad, temperaturas de fusión y ebullición, estado y aplicaciones.
- Vista **Fichas Móvil**: funciona, lista las 118 fichas ordenadas por Z con símbolo, nombre, masa, categoría, bloque, estado y electronegatividad, y respeta los filtros.
- El cambio a modo oscuro funciona.

---

## 1. Contraste roto en modo claro — LO MÁS URGENTE

**Problema:** en la ficha de detalle, varios textos se ven en color casi blanco sobre fondo claro, así que existen en la página pero son prácticamente invisibles. En modo oscuro todo se lee perfectamente: es un error de tema, esos textos usan colores de modo oscuro estando en modo claro.

**Qué no se ve en modo claro:**
- Los valores de las constantes: electronegatividad, radio atómico, energía de ionización, afinidad electrónica, densidad y temperaturas de fusión/ebullición.
- Los números de Periodo y Grupo.
- Los electrones por capa (K/L/M/N).
- La etiqueta de categoría.
- El botón «Compartir».
- En «Fichas Móvil»: los chips de estado y el botón de comparar.

**Cómo arreglarlo:** dar color de texto oscuro a todos esos valores, etiquetas, chips y botones cuando el tema es claro. Revisar cada componente de la ficha y de las fichas móviles en modo claro, no solo en oscuro.

## 2. Modal en vista móvil tapa el contenido

**Problema:** en vista móvil (500 px), la barra de acciones del modal — Añadir a Comparador, Simular Átomo, Simular Aufbau, Simular Enlace, Molécula 3D, Cerrar — se superpone al contenido y tapa el texto de «Análisis Cuántico», que queda ilegible.

**Cómo arreglarlo:** que la barra de acciones no sea fija ni se superponga al texto. Dejar espacio inferior suficiente para leer el «Análisis Cuántico» completo, por ejemplo con la barra al final del contenido o colapsable.

## 3. Nombres truncados en las celdas, incluso en escritorio

**Problema:** los nombres se cortan incluso a 1920 px: «Hidróg…», «Magne…», «Nitróge…», «Manga…», «Molibd…», «Rutherf…», «Darmst…», «Oganes…», entre otros. El símbolo y la masa sí se leen.

**Cómo arreglarlo:** ajustar el tamaño de la celda o de la fuente para que quepa el nombre completo, o mostrar el nombre completo con un tooltip al pasar el cursor. No depender solo del truncado con puntos suspensivos.

## 4. La navegación superior no cabe

**Problema:** a 1920 px, «Moléculas 3D» queda recortada a solo «M» y «Quizzes» no se ve en la captura, aunque el botón existe en la página.

**Cómo arreglarlo:** hacer responsive el encabezado: menú colapsable (hamburguesa) para los 7 módulos, o reducir espaciados y tamaño de fuente en el menú para que quepan todos.

## 5. Buscador sin prioridad a la coincidencia exacta

**Problema:** el buscador busca por subcadena y devuelve ruido junto al resultado que se quiere.
- «Fe» devuelve 2/118: Hierro y Fermio.
- «Oro» devuelve 4/118: Boro, Fósforo, Cloro y Oro.

Encuentra lo buscado, pero mezclado con otros.

**Cómo arreglarlo:** priorizar la coincidencia exacta de símbolo y nombre: «Fe» → Hierro primero; «Oro» → Oro primero. Si se mantiene la búsqueda por subcadena, mostrar el resultado exacto destacado arriba.

## 6. Desplazamiento horizontal en móvil no confirmado

**Problema:** a 500 px solo se ven los grupos 1 a 8 y aparece el aviso «Desliza la tabla para ver todos los grupos», pero varios intentos de arrastre con el ratón (sobre celdas y sobre el encabezado de grupos) no movieron la tabla. No se puede asegurar que falle con deslizamiento táctil real, pero con ratón no se desplazó.

**Cómo arreglarlo:** verificar el desplazamiento horizontal táctil en un teléfono real. Si hace falta, añadir un indicador visible de desplazamiento (por ejemplo, una flecha o sombra al borde) y asegurarse de que el contenedor tenga scroll horizontal habilitado. La alternativa «Fichas Móvil» sí funciona, así que no es bloqueante.

## 7. Datos que conviene verificar

- **Descubridor del Hierro:** se le atribuye a Georg Brandt en 1735. Brandt descubrió el **cobalto** en 1735; el hierro se conoce desde la Antigüedad. Corregir el descubridor del Hierro (y revisar los descubridores de los demás elementos por si hay más casos así).
- **Masa del Polonio:** aparece como 208.98, idéntica a la del Bismuto (208.98). Verificar la masa correcta del Polonio en la fuente IUPAC/NIST y corregirla si está mal.
- **Configuración electrónica con distinto orden entre pestañas:** en el detalle del Hierro, «Resumen» muestra `[Ar]4s² 3d⁶` y «A Fondo» muestra `[Ar]3d⁶ 4s²`. Unificar el orden en ambas pestañas.
- **Pie de página:** dice «© 2026Jose Angel Márquez Ramírez», sin espacio después de 2026. Corregir a «© 2026 Jose Angel Márquez Ramírez».
- **Texto de ejemplo del buscador en móvil:** se corta. Acortarlo o ajustar el tamaño para que se lea completo.

---

## Orden recomendado para arreglarlo

1. **Contraste en modo claro** (punto 1) — es lo urgente, porque hoy esa información existe pero no se ve.
2. **Modal en móvil** (punto 2) — contenido tapado en teléfono.
3. **Buscador con prioridad a coincidencia exacta** (punto 5) — mejora directa de uso.
4. **Encabezado responsive y nombres completos en celdas** (puntos 3 y 4) — pulido visual en escritorio y móvil.
5. **Datos: descubridor del Hierro y masa del Polonio** (punto 7) — corrección de contenido.
6. **Desplazamiento horizontal en móvil** (punto 6) — verificar en un teléfono real y añadir indicador si hace falta.

## Checklist

- [x] Contraste en modo claro: constantes, periodo/grupo, electrones por capa, categoría, botón Compartir, chips y botón de comparar.
- [x] Modal móvil: barra de acciones no tapa el Análisis Cuántico.
- [x] Nombres completos en celdas o con tooltip.
- [x] Menú superior: caben los 7 módulos a 1920 px o hay menú colapsable.
- [x] Buscador: coincidencia exacta primero (Fe → Hierro, Oro → Oro).
- [x] Datos: descubridor del Hierro y masa del Polonio corregidos.
- [x] Configuración electrónica con el mismo orden en Resumen y A Fondo.
- [x] Pie: «© 2026 Jose Angel Márquez Ramírez» con espacio.
- [ ] Desplazamiento horizontal verificado en un teléfono real. *(Implementado arrastre con ratón + flechas/sombras laterales; falta prueba en dispositivo físico)*
- [x] Texto de ejemplo del buscador se lee completo en móvil.

---

## Nota Técnica de Relevo para Claude Opus (Mapeo de Archivos y Causa Raíz)

Hola **Claude Opus**, ya se escaneó este documento contra el código fuente actual del repositorio (`React 19 + TypeScript + Tailwind CSS v4 + Vite`). Aquí tienes la causa raíz exacta en el código y los archivos que debes intervenir para resolver cada punto siguiendo el orden de prioridad:

### 1. Contraste roto en modo claro (Prioridad #1)
- **Archivos:** `src/index.css`, `src/components/ElementModal/ElementModal.tsx`, `src/components/ElementModal/BohrModel.tsx`, `src/components/PeriodicTable/ElementListView.tsx`.
- **Causa raíz:**
  1. En `src/index.css` (líneas 196–202), la regla `html.light ... .text-white` solo apunta a `h1, h2, h3, h4, p`, dejando fuera a `span.text-white` y `strong.text-white`.
  2. En `ElementModal.tsx`:
     - Los 8 valores de constantes fisicoquímicas (líneas 327–405) usan `<span className="font-mono text-base font-bold text-white">` sobre `.bg-slate-950/60` (que en modo claro es `#f1f5f9`), quedando blanco sobre gris muy claro.
     - Periodo y Grupo (líneas 145 y 149) usan `<strong className="text-white">`.
     - La etiqueta de categoría (líneas 130–136) tiene `color: '#e2e8f0'` hardcodeado en `style={{ ... }}` inline; cámbialo por la clase `cat.text` o una clase adaptable al tema claro.
     - El botón «Compartir» (línea 168) usa `bg-slate-800/80 text-slate-300`, pero en `src/index.css` solo existen overrides para `.bg-slate-800`, `/60`, `/50` y `/40` (falta `.bg-slate-800\/80` y `.hover\:bg-slate-700:hover`).
  3. En `BohrModel.tsx` (línea 134): el conteo de electrones por capa usa `<span className="font-bold text-white">{count} e⁻</span>` dentro de un contenedor `.bg-slate-900` (que en modo claro pasa a `#ffffff`).
  4. En `ElementListView.tsx` («Fichas Móvil»): el botón de comparar (línea 241) y el chip de estado físico (línea 257) usan `bg-slate-800/80 text-slate-400`, clase de fondo que no tiene regla en `html.light` dentro de `src/index.css`.

### 2. Modal en vista móvil tapa el contenido (Prioridad #2)
- **Archivo:** `src/components/ElementModal/ElementModal.tsx` (líneas 84–96, 234, 413–466).
- **Causa raíz:** El contenedor `.max-h-[92vh]` usa `flex flex-col`, pero el header, el selector de pestañas y el footer de acciones no tienen `shrink-0` controlado y el footer con 6 botones (`Añadir a Comparador`, `Simular Átomo`, `Simular Aufbau`, `Simular Enlace`, `Molécula 3D`, `Cerrar`) envuelve en varias filas en pantallas `< 640px`, comiéndose la altura útil del área central (`overflow-y-auto`).
- **Solución:** Hacer que el cuerpo scrollable tenga `flex-1 min-h-0 overflow-y-auto`, o incluir la barra de acciones dentro del flujo de scroll en pantallas móviles (`sm:sticky` o al final del contenido en móvil) o compactar los botones en un grid/menú secundario para no robar espacio al «Análisis Cuántico».

### 3. Buscador con prioridad a coincidencia exacta (Prioridad #3)
- **Archivos:** `src/utils/filters.ts`, `src/components/PeriodicTable/ElementListView.tsx`, `src/components/PeriodicTable/PeriodicGrid.tsx`, `src/components/PeriodicTable/FilterBar.tsx`.
- **Causa raíz:** `matchesElementFilter` en `src/utils/filters.ts` (líneas 40–49) evalúa `normalizeSearchText(el.name).includes(q)`. Al buscar `"oro"`, coinciden **Boro**, **Fósforo**, **Cloro** y **Oro**; al buscar `"fe"`, coinciden **Hierro (Fe)** y **Fermio (Fm)**.
- **Solución:**
  - Crear una función de puntuación de relevancia (`getSearchMatchScore(el, query)`):
    1. Coincidencia exacta de símbolo (`el.symbol.toLowerCase() === q`), número atómico (`el.atomicNumber.toString() === q`) o nombre completo (`normalizeSearchText(el.name) === q`).
    2. Prefijo de nombre o símbolo (`startsWith(q)`).
    3. Subcadena (`includes(q)`), o bien si hay coincidencia exacta de símbolo (como `Fe`) o de nombre completo (como `Oro`), priorizarla/destacarla visualmente en la cuadrícula (`PeriodicGrid.tsx`) y colocarla en primer lugar en `ElementListView.tsx`.
  - Acortar o hacer responsivo el `placeholder` del input en `FilterBar.tsx` (línea 77) para que no se corte en móvil.

### 4. Nombres truncados en celdas y navegación superior recortada (Prioridad #4)
- **Nombres en celdas (`src/components/PeriodicTable/ElementCard.tsx` y `src/App.tsx`):**
  - `main` en `src/App.tsx` (línea 352) tiene `max-w-7xl` (1280px), lo que limita cada una de las 18 columnas a ~62px incluso en monitores de 1920px.
  - En `ElementCard.tsx` (línea 177), el nombre usa `text-[9px] sm:text-[10px] truncate`. Ampliar el contenedor en pantallas grandes (`max-w-[1600px]` o `2xl:max-w-[1720px]`), ajustar `font-size`/tracking para nombres largos y asegurar un tooltip claro al hacer hover/focus.
- **Navegación superior (`src/components/Navbar/Navbar.tsx`):**
  - En `Navbar.tsx` (líneas 57 y 89), el logo + 7 pestañas con nombres largos + botones de acción exceden el ancho de `max-w-7xl`, ocultando «Moléculas 3D» y «Quizzes» por el `overflow-x-auto no-scrollbar`.
  - Reducir etiquetas/paddings en desktop intermedio (`lg`/`xl`), usar etiquetas cortas o mostrar menú hamburguesa/drawer en resoluciones donde no quepan los 7 módulos.

### 5. Datos científicos y detalles de texto (Prioridad #5)
- **Archivos:** `src/data/elementsData.ts`, `src/components/ElementModal/ElementModal.tsx`, `src/utils/electronConfig.ts`, `src/App.tsx`.
- **Estado en código vs producción:**
  - **Hierro (Z=26)** (`elementsData.ts` líneas 753–754): en el código local ya figura `discoveredBy: "Conocido desde la antigüedad"`, pero revisa todos los 118 elementos en `elementsData.ts` para confirmar que no haya otros desplazamientos de descubridor y asegurar que el próximo deploy actualice producción.
  - **Polonio (Z=84)** (`elementsData.ts` línea 2419): tiene `atomicMass: 208.98243`, que al formatearse con `.toFixed(2)` se muestra como `208.98` (idéntico al Bismuto `208.9804`). Actualizar a `209` (masa del isótopo más estable $^{209}\text{Po}$ según tabla estándar IUPAC) o formatear masas de elementos sin isótopos estables entre corchetes `[209]`.
  - **Configuración electrónica unificada:** en `elementsData.ts` (línea 748) `electronConfiguration` está en formato plano `"[Ar]4s2 3d6"`, mientras que `deepDive` (línea 756) usa `"[Ar] 3d⁶ 4s²"`. Puedes usar `getCondensedConfigurationString(element.atomicNumber, 'real', 'shell')` de `src/utils/electronConfig.ts` o normalizar `elementsData.ts` para que ambas pestañas («Visión Rápida» y «A Fondo») muestren exactamente el mismo orden y superíndices (`[Ar] 3d⁶ 4s²`).
  - **Pie de página (`src/App.tsx` líneas 535–539):** verificar que el espacio entre `© 2026` y `Jose Angel Márquez Ramírez` sea explícito y no colapse al desplegar.

### 6. Desplazamiento horizontal en móvil (Prioridad #6)
- **Archivo:** `src/components/PeriodicTable/PeriodicGrid.tsx` (líneas 214–235).
- **Solución:** Añadir soporte de *drag-to-scroll* con puntero/ratón en el contenedor `.overflow-x-auto`, sombras indicadoras de scroll lateral y asegurar `touch-action: pan-x pan-y` para desplazamiento fluido en pantallas táctiles.

### Comandos de verificación
- Ejecutar tests unitarios: `npm run test` (`vitest run`)
- Ejecutar linter: `npm run lint` (`oxlint`)
- Compilar producción: `npm run build` (`tsc -b && vite build`)

