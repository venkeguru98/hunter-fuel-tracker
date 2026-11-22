import React, { useState, useEffect } from 'react';
import { useFuelTracker } from './hooks/useFuelTracker';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Toast } from './components/common/Toast';
import { BikeProfileCard } from './components/dashboard/BikeProfileCard';
import { InstrumentDial } from './components/dashboard/InstrumentDial';
import { FuelSummaryCards } from './components/dashboard/FuelSummaryCards';
import { MileageTrendMini } from './components/dashboard/MileageTrendMini';
import { QuickRefuelsList } from './components/dashboard/QuickRefuelsList';
import { FuelHistoryList } from './components/history/FuelHistoryList';
import { FuelDetailModal } from './components/history/FuelDetailModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { AddFuelModal } from './components/entry/AddFuelModal';
import { BikeConfigModal } from './components/settings/BikeConfigModal';
import { Download, Sparkles, X } from 'lucide-react';

export const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
    entries,
    enrichedEntries,
    stats,
    settings,
    activeTab,
    setActiveTab,
    isAddModalOpen,
    setIsAddModalOpen,
    editingEntry,
    setEditingEntry,
    detailEntry,
    setDetailEntry,
    toast,
    hideToast,
    showToast,
    saveFuelEntry,
    deleteFuelEntry,
    loadSampleData,
    clearAllData,
    applyImport,
    updateSettings,
  } = useFuelTracker();

  const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Catch PWA beforeinstallprompt event for native install banner
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      showToast('Hunter Fuel Tracker installed to your home screen!');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-graphite-950 dark:bg-graphite-950 bg-slate-100 text-slate-100 dark:text-slate-100 text-slate-900 transition-colors flex flex-col font-sans selection:bg-hunter-lime selection:text-graphite-950">
      {/* Top Header */}
      <Header
        bikeProfile={settings.bikeProfile}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenBikeSettings={() => setIsBikeModalOpen(true)}
      />

      {/* Main Content Area (Max width phone layout for native feel) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-28">
        {/* PWA Home Screen Install Banner */}
        {showInstallBanner && (
          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-graphite-900 to-graphite-850 border border-hunter-lime/40 shadow-dial flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-hunter-lime text-graphite-950 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">Install Hunter 350 App</p>
                <p className="text-[10px] text-slate-400">Add to home screen for instant offline use</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1 rounded-xl bg-hunter-lime text-graphite-950 font-bold text-[11px]"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Motorcycle Identity Card */}
            <BikeProfileCard
              bikeProfile={settings.bikeProfile}
              stats={stats}
              onEditProfile={() => setIsBikeModalOpen(true)}
            />

            {/* Instrument Cluster Dial (Latest Mileage) */}
            <InstrumentDial
              stats={stats}
              onAddFuelClick={() => {
                setEditingEntry(null);
                setIsAddModalOpen(true);
              }}
            />

            {/* Fuel Summary Grid */}
            <FuelSummaryCards stats={stats} />

            {/* Mileage Trend Mini Sparkline */}
            <MileageTrendMini
              entries={enrichedEntries}
              onViewAnalytics={() => setActiveTab('analytics')}
            />

            {/* Recent Refuels */}
            <QuickRefuelsList
              entries={enrichedEntries}
              onViewAll={() => setActiveTab('history')}
              onSelectEntry={(entry) => setDetailEntry(entry)}
            />
          </div>
        )}

        {/* Tab 2: Fuel History */}
        {activeTab === 'history' && (
          <FuelHistoryList
            entries={enrichedEntries}
            onSelectEntry={(entry) => setDetailEntry(entry)}
            onOpenAddModal={() => {
              setEditingEntry(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Mileage Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            entries={enrichedEntries}
            stats={stats}
          />
        )}

        {/* Tab 4: Settings & Backup */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            entries={enrichedEntries}
            theme={theme}
            onToggleTheme={toggleTheme}
            onUpdateSettings={updateSettings}
            onApplyImport={applyImport}
            onLoadSampleData={loadSampleData}
            onClearAllData={clearAllData}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAddModal={() => {
          setEditingEntry(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Modals & Dialogs */}
      {/* 1. Add / Edit Refuel Modal */}
      <AddFuelModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={saveFuelEntry}
        editingEntry={editingEntry}
        existingEntries={entries}
        currentOdometer={stats.currentOdometer}
        bikeProfile={settings.bikeProfile}
      />

      {/* 2. Detail View Modal */}
      <FuelDetailModal
        entry={detailEntry}
        isOpen={detailEntry !== null}
        onClose={() => setDetailEntry(null)}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsAddModalOpen(true);
        }}
        onDelete={(id) => deleteFuelEntry(id)}
      />

      {/* 3. Motorcycle Profile Quick Edit Modal */}
      <BikeConfigModal
        isOpen={isBikeModalOpen}
        onClose={() => setIsBikeModalOpen(false)}
        bikeProfile={settings.bikeProfile}
        onSaveProfile={(prof) => updateSettings({ bikeProfile: prof })}
      />

      {/* 4. Global Toast System */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};

export default App;
