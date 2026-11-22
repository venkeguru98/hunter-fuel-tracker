import React from 'react';
import { FuelStats } from '../../types/fuel';
import { formatCurrency, formatLitres, formatMileage } from '../../utils/formatters';
import { Award, Fuel, IndianRupee, Activity, Hash, Gauge } from 'lucide-react';

interface FuelSummaryCardsProps {
  stats: FuelStats;
}

export const FuelSummaryCards: React.FC<FuelSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {/* 1. Average Mileage */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Average Mileage</span>
          <Activity className="w-3.5 h-3.5 text-hunter-lime" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-white dark:text-white text-slate-900">
            {formatMileage(stats.averageMileage).replace(' km/l', '')}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">km/l</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Weighted interval avg</span>
      </div>

      {/* 2. Best Mileage */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Best Mileage</span>
          <Award className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-emerald-400">
            {formatMileage(stats.bestMileage).replace(' km/l', '')}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">km/l</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Highway cruise peak</span>
      </div>

      {/* 3. Cost Per Km */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Running Cost</span>
          <IndianRupee className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-white dark:text-white text-slate-900">
            {stats.averageCostPerKm !== null ? `₹${stats.averageCostPerKm.toFixed(2)}` : '--'}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">/ km</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Fuel expenditure/km</span>
      </div>

      {/* 4. Total Spent */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Total Spent</span>
          <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-white dark:text-white text-slate-900">
            {formatCurrency(stats.totalExpenditure)}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Across all refuels</span>
      </div>

      {/* 5. Total Litres Purchased */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Total Fuel</span>
          <Fuel className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-white dark:text-white text-slate-900">
            {formatLitres(stats.totalFuelLitres).replace(' L', '')}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">Litres</span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Filled in tank</span>
      </div>

      {/* 6. Refuel Count */}
      <div className="bg-graphite-900/90 dark:bg-graphite-900/90 bg-white p-3 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-400 text-slate-500 mb-1">
          <span className="text-[11px] font-medium tracking-tight">Refuel Log</span>
          <Hash className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="font-mono text-xl font-black text-white dark:text-white text-slate-900">
            {stats.totalEntriesCount}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            ({stats.fullTanksCount} full, {stats.partialFillsCount} part)
          </span>
        </div>
        <span className="text-[10px] text-slate-500 mt-1">Total recorded refills</span>
      </div>
    </div>
  );
};
