import { useEffect, useState } from 'react';
import {
  Table2,
  Scale,
  Atom,
  Zap,
  Flame,
  Box,
  GraduationCap,
  HelpCircle,
  Download,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { APP_VERSION } from '../../version';


export type AppTab = 'table' | 'compare' | 'atom' | 'config' | 'bonds' | 'vsepr' | 'quiz';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  comparisonCount: number;
  onOpenInfo: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  comparisonCount,
  onOpenInfo,
  canInstall,
  onInstall,
  theme,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Cerrar el menú móvil con Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const tabs: {
    id: AppTab;
    label: string;
    shortLabel: string;
    icon: typeof Table2;
    badge?: number;
  }[] = [
    { id: 'table', label: 'Tabla Periódica', shortLabel: 'Tabla', icon: Table2 },
    {
      id: 'compare',
      label: 'Comparador',
      shortLabel: 'Comparador',
      icon: Scale,
      badge: comparisonCount > 0 ? comparisonCount : undefined,
    },
    { id: 'atom', label: 'Simulador de Átomos', shortLabel: 'Átomos', icon: Atom },
    { id: 'config', label: 'Configuración Electrónica', shortLabel: 'Config. e⁻', icon: Zap },
    { id: 'bonds', label: 'Enlaces Químicos', shortLabel: 'Enlaces', icon: Flame },
    { id: 'vsepr', label: 'Moléculas 3D', shortLabel: 'Moléculas 3D', icon: Box },
    { id: 'quiz', label: 'Quizzes', shortLabel: 'Quizzes', icon: GraduationCap },
  ];

  const activeTabInfo = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabInfo.icon;

  const handleSelectTab = (id: AppTab) => {
    onTabChange(id);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleSelectTab('table')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelectTab('table');
            }
          }}
          aria-label="Ir a la Tabla Periódica principal"
          className="flex items-center gap-2.5 cursor-pointer group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              XTableLab
              <span className="text-[10px] font-mono font-normal text-sky-400 bg-sky-950/80 border border-sky-800/50 px-1.5 py-0.5 rounded">
                v{APP_VERSION}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Plataforma Universitaria Interactiva</p>
          </div>
        </div>

        {/* Navigation Tabs (escritorio ≥ xl: caben los 7 módulos) */}
        <nav
          aria-label="Módulos principales de XTableLab"
          className="hidden xl:flex items-center gap-0.5 min-[1680px]:gap-1 min-w-0"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
                title={tab.label}
                className={`relative flex items-center gap-1.5 px-2.5 min-[1680px]:px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="min-[1680px]:hidden">{tab.shortLabel}</span>
                <span className="hidden min-[1680px]:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Menú colapsable (móvil / tablet / escritorio estrecho) */}
        <div className="xl:hidden relative flex-1 flex justify-end min-w-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-module-menu"
            aria-label={isMenuOpen ? 'Cerrar menú de módulos' : 'Abrir menú de módulos'}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors min-w-0"
          >
            <ActiveIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{activeTabInfo.label}</span>
            {comparisonCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                {comparisonCount}
              </span>
            )}
            {isMenuOpen ? (
              <X className="w-4 h-4 shrink-0" />
            ) : (
              <Menu className="w-4 h-4 shrink-0" />
            )}
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                aria-hidden="true"
                onClick={() => setIsMenuOpen(false)}
              />
              <nav
                id="mobile-module-menu"
                aria-label="Módulos principales de XTableLab"
                className="absolute right-0 top-full mt-2 z-50 w-64 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                      <span className="flex-1">{tab.label}</span>
                      {tab.badge !== undefined && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-2 shrink-0">
          {canInstall && (
            <button
              onClick={onInstall}
              className="px-2.5 py-1.5 rounded-xl text-sky-300 hover:text-white bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md animate-pulse"
              title="Instalar XTableLab como aplicación en tu dispositivo"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center justify-center text-xs"
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'} (Atajo: tecla T)`}
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Información y guía didáctica (Atajo: ? o F1)"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Guía & Metas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
