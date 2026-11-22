import React from 'react';
import { Sun, Moon, Gauge } from 'lucide-react';
import { MotorcycleProfile } from '../../types/fuel';

interface HeaderProps {
  bikeProfile: MotorcycleProfile;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenBikeSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  bikeProfile,
  theme,
  onToggleTheme,
  onOpenBikeSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-graphite-950/85 dark:bg-graphite-950/85 bg-white/90 backdrop-blur-md border-b border-graphite-800/60 dark:border-graphite-800/60 border-slate-200 transition-colors">
      <div className="max-w-md mx-auto px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between">
        {/* Left: Royal Enfield Brand & Hunter Badge */}
        <button
          onClick={onOpenBikeSettings}
          className="flex items-center space-x-2.5 text-left focus:outline-none group active:opacity-80 transition"
          title="Motorcycle Info"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-graphite-800 to-graphite-900 dark:from-graphite-800 dark:to-graphite-900 bg-slate-100 flex items-center justify-center border border-graphite-700/60 dark:border-graphite-700/60 border-slate-300 shadow-sm relative overflow-hidden group-hover:border-hunter-lime/50 transition">
            <Gauge className="w-5 h-5 text-hunter-lime" />
            <div className="absolute inset-0 bg-gradient-to-tr from-hunter-lime/10 to-transparent pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-hunter-lime">
                ROYAL ENFIELD
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Ready / Offline capable" />
            </div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white dark:text-white text-slate-900">
                {bikeProfile.model}
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-graphite-800 dark:bg-graphite-800 bg-slate-200 text-slate-300 dark:text-slate-300 text-slate-700 border border-graphite-700/40 dark:border-graphite-700/40 border-slate-300">
                {bikeProfile.edition}
              </span>
            </div>
          </div>
        </button>

        {/* Right: Year Badge & Dark/Light Toggle */}
        <div className="flex items-center space-x-2">
          <div className="px-2 py-1 rounded-md font-mono text-[11px] font-semibold bg-graphite-900/80 dark:bg-graphite-900/80 bg-slate-100 text-slate-400 dark:text-slate-400 text-slate-600 border border-graphite-800 dark:border-graphite-800 border-slate-200">
            {bikeProfile.modelYear}
          </div>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-graphite-850 dark:bg-graphite-850 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-700 border border-graphite-750 dark:border-graphite-700/60 border-slate-200 active:scale-95 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
