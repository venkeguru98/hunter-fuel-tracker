import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ImportValidationResult } from '../../utils/exportImport';
import { FuelEntry, AppSettings } from '../../types/fuel';
import { mergeImportedEntries } from '../../utils/exportImport';
import { AlertTriangle, Check, FileCheck, Layers, RefreshCw } from 'lucide-react';

interface RestorePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: ImportValidationResult | null;
  existingEntries: FuelEntry[];
  onConfirmImport: (mergedEntries: FuelEntry[], newSettings?: AppSettings) => void;
}

export const RestorePreviewModal: React.FC<RestorePreviewModalProps> = ({
  isOpen,
  onClose,
  validationResult,
  existingEntries,
  onConfirmImport,
}) => {
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge');
  const [confirmReplace, setConfirmReplace] = useState(false);

  if (!validationResult || !validationResult.payload) return null;

  const { summary, payload } = validationResult;

  const handleApply = () => {
    if (strategy === 'replace' && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }

    const merged = mergeImportedEntries(existingEntries, payload.entries, strategy);
    onConfirmImport(merged, payload.settings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restore Fuel Records Backup"
      subtitle="Preview and verify records before restoring"
    >
      <div className="space-y-4">
        {/* Verification Pill */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3">
          <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-emerald-300 block">Valid Hunter 350 Backup File</span>
            <span className="text-[11px] text-slate-300">
              Format: JSON v{payload.version} • {summary?.totalRecords} records verified
            </span>
          </div>
        </div>

        {/* Backup Metadata Preview */}
        <div className="p-3.5 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-800 dark:border-graphite-800 border-slate-200 space-y-2 text-xs">
          {summary?.bikeModel && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Motorcycle Profile</span>
              <span className="font-bold text-white dark:text-white text-slate-900">{summary.bikeModel}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Records in Backup</span>
            <span className="font-mono font-bold text-white dark:text-white text-slate-900">
              {summary?.totalRecords}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">New Records</span>
            <span className="font-mono font-bold text-hunter-lime">
              +{summary?.newRecordsCount}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Duplicate Existing</span>
            <span className="font-mono font-bold text-amber-400">
              {summary?.duplicateRecordsCount}
            </span>
          </div>

          {summary?.earliestDate && summary?.latestDate && (
            <div className="flex items-center justify-between pt-1 border-t border-graphite-850 dark:border-graphite-850 border-slate-200">
              <span className="text-slate-400">Date Span</span>
              <span className="font-mono text-[11px] text-slate-300 dark:text-slate-300 text-slate-700">
                {summary.earliestDate} to {summary.latestDate}
              </span>
            </div>
          )}
        </div>

        {/* Restore Strategy Selection */}
        <div className="space-y-2">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Import Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setStrategy('merge');
                setConfirmReplace(false);
              }}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                strategy === 'merge'
                  ? 'bg-hunter-lime/10 border-hunter-lime text-white'
                  : 'bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border-graphite-800 dark:border-graphite-800 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <Layers className="w-4 h-4 text-hunter-lime" />
                <span className="text-xs font-bold text-white dark:text-white text-slate-900">Merge</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                Combine with current records & skip exact duplicates (Recommended)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStrategy('replace')}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                strategy === 'replace'
                  ? 'bg-rose-500/10 border-rose-500 text-white'
                  : 'bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border-graphite-800 dark:border-graphite-800 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1">
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-white dark:text-white text-slate-900">Replace All</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">
                Overwrite all current records with this backup file
              </span>
            </button>
          </div>
        </div>

        {/* Replace All Confirmation Warning */}
        {strategy === 'replace' && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: Existing entries will be wiped</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Your current {existingEntries.length} refuelling records will be completely replaced by the {summary?.totalRecords} records from this backup file.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-graphite-800 text-slate-300 font-bold text-xs hover:bg-graphite-750 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition ${
              strategy === 'replace'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                : 'bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 shadow-dial shadow-hunter-lime/20'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{strategy === 'replace' ? 'Confirm & Replace' : 'Confirm & Merge'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
