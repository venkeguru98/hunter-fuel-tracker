import { useState, useEffect, useMemo, useCallback } from 'react';
import { FuelEntry, AppSettings, FuelStats } from '../types/fuel';
import {
  loadStoredEntries,
  saveStoredEntries,
  loadStoredSettings,
  saveStoredSettings,
  clearAllAppData,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { calculateFuelIntervals, calculateFuelStats } from '../utils/calculations';
import { SAMPLE_HUNTER_ENTRIES } from '../utils/sampleData';

export type NavigationTab = 'dashboard' | 'history' | 'analytics' | 'settings';

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export function useFuelTracker() {
  const [entries, setEntries] = useState<FuelEntry[]>(() => {
    return loadStoredEntries();
  });

  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<FuelEntry | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync entries to local storage
  useEffect(() => {
    saveStoredEntries(entries);
  }, [entries]);

  // Sync settings to local storage
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Show Toast utility
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'info' = 'success',
      actionLabel?: string,
      onAction?: () => void
    ) => {
      setToast({
        id: String(Date.now()),
        message,
        type,
        actionLabel,
        onAction,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Compute enriched entries (sorted, mileage calculated per interval)
  const enrichedEntries = useMemo(() => {
    return calculateFuelIntervals(entries, settings.bikeProfile);
  }, [entries, settings.bikeProfile]);

  // Compute aggregate stats
  const stats: FuelStats = useMemo(() => {
    return calculateFuelStats(enrichedEntries, settings.bikeProfile);
  }, [enrichedEntries, settings.bikeProfile]);

  // Add or Update Entry
  const saveFuelEntry = useCallback(
    (entryData: Omit<FuelEntry, 'id' | 'createdAt'> & { id?: string }) => {
      setEntries((prev) => {
        let updated: FuelEntry[];
        if (entryData.id) {
          // Editing existing
          updated = prev.map((e) =>
            e.id === entryData.id
              ? {
                  ...e,
                  ...entryData,
                  updatedAt: Date.now(),
                }
              : e
          );
          showToast('Refuelling entry updated successfully');
        } else {
          // Adding new entry
          const newEntry: FuelEntry = {
            ...entryData,
            id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            createdAt: Date.now(),
          };
          updated = [...prev, newEntry];
          showToast('Fuel entry added successfully');
        }

        // Keep sorted by odometer ascending
        return updated.sort((a, b) => a.odometer - b.odometer);
      });

      setIsAddModalOpen(false);
      setEditingEntry(null);
    },
    [showToast]
  );

  // Delete Entry with Undo capability
  const deleteFuelEntry = useCallback(
    (id: string) => {
      const entryToDelete = entries.find((e) => e.id === id);
      if (!entryToDelete) return;

      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (detailEntry?.id === id) {
        setDetailEntry(null);
      }

      showToast(
        `Entry at ${entryToDelete.odometer} km deleted`,
        'info',
        'Undo',
        () => {
          setEntries((prev) => [...prev, entryToDelete].sort((a, b) => a.odometer - b.odometer));
          showToast('Entry restored');
        }
      );
    },
    [entries, detailEntry, showToast]
  );

  // Load sample demo data
  const loadSampleData = useCallback(() => {
    setEntries(SAMPLE_HUNTER_ENTRIES);
    showToast('Loaded 7 realistic Hunter 350 refuelling records');
  }, [showToast]);

  // Clear all application data
  const clearAllData = useCallback(() => {
    clearAllAppData();
    setEntries([]);
    setSettings(DEFAULT_SETTINGS);
    setDetailEntry(null);
    setEditingEntry(null);
    showToast('All application data cleared', 'info');
  }, [showToast]);

  // Import backup entries
  const applyImport = useCallback(
    (newEntries: FuelEntry[], newSettings?: AppSettings) => {
      setEntries(newEntries);
      if (newSettings) {
        setSettings(newSettings);
      }
      showToast(`Successfully imported ${newEntries.length} refuelling records`);
    },
    [showToast]
  );

  // Update app settings & motorcycle profile
  const updateSettings = useCallback(
    (partialSettings: Partial<AppSettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...partialSettings,
        bikeProfile: {
          ...prev.bikeProfile,
          ...(partialSettings.bikeProfile || {}),
        },
      }));
      showToast('Motorcycle settings updated');
    },
    [showToast]
  );

  return {
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
  };
}
