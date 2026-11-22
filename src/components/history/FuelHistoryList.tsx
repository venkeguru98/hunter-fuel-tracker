import React, { useState, useMemo } from 'react';
import { FuelEntry } from '../../types/fuel';
import { FuelHistoryItem } from './FuelHistoryItem';
import { Search, Filter, Calendar, Fuel, Plus } from 'lucide-react';
import { formatCurrency, formatDistance, formatLitres } from '../../utils/formatters';

interface FuelHistoryListProps {
  entries: FuelEntry[];
  onSelectEntry: (entry: FuelEntry) => void;
  onOpenAddModal: () => void;
}

export const FuelHistoryList: React.FC<FuelHistoryListProps> = ({
  entries,
  onSelectEntry,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'full' | 'partial'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Available months list extracted from entries
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.date) {
        const monthKey = e.date.substring(0, 7); // "YYYY-MM"
        set.add(monthKey);
      }
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  // Filter and sort entries (newest first: by odometer descending, then date descending)
  const filteredEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => {
        // Search filter (odometer, date, notes)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchesOdo = String(entry.odometer).includes(q);
          const matchesDate = entry.date.toLowerCase().includes(q);
          const matchesNotes = entry.notes?.toLowerCase().includes(q) || false;
          if (!matchesOdo && !matchesDate && !matchesNotes) return false;
        }

        // Type filter
        if (selectedType !== 'all' && entry.fuelType !== selectedType) {
          return false;
        }

        // Month filter
        if (selectedMonth !== 'all' && !entry.date.startsWith(selectedMonth)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (b.odometer !== a.odometer) return b.odometer - a.odometer;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [entries, searchTerm, selectedType, selectedMonth]);

  // Summary of filtered entries
  const filteredTotalCost = useMemo(() => {
    return filteredEntries.reduce((acc, cur) => acc + cur.totalCost, 0);
  }, [filteredEntries]);

  const filteredTotalLitres = useMemo(() => {
    return filteredEntries.reduce((acc, cur) => acc + cur.litres, 0);
  }, [filteredEntries]);

  return (
    <div className="space-y-3.5">
      {/* Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white dark:text-white text-slate-900 tracking-tight">
            Fuel History Log
          </h2>
          <p className="text-xs text-slate-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'record' : 'records'} found
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-hunter-lime text-graphite-950 rounded-xl font-bold text-xs shadow-sm active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by date, odometer, or note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-graphite-900/90 dark:bg-graphite-900/90 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-white dark:text-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-hunter-lime transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Row: Type Pills & Month Select */}
      <div className="flex items-center justify-between space-x-2 overflow-x-auto pb-1">
        {/* Type Filter Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-graphite-950 dark:bg-graphite-950 bg-slate-100 p-1 rounded-xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedType === 'all'
                ? 'bg-hunter-lime text-graphite-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('full')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedType === 'full'
                ? 'bg-hunter-lime text-graphite-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Tank
          </button>
          <button
            onClick={() => setSelectedType('partial')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              selectedType === 'partial'
                ? 'bg-amber-500 text-graphite-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partial
          </button>
        </div>

        {/* Month Selector */}
        {availableMonths.length > 0 && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="shrink-0 bg-graphite-900 dark:bg-graphite-900 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 dark:text-slate-300 text-slate-700 focus:outline-none"
          >
            <option value="all">All Months</option>
            {availableMonths.map((m) => {
              const [y, mon] = m.split('-');
              const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
              const label = dateObj.toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
              });
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Filtered Aggregates Sub-banner */}
      {filteredEntries.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-850 dark:border-graphite-850 border-slate-200 text-[11px] text-slate-400">
          <span>
            Total: <strong className="text-white dark:text-white text-slate-900 font-mono">{formatCurrency(filteredTotalCost)}</strong>
          </span>
          <span>
            Fuel: <strong className="text-white dark:text-white text-slate-900 font-mono">{formatLitres(filteredTotalLitres)}</strong>
          </span>
        </div>
      )}

      {/* List of Entries */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-2.5 pt-1">
          {filteredEntries.map((entry) => (
            <FuelHistoryItem
              key={entry.id}
              entry={entry}
              onClick={() => onSelectEntry(entry)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-3xl bg-graphite-900/60 dark:bg-graphite-900/60 bg-white border border-graphite-800 dark:border-graphite-800 border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-graphite-800 text-slate-400 mx-auto flex items-center justify-center">
            <Fuel className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-sm font-bold text-white dark:text-white text-slate-800">
            No Refuelling Records Found
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {searchTerm || selectedType !== 'all' || selectedMonth !== 'all'
              ? 'Try adjusting your search query or filters.'
              : 'Start logging your Hunter 350 refuels to track real-world mileage!'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-hunter-lime text-graphite-950 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Refill</span>
          </button>
        </div>
      )}
    </div>
  );
};
