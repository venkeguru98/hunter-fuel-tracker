import React from 'react';
import { Gauge, History, TrendingUp, Settings, Plus } from 'lucide-react';
import { NavigationTab } from '../../hooks/useFuelTracker';

interface BottomNavProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto relative px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Floating Add Fuel Button */}
        <div className="flex justify-center -mb-5 pointer-events-auto">
          <button
            onClick={onOpenAddModal}
            aria-label="Add Fuel Refill"
            className="group flex items-center justify-center space-x-1.5 px-4 py-3 bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-bold rounded-2xl shadow-dial shadow-hunter-lime/30 active:scale-95 transition-all duration-150 border-2 border-hunter-lime/80 hover:shadow-lg"
          >
            <div className="w-5 h-5 rounded-full bg-graphite-950 text-hunter-lime flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider font-extrabold">
              Add Fuel
            </span>
          </button>
        </div>

        {/* Navigation Bar Glass Shell */}
        <nav className="pointer-events-auto bg-graphite-900/90 dark:bg-graphite-900/95 bg-white/95 backdrop-blur-xl border border-graphite-800/80 dark:border-graphite-800/80 border-slate-200 rounded-3xl shadow-card-dark dark:shadow-card-dark shadow-card-light pt-3 pb-2 px-3 flex items-center justify-around">
          {/* 1. Home */}
          <button
            onClick={() => onChangeTab('dashboard')}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'text-hunter-lime font-bold'
                : 'text-slate-400 dark:text-slate-400 text-slate-500 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-hunter-lime/10' : ''}`}>
              <Gauge className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
          </button>

          {/* 2. History */}
          <button
            onClick={() => onChangeTab('history')}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded-xl transition ${
              activeTab === 'history'
                ? 'text-hunter-lime font-bold'
                : 'text-slate-400 dark:text-slate-400 text-slate-500 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'history' ? 'bg-hunter-lime/10' : ''}`}>
              <History className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">History</span>
          </button>

          {/* Spacer for center Add Fuel button */}
          <div className="w-12 shrink-0" aria-hidden="true" />

          {/* 3. Analytics */}
          <button
            onClick={() => onChangeTab('analytics')}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded-xl transition ${
              activeTab === 'analytics'
                ? 'text-hunter-lime font-bold'
                : 'text-slate-400 dark:text-slate-400 text-slate-500 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'analytics' ? 'bg-hunter-lime/10' : ''}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Analytics</span>
          </button>

          {/* 4. Settings */}
          <button
            onClick={() => onChangeTab('settings')}
            className={`flex flex-col items-center flex-1 py-1 px-1 rounded-xl transition ${
              activeTab === 'settings'
                ? 'text-hunter-lime font-bold'
                : 'text-slate-400 dark:text-slate-400 text-slate-500 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'settings' ? 'bg-hunter-lime/10' : ''}`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
