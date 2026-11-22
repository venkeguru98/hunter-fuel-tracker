import React from 'react';
import { FuelEntry } from '../../types/fuel';
import { formatCurrency, formatDistance, formatLitres, formatMileage, formatRelativeDate } from '../../utils/formatters';
import { Fuel, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface QuickRefuelsListProps {
  entries: FuelEntry[];
  onViewAll: () => void;
  onSelectEntry: (entry: FuelEntry) => void;
}

export const QuickRefuelsList: React.FC<QuickRefuelsListProps> = ({
  entries,
  onViewAll,
  onSelectEntry,
}) => {
  // Sort descending by odometer/date to show newest first
  const recent = [...entries]
    .sort((a, b) => b.odometer - a.odometer)
    .slice(0, 3);

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-card-dark dark:shadow-card-dark shadow-card-light p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white dark:text-white text-slate-900">
              Recent Refuels
            </h3>
            <p className="text-[10px] text-slate-400">Latest fill-ups & mileage</p>
          </div>
        </div>

        <button
          onClick={onViewAll}
          className="text-[11px] font-bold text-hunter-lime hover:underline flex items-center space-x-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-x-0 space-y-2">
        {recent.map((entry) => (
          <div
            key={entry.id}
            onClick={() => onSelectEntry(entry)}
            className="group cursor-pointer p-3 rounded-2xl bg-graphite-850/80 dark:bg-graphite-850/80 bg-slate-50 hover:bg-graphite-800 dark:hover:bg-graphite-800 border border-graphite-750/50 dark:border-graphite-750/50 border-slate-200 transition-all flex items-center justify-between"
          >
            {/* Left Info */}
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  entry.fuelType === 'full'
                    ? 'bg-hunter-lime/10 border-hunter-lime/30 text-hunter-lime'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                }`}
              >
                <Fuel className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-xs font-bold text-white dark:text-white text-slate-900 truncate">
                    {formatDistance(entry.odometer)}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      entry.fuelType === 'full'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {entry.fuelType === 'full' ? 'Full' : 'Partial'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-400 text-slate-500 flex items-center space-x-1.5 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatRelativeDate(entry.date)}</span>
                  <span>•</span>
                  <span>{formatLitres(entry.litres)}</span>
                </div>
              </div>
            </div>

            {/* Right Metric */}
            <div className="text-right shrink-0">
              {entry.calculatedMileage !== undefined ? (
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm font-black text-hunter-lime">
                    {entry.calculatedMileage.toFixed(1)} <span className="text-[10px]">km/l</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatCurrency(entry.totalCost)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {entry.fuelType === 'full' ? 'Anchor' : 'Partial'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatCurrency(entry.totalCost)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
