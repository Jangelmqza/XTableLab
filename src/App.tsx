import { useState, useMemo, useEffect } from 'react';
import type { ElementData, ElementCategory, ElementBlock, TrendProperty } from './types/element';
import type { TableDisplayMode } from './components/PeriodicTable/ElementCard';
import { ELEMENTS_DATA } from './data/elementsData';
import { Navbar, type AppTab } from './components/Navbar/Navbar';
import { FilterBar } from './components/PeriodicTable/FilterBar';
import { PeriodicGrid } from './components/PeriodicTable/PeriodicGrid';
import { ElementListView } from './components/PeriodicTable/ElementListView';
import { HeatmapLegend } from './components/PeriodicTable/HeatmapLegend';
import { ElementModal } from './components/ElementModal/ElementModal';
import { ElementComparator } from './components/Comparator/ElementComparator';
import { AtomSimulator } from './components/Simulators/AtomSimulator';
import { ElectronConfigSimulator } from './components/Simulators/ElectronConfigSimulator';
import { ChemicalBondSimulator } from './components/Simulators/ChemicalBondSimulator';
import { QuizModule } from './components/Quiz/QuizModule';
import { InfoModal } from './components/InfoModal/InfoModal';
import { APP_VERSION, APP_BUILD_DATE } from './version';

// Type for PWA BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}


export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('table');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [comparisonList, setComparisonList] = useState<ElementData[]>([]);
  const [simulatorTargetElement, setSimulatorTargetElement] = useState<ElementData | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [layoutView, setLayoutView] = useState<'grid' | 'cards'>('grid');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('xtablelab_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to document element and persist
  useEffect(() => {
    try {
      localStorage.setItem('xtablelab_theme', theme);
    } catch {
      //
    }
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setIsInfoModalOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('table-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === '1') {
        setActiveTab('table');
      } else if (e.key === '2') {
        setActiveTab('compare');
      } else if (e.key === '3') {
        setActiveTab('atom');
      } else if (e.key === '4') {
        setActiveTab('config');
      } else if (e.key === '5') {
        setActiveTab('bonds');
      } else if (e.key === '6') {
        setActiveTab('quiz');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // URL Deep Linking initialization
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AppTab | null;
      if (tabParam && ['table', 'compare', 'atom', 'config', 'bonds', 'quiz'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      const elParam = params.get('el');
      if (elParam) {
        const clean = elParam.toLowerCase().trim();
        const matched = ELEMENTS_DATA.find(
          (e) =>
            e.symbol.toLowerCase() === clean ||
            e.atomicNumber.toString() === clean ||
            e.name.toLowerCase() === clean
        );
        if (matched) setSelectedElement(matched);
      }
    } catch {
      // Ignorar errores de acceso a window en entornos sin DOM
    }
  }, []);

  // Sync URL when activeTab or selectedElement changes
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedElement) {
        url.searchParams.set('el', selectedElement.symbol);
      } else {
        url.searchParams.delete('el');
      }
      if (activeTab !== 'table') {
        url.searchParams.set('tab', activeTab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignorar en entornos sin DOM
    }
  }, [selectedElement, activeTab]);

  // Table filters and display modes
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<TableDisplayMode>('category');
  const [activeTrend, setActiveTrend] = useState<TrendProperty>('electronegativity');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');
  const [selectedBlock, setSelectedBlock] = useState<ElementBlock | 'all'>('all');
  const [temperatureK, setTemperatureK] = useState(298.15); // Room temperature 25 °C
  const [onlyRadioactive, setOnlyRadioactive] = useState(false);

  // Filter count computation
  const filteredCount = useMemo(() => {
    return ELEMENTS_DATA.filter((el) => {
      if (selectedCategory !== 'all' && el.category !== selectedCategory) return false;
      if (selectedBlock !== 'all' && el.block !== selectedBlock) return false;
      if (onlyRadioactive && !el.radioactive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = el.name.toLowerCase().includes(q);
        const matchNameEn = el.nameEn.toLowerCase().includes(q);
        const matchSymbol = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
        const matchNumber = el.atomicNumber.toString() === q;
        if (!matchName && !matchNameEn && !matchSymbol && !matchNumber) return false;
      }
      return true;
    }).length;
  }, [selectedCategory, selectedBlock, onlyRadioactive, searchQuery]);

  // Min and Max for current trend in heatmap mode
  const { minTrendVal, maxTrendVal } = useMemo(() => {
    const vals = ELEMENTS_DATA.map((e) => e[activeTrend]).filter(
      (v): v is number => v !== null && v !== undefined && !isNaN(v)
    );
    if (vals.length === 0) return { minTrendVal: 0, maxTrendVal: 1 };
    return {
      minTrendVal: Math.min(...vals),
      maxTrendVal: Math.max(...vals),
    };
  }, [activeTrend]);

  // Navigate next/prev element in modal
  const handleNavigateElement = (step: number) => {
    if (!selectedElement) return;
    let nextZ = selectedElement.atomicNumber + step;
    if (nextZ < 1) nextZ = 118;
    if (nextZ > 118) nextZ = 1;
    const found = ELEMENTS_DATA.find((e) => e.atomicNumber === nextZ);
    if (found) setSelectedElement(found);
  };

  // Toggle comparison item (max 3)
  const handleToggleCompare = (el: ElementData) => {
    setComparisonList((prev) => {
      const exists = prev.some((c) => c.atomicNumber === el.atomicNumber);
      if (exists) {
        return prev.filter((c) => c.atomicNumber !== el.atomicNumber);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], el];
      }
      return [...prev, el];
    });
  };

  // Clear filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBlock('all');
    setOnlyRadioactive(false);
  };

  // Handle jump from modal to simulator
  const handleGoToSimulator = (
    type: 'atom' | 'electron' | 'bond',
    el: ElementData
  ) => {
    setSimulatorTargetElement(el);
    setSelectedElement(null);
    if (type === 'atom') setActiveTab('atom');
    else if (type === 'electron') setActiveTab('config');
    else if (type === 'bond') {
      setActiveTab('bonds');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        comparisonCount={comparisonList.length}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        canInstall={!!deferredPrompt}
        onInstall={handleInstallApp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Tab 1: Periodic Table */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
              layoutView={layoutView}
              onLayoutViewChange={setLayoutView}
              activeTrend={activeTrend}
              onActiveTrendChange={setActiveTrend}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBlock={selectedBlock}
              onBlockChange={setSelectedBlock}
              temperatureK={temperatureK}
              onTemperatureChange={setTemperatureK}
              onlyRadioactive={onlyRadioactive}
              onOnlyRadioactiveChange={setOnlyRadioactive}
              onResetFilters={handleResetFilters}
              totalFilteredCount={filteredCount}
            />

            {/* Heatmap Legend if Heatmap mode active */}
            {displayMode === 'heatmap' && (
              <HeatmapLegend
                trend={activeTrend}
                minVal={minTrendVal}
                maxVal={maxTrendVal}
              />
            )}

            {/* Periodic Grid or Responsive Cards View */}
            {layoutView === 'grid' ? (
              <PeriodicGrid
                elements={ELEMENTS_DATA}
                displayMode={displayMode}
                activeTrend={activeTrend}
                temperatureK={temperatureK}
                selectedCategory={selectedCategory}
                selectedBlock={selectedBlock}
                searchQuery={searchQuery}
                onlyRadioactive={onlyRadioactive}
                selectedElement={selectedElement}
                comparisonList={comparisonList}
                onSelectElement={setSelectedElement}
                onToggleCompare={handleToggleCompare}
                onSwitchToCards={() => setLayoutView('cards')}
              />
            ) : (
              <ElementListView
                elements={ELEMENTS_DATA}
                displayMode={displayMode}
                activeTrend={activeTrend}
                temperatureK={temperatureK}
                selectedCategory={selectedCategory}
                selectedBlock={selectedBlock}
                searchQuery={searchQuery}
                onlyRadioactive={onlyRadioactive}
                selectedElement={selectedElement}
                comparisonList={comparisonList}
                onSelectElement={setSelectedElement}
                onToggleCompare={handleToggleCompare}
              />
            )}
          </div>
        )}

        {/* Tab 2: Element Comparator */}
        {activeTab === 'compare' && (
          <ElementComparator
            elements={ELEMENTS_DATA}
            comparisonList={comparisonList}
            onRemoveFromCompare={(z) =>
              setComparisonList((prev) => prev.filter((c) => c.atomicNumber !== z))
            }
            onAddElement={(el) => {
              if (comparisonList.length < 3) {
                setComparisonList((prev) => [...prev, el]);
              }
            }}
            onClearAll={() => setComparisonList([])}
          />
        )}

        {/* Tab 3: Atom Simulator */}
        {activeTab === 'atom' && (
          <AtomSimulator
            elements={ELEMENTS_DATA}
            initialElement={simulatorTargetElement}
          />
        )}

        {/* Tab 4: Quantum Electron Configuration (Aufbau) */}
        {activeTab === 'config' && (
          <ElectronConfigSimulator
            elements={ELEMENTS_DATA}
            initialElement={simulatorTargetElement}
          />
        )}

        {/* Tab 5: Chemical Bond Simulator */}
        {activeTab === 'bonds' && (
          <ChemicalBondSimulator
            elements={ELEMENTS_DATA}
            initialElement={simulatorTargetElement}
          />
        )}

        {/* Tab 6: Interactive Quizzes */}
        {activeTab === 'quiz' && <QuizModule elements={ELEMENTS_DATA} />}
      </main>

      {/* Element Detail Modal */}
      <ElementModal
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
        onNavigate={handleNavigateElement}
        onAddToCompare={handleToggleCompare}
        isInComparison={
          selectedElement
            ? comparisonList.some((c) => c.atomicNumber === selectedElement.atomicNumber)
            : false
        }
        onGoToSimulator={handleGoToSimulator}
      />

      {/* Info & Goals Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          {/* Brand + Features row */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
            <span className="text-slate-400 font-semibold tracking-widest uppercase text-[11px]">
              XTableLab
            </span>
            <div className="flex items-center gap-4 text-slate-500">
              <span>118 Elementos IUPAC</span>
              <span>•</span>
              <span>Simuladores Cuánticos</span>
              <span>•</span>
              <span>Bohr &amp; Aufbau</span>
              <span>•</span>
              <span>Evaluación Interactiva</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-slate-800/60" />

          {/* Copyright + version row */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 text-slate-600">
            <span>
              © 2026{' '}
              <span className="text-slate-400 font-medium">Jose Angel Márquez Ramírez</span>
              {' '}— Todos los derechos reservados.
            </span>

            {/* Version badge */}
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-sky-500 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded text-[11px] font-semibold">
                v{APP_VERSION}
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-600">{APP_BUILD_DATE}</span>
              <span className="text-slate-700">·</span>
              <a
                href="https://github.com/Jangelmqza/XTableLab/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-sky-400 transition-colors underline underline-offset-2"
              >
                Changelog
              </a>
            </span>

            <span className="text-slate-700 italic">
              Datos: IUPAC &amp; NIST
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
