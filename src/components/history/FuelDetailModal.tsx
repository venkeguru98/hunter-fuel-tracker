import React, { useState } from 'react';
import { FuelEntry } from '../../types/fuel';
import { Modal } from '../common/Modal';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatLitres,
  formatMileage,
  formatOdometer,
} from '../../utils/formatters';
import {
  Fuel,
  Calendar,
  Gauge,
  IndianRupee,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface FuelDetailModalProps {
  entry: FuelEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: FuelEntry) => void;
  onDelete: (id: string) => void;
}

export const FuelDetailModal: React.FC<FuelDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!entry) return null;

  const handleDelete = () => {
    onDelete(entry.id);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      title="Refuelling Details"
      subtitle={`${formatDate(entry.date)} • ${entry.odometer} km`}
    >
      <div className="space-y-4">
        {/* Top Highlight Card: Mileage or Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-graphite-850 to-graphite-950 dark:from-graphite-850 dark:to-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Calculated Mileage
            </span>
            {entry.calculatedMileage !== undefined ? (
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono text-3xl font-black text-hunter-lime">
                  {entry.calculatedMileage.toFixed(1)}
                </span>
                <span className="text-xs font-mono font-bold text-hunter-lime">km/l</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-amber-400">
                {entry.fuelType === 'partial' ? 'Partial Refill' : 'Baseline Anchor'}
              </span>
            )}
            {entry.mileageReason && (
              <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">
                {entry.mileageReason}
              </p>
            )}
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
              entry.fuelType === 'full'
                ? 'bg-hunter-lime/10 text-hunter-lime border-hunter-lime/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {entry.fuelType === 'full' ? 'Full Tank' : 'Partial'}
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Odometer */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Odometer</span>
            <span className="font-mono text-base font-bold text-white dark:text-white text-slate-900 mt-0.5 block">
              {formatDistance(entry.odometer)}
            </span>
          </div>

          {/* Interval Distance */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Interval Distance</span>
            <span className="font-mono text-base font-bold text-white dark:text-white text-slate-900 mt-0.5 block">
              {entry.distanceTravelled ? `+${entry.distanceTravelled} km` : 'Pending'}
            </span>
          </div>

          {/* Amount Paid */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
            <span className="font-mono text-base font-bold text-hunter-lime mt-0.5 block">
              {formatCurrency(entry.totalCost, true)}
            </span>
          </div>

          {/* Fuel Quantity */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Fuel Volume</span>
            <span className="font-mono text-base font-bold text-white dark:text-white text-slate-900 mt-0.5 block">
              {formatLitres(entry.litres)}
            </span>
          </div>

          {/* Fuel Price */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Fuel Rate</span>
            <span className="font-mono text-base font-bold text-white dark:text-white text-slate-900 mt-0.5 block">
              ₹{entry.pricePerLitre.toFixed(2)}/L
            </span>
          </div>

          {/* Running Cost */}
          <div className="bg-graphite-950 dark:bg-graphite-950 bg-slate-50 p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-medium">Running Cost</span>
            <span className="font-mono text-base font-bold text-white dark:text-white text-slate-900 mt-0.5 block">
              {entry.costPerKm ? `₹${entry.costPerKm.toFixed(2)}/km` : '--'}
            </span>
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="p-3 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-800 dark:border-graphite-800 border-slate-200">
            <span className="text-[10px] text-slate-400 block font-bold mb-1">Notes</span>
            <p className="text-xs text-slate-200 dark:text-slate-200 text-slate-800">{entry.notes}</p>
          </div>
        )}

        {/* Delete Confirmation Box */}
        {confirmDelete && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <p className="text-xs text-rose-400 font-bold flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
              Delete this fuel record permanently?
            </p>
            <p className="text-[11px] text-slate-400">
              This entry at {entry.odometer} km will be removed and mileage recalculated.
            </p>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl bg-graphite-800 text-xs font-bold text-slate-300"
              >
                Keep Entry
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        {!confirmDelete && (
          <div className="flex items-center space-x-2.5 pt-2">
            <button
              onClick={() => setConfirmDelete(true)}
              className="py-3 px-4 rounded-2xl bg-graphite-800/80 dark:bg-graphite-800/80 bg-slate-100 text-rose-400 hover:text-rose-300 border border-graphite-750/50 flex items-center justify-center space-x-1.5 transition text-xs font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => {
                onEdit(entry);
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-black text-xs uppercase tracking-wider shadow-dial shadow-hunter-lime/20 flex items-center justify-center space-x-1.5 hover:opacity-95 transition"
            >
              <Edit2 className="w-4 h-4 stroke-[2.5]" />
              <span>Edit Entry</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
