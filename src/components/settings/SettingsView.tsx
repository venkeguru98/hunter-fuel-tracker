import React, { useRef, useState } from 'react';
import { AppSettings, FuelEntry, MotorcycleProfile } from '../../types/fuel';
import { exportBackupFile, exportCsvFile, validateAndPreviewBackup, ImportValidationResult } from '../../utils/exportImport';
import { BikeConfigModal } from './BikeConfigModal';
import { RestorePreviewModal } from './RestorePreviewModal';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Moon,
  Sun,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Smartphone,
  Share2,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  entries: FuelEntry[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onApplyImport: (entries: FuelEntry[], newSettings?: AppSettings) => void;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  entries,
  theme,
  onToggleTheme,
  onUpdateSettings,
  onApplyImport,
  onLoadSampleData,
  onClearAllData,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBikeModalOpen, setIsBikeModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInputConfirm, setClearInputConfirm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Handle Export JSON Backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const res = await exportBackupFile(entries, settings);
      onShowToast(res.message, res.success ? 'success' : 'error');
    } catch {
      onShowToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await exportCsvFile(entries);
      onShowToast(res.message, res.success ? 'success' : 'error');
    } catch {
      onShowToast('CSV export failed', 'error');
    }
  };

  // Handle File Input Selection for Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = validateAndPreviewBackup(text, entries);

      if (!result.isValid) {
        onShowToast(result.error || 'Invalid backup file', 'error');
      } else {
        setValidationResult(result);
        setIsRestoreModalOpen(true);
      }
      // Reset input so user can select the same file again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Danger zone clear data
  const handleConfirmClear = () => {
    if (clearInputConfirm.trim().toUpperCase() === 'RESET') {
      onClearAllData();
      setShowClearConfirm(false);
      setClearInputConfirm('');
    } else {
      onShowToast('Please type RESET to confirm', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-white dark:text-white text-slate-900 tracking-tight">
          Settings & Data Backup
        </h2>
        <p className="text-xs text-slate-400">
          Local offline storage, JSON backup/restore, motorcycle specs
        </p>
      </div>

      {/* 1. Backup & Restore (Zero Database Protection) */}
      <div className="rounded-3xl bg-gradient-to-br from-graphite-900 to-graphite-850 dark:from-graphite-900 dark:to-graphite-850 bg-white border border-graphite-750 dark:border-graphite-750 border-slate-200 p-4 shadow-card-dark dark:shadow-card-dark shadow-card-light space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-hunter-lime/10 flex items-center justify-center text-hunter-lime">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white text-slate-900">
              Data Backup & Transfer
            </h3>
            <p className="text-[10px] text-slate-400">
              Portable between Android, iPhone & desktop browsers
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed bg-graphite-950/60 dark:bg-graphite-950/60 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
          All your fuel records are stored privately inside this browser. Regularly export a JSON backup to your phone storage, Google Drive, iCloud, or share via WhatsApp to never lose your data.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Export JSON Button */}
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-black text-xs uppercase tracking-wider shadow-dial shadow-hunter-lime/20 active:scale-95 transition"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-graphite-800 dark:bg-graphite-800 bg-slate-100 text-slate-200 dark:text-slate-200 text-slate-800 font-bold text-xs hover:bg-graphite-750 border border-graphite-700/60 dark:border-graphite-700/60 border-slate-300 active:scale-95 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Restore Backup (JSON)</span>
          </button>
        </div>

        {/* CSV Export Option */}
        <div className="pt-1">
          <button
            onClick={handleExportCsv}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white font-medium text-xs border border-graphite-800 dark:border-graphite-800 border-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel / Google Sheets CSV ({entries.length} rows)</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 2. Motorcycle Profile Card */}
      <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-800 bg-slate-100 flex items-center justify-center text-slate-300">
              <ShieldCheck className="w-4 h-4 text-hunter-lime" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
                Motorcycle Configuration
              </h3>
              <p className="text-[10px] text-slate-400">
                {settings.bikeProfile.make} {settings.bikeProfile.model}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBikeModalOpen(true)}
            className="text-[11px] font-bold text-hunter-lime hover:underline px-2 py-1"
          >
            Customize
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-850 dark:border-graphite-850 border-slate-200">
          <div>
            <span className="text-slate-400 text-[10px] block">Edition</span>
            <span className="font-bold text-white dark:text-white text-slate-900">{settings.bikeProfile.edition}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Model Year</span>
            <span className="font-mono font-bold text-white dark:text-white text-slate-900">{settings.bikeProfile.modelYear}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Tank Capacity</span>
            <span className="font-mono font-bold text-white dark:text-white text-slate-900">
              {settings.bikeProfile.fuelCapacityLitres} Litres
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Registration</span>
            <span className="font-mono font-bold text-hunter-lime">
              {settings.bikeProfile.registrationNumber || 'None set'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Units & Theme */}
      <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4 space-y-3">
        <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
          Display & Preferences
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-slate-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs font-medium text-slate-200 dark:text-slate-200 text-slate-800">
              Theme Mode
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-graphite-800 dark:bg-graphite-800 bg-slate-100 text-xs font-bold text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white"
          >
            <span>{theme === 'dark' ? 'Graphite Dark' : 'Clean Light'}</span>
          </button>
        </div>

        {/* Standard Units display */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-graphite-800 dark:border-graphite-800 border-slate-200 text-center text-xs">
          <div className="p-2 rounded-xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50">
            <span className="text-[10px] text-slate-400 block">Currency</span>
            <span className="font-mono font-bold text-hunter-lime">INR (₹)</span>
          </div>
          <div className="p-2 rounded-xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50">
            <span className="text-[10px] text-slate-400 block">Distance</span>
            <span className="font-mono font-bold text-white dark:text-white text-slate-900">km</span>
          </div>
          <div className="p-2 rounded-xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50">
            <span className="text-[10px] text-slate-400 block">Fuel</span>
            <span className="font-mono font-bold text-white dark:text-white text-slate-900">Litres</span>
          </div>
        </div>
      </div>

      {/* 4. Sample Data & Reset */}
      <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 p-4 space-y-3">
        <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
          Demo & Maintenance
        </h3>

        {/* Load Realistic Sample Data */}
        <button
          onClick={onLoadSampleData}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 hover:bg-graphite-850 dark:hover:bg-graphite-850 border border-graphite-800 dark:border-graphite-800 border-slate-200 transition text-left"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-hunter-lime shrink-0" />
            <div>
              <span className="text-xs font-bold text-white dark:text-white text-slate-900 block">
                Load Realistic Demo Records
              </span>
              <span className="text-[10px] text-slate-400">
                Populates 7 realistic Hunter 350 refuel entries (Bangalore / Highway)
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-hunter-lime">Load</span>
        </button>

        {/* Danger Zone: Clear Data */}
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition text-left"
          >
            <div className="flex items-center space-x-2.5">
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="text-xs font-bold text-rose-400 block">
                  Clear All Application Data
                </span>
                <span className="text-[10px] text-slate-400">
                  Delete all local records from this phone
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-400">Clear</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">Irreversible Action</span>
            </div>
            <p className="text-[11px] text-slate-300">
              To wipe all {entries.length} fuel entries and reset settings, type <strong className="text-white font-mono">RESET</strong> below:
            </p>
            <input
              type="text"
              placeholder="Type RESET"
              value={clearInputConfirm}
              onChange={(e) => setClearInputConfirm(e.target.value)}
              className="w-full bg-graphite-950 border border-rose-500/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white uppercase focus:outline-none"
            />
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  setClearInputConfirm('');
                }}
                className="flex-1 py-2 rounded-xl bg-graphite-800 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. App & PWA Status info footer */}
      <div className="text-center pt-2 pb-6 text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-400">
          Hunter Fuel Tracker • v1.0.0
        </p>
        <p className="text-[10px]">
          Crafted for Royal Enfield Hunter 350 Graphite Grey (2026)
        </p>
        <p className="text-[10px] text-slate-500 flex items-center justify-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>Offline Ready PWA • Zero Cloud Dependency</span>
        </p>
      </div>

      {/* Modals */}
      <BikeConfigModal
        isOpen={isBikeModalOpen}
        onClose={() => setIsBikeModalOpen(false)}
        bikeProfile={settings.bikeProfile}
        onSaveProfile={(prof) => onUpdateSettings({ bikeProfile: prof })}
      />

      <RestorePreviewModal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setValidationResult(null);
        }}
        validationResult={validationResult}
        existingEntries={entries}
        onConfirmImport={(merged, newSettings) => {
          onApplyImport(merged, newSettings);
          onShowToast(`Restored ${merged.length} fuel records!`, 'success');
        }}
      />
    </div>
  );
};
