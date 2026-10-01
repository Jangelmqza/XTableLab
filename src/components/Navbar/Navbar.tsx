import {
  Table2,
  Scale,
  Atom,
  Zap,
  Flame,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';

export type AppTab = 'table' | 'compare' | 'atom' | 'config' | 'bonds' | 'quiz';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  comparisonCount: number;
  onOpenInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  comparisonCount,
  onOpenInfo,
}) => {
  const tabs = [
    { id: 'table', label: 'Tabla Periódica', icon: Table2 },
    {
      id: 'compare',
      label: 'Comparador',
      icon: Scale,
      badge: comparisonCount > 0 ? comparisonCount : undefined,
    },
    { id: 'atom', label: 'Simulador Átomo', icon: Atom },
    { id: 'config', label: 'Aufbau Cuántico', icon: Zap },
    { id: 'bonds', label: 'Enlaces Químicos', icon: Flame },
    { id: 'quiz', label: 'Quizzes Didácticos', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div
          onClick={() => onTabChange('table')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-5 h-5 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              XTableLab
              <span className="text-[10px] font-mono font-normal text-sky-400 bg-sky-950/80 border border-sky-800/50 px-1.5 py-0.2 rounded">
                v1.0 IUPAC
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Plataforma Universitaria Interactiva</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as AppTab)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Info / Help Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Información y guía didáctica"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Guía & Metas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
