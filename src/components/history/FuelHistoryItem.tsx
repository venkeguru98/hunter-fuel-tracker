import React from 'react';
import { FuelEntry } from '../../types/fuel';
import { formatCurrency, formatDate, formatDistance, formatLitres, formatRelativeDate } from '../../utils/formatters';
import { Fuel, ChevronRight, Sparkles, Clock } from 'lucide-react';

interface FuelHistoryItemProps {
  entry: FuelEntry;
  onClick: () => void;
}

export const FuelHistoryItem: React.FC<FuelHistoryItemProps> = ({ entry, onClick }) => {
  const isFull = entry.fuelType === 'full';
  const hasMileage = entry.calculatedMileage !== undefined;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="group relative overflow-hidden rounded-2xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3.5 border border-graphite-800 dark:border-graphite-800 border-slate-200 hover:border-graphite-700 dark:hover:border-graphite-700 active:scale-[0.99] transition cursor-pointer shadow-sm"
    >
      <div className="flex items-center justify-between">
        {/* Left Side: Type Icon + Date & Odometer */}
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isFull
                ? 'bg-hunter-lime/10 border-hunter-lime/30 text-hunter-lime'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}
          >
            <Fuel className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-white dark:text-white text-slate-900">
                {formatDistance(entry.odometer)}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isFull
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isFull ? 'Full Tank' : 'Partial'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-400 text-slate-500 mt-0.5">
              <span>{formatDate(entry.date)}</span>
              <span>•</span>
              <span>{formatLitres(entry.litres)}</span>
              <span>•</span>
              <span className="font-mono">₹{entry.pricePerLitre.toFixed(2)}/L</span>
            </div>
          </div>
        </div>

        {/* Right Side: Calculated Mileage or Amount */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="text-right">
            {hasMileage ? (
              <div className="flex items-baseline justify-end space-x-1">
                <span className="font-mono text-base font-black text-hunter-lime">
                  {entry.calculatedMileage!.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono font-bold text-hunter-lime">km/l</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono font-medium text-slate-400 block">
                {isFull ? 'Anchor' : 'Partial'}
              </span>
            )}

            <div className="font-mono text-xs font-bold text-white dark:text-white text-slate-800">
              {formatCurrency(entry.totalCost)}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
        </div>
      </div>

      {/* Optional Note snippet if present */}
      {entry.notes && (
        <div className="mt-2 pt-2 border-t border-graphite-800/60 dark:border-graphite-800/60 border-slate-100 text-[11px] text-slate-400 truncate italic">
          "{entry.notes}"
        </div>
      )}
    </div>
  );
};
