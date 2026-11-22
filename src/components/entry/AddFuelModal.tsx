import React, { useState, useEffect } from 'react';
import { FuelEntry, FuelingType, MotorcycleProfile } from '../../types/fuel';
import { Modal } from '../common/Modal';
import { formatCurrency, formatDistance, parseNumberSafe } from '../../utils/formatters';
import { Fuel, Calendar, Gauge, IndianRupee, FileText, AlertTriangle, Check, Sparkles } from 'lucide-react';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<FuelEntry, 'id' | 'createdAt'> & { id?: string }) => void;
  editingEntry?: FuelEntry | null;
  existingEntries: FuelEntry[];
  currentOdometer?: number;
  bikeProfile?: MotorcycleProfile;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  existingEntries,
  currentOdometer = 0,
  bikeProfile,
}) => {
  // Find highest odometer to provide helpful placeholder and sanity warning
  const sortedByOdo = [...existingEntries].sort((a, b) => b.odometer - a.odometer);
  const highestRecordedOdo = sortedByOdo[0]?.odometer || currentOdometer || 0;
  const lastPrice = sortedByOdo[0]?.pricePerLitre || '';

  // Form states
  const [date, setDate] = useState<string>('');
  const [odometer, setOdometer] = useState<string>('');
  const [totalCost, setTotalCost] = useState<string>('');
  const [pricePerLitre, setPricePerLitre] = useState<string>('');
  const [litres, setLitres] = useState<string>('');
  const [fuelType, setFuelType] = useState<FuelingType>('full');
  const [notes, setNotes] = useState<string>('');
  const [acknowledgedOdoWarning, setAcknowledgedOdoWarning] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form when modal opens or editing entry changes
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setDate(editingEntry.date);
        setOdometer(String(editingEntry.odometer));
        setTotalCost(String(editingEntry.totalCost));
        setPricePerLitre(String(editingEntry.pricePerLitre));
        setLitres(String(editingEntry.litres));
        setFuelType(editingEntry.fuelType);
        setNotes(editingEntry.notes || '');
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setDate(todayStr);
        setOdometer('');
        setTotalCost('');
        setPricePerLitre(lastPrice ? String(lastPrice) : '');
        setLitres('');
        setFuelType('full');
        setNotes('');
      }
      setAcknowledgedOdoWarning(false);
      setShowConfirmation(false);
      setErrorMsg(null);
    }
  }, [isOpen, editingEntry, lastPrice]);

  // Bi-directional calculations:
  // 1. When Total Amount changes -> recalculate Litres
  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    const cost = parseNumberSafe(val);
    const price = parseNumberSafe(pricePerLitre);
    if (cost > 0 && price > 0) {
      const calcLitres = Math.round((cost / price) * 100) / 100;
      setLitres(String(calcLitres));
    }
  };

  // 2. When Litres changes -> recalculate Total Amount
  const handleLitresChange = (val: string) => {
    setLitres(val);
    const ltr = parseNumberSafe(val);
    const price = parseNumberSafe(pricePerLitre);
    if (ltr > 0 && price > 0) {
      const calcCost = Math.round(ltr * price * 100) / 100;
      setTotalCost(String(calcCost));
    }
  };

  // 3. When Price changes -> update Litres based on Cost
  const handlePriceChange = (val: string) => {
    setPricePerLitre(val);
    const price = parseNumberSafe(val);
    const cost = parseNumberSafe(totalCost);
    if (price > 0 && cost > 0) {
      const calcLitres = Math.round((cost / price) * 100) / 100;
      setLitres(String(calcLitres));
    }
  };

  const parsedOdo = parseNumberSafe(odometer);
  const parsedCost = parseNumberSafe(totalCost);
  const parsedPrice = parseNumberSafe(pricePerLitre);
  const parsedLitres = parseNumberSafe(litres);

  // Check if odometer is lower than the previous highest entry (only relevant when adding new entry)
  const isLowerThanPrevious =
    !editingEntry &&
    highestRecordedOdo > 0 &&
    parsedOdo > 0 &&
    parsedOdo <= highestRecordedOdo;

  // Validation
  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!date) {
      setErrorMsg('Please select refuelling date.');
      return;
    }
    if (!odometer || parsedOdo <= 0) {
      setErrorMsg('Please enter a valid positive odometer reading.');
      return;
    }
    if (!totalCost || parsedCost <= 0) {
      setErrorMsg('Please enter total amount paid (₹).');
      return;
    }
    if (!pricePerLitre || parsedPrice <= 0) {
      setErrorMsg('Please enter fuel price per litre (₹).');
      return;
    }
    if (!litres || parsedLitres <= 0) {
      setErrorMsg('Please enter or calculate fuel volume filled.');
      return;
    }

    if (isLowerThanPrevious && !acknowledgedOdoWarning) {
      setErrorMsg(
        `Odometer (${parsedOdo} km) is lower than or equal to previous recorded odometer (${highestRecordedOdo} km). Please confirm below to continue.`
      );
      return;
    }

    // Show quick confirmation summary
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    onSave({
      id: editingEntry?.id,
      date,
      odometer: parsedOdo,
      totalCost: parsedCost,
      pricePerLitre: parsedPrice,
      litres: parsedLitres,
      fuelType,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEntry ? 'Edit Fuel Refill' : 'Add Fuel Refill'}
      subtitle={bikeProfile ? `${bikeProfile.make} ${bikeProfile.model} • ${bikeProfile.edition}` : 'Fuel Refill'}
    >
      {!showConfirmation ? (
        <form onSubmit={validateAndProceed} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Refuel Type Toggle: Full Tank vs Partial */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 mb-1.5 font-bold">
              Refuelling Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-graphite-950 dark:bg-graphite-950 bg-slate-100 rounded-2xl border border-graphite-800 dark:border-graphite-800 border-slate-200">
              <button
                type="button"
                onClick={() => setFuelType('full')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  fuelType === 'full'
                    ? 'bg-hunter-lime text-graphite-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full Tank (Calculates km/l)</span>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('partial')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  fuelType === 'partial'
                    ? 'bg-amber-500 text-graphite-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Partial Filling</span>
              </button>
            </div>
          </div>

          {/* Row 1: Date & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 mb-1 font-bold">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime transition"
                />
              </div>
            </div>

            {/* Odometer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 font-bold">
                  Odometer (km)
                </label>
                {highestRecordedOdo > 0 && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Last: {highestRecordedOdo} km
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={highestRecordedOdo > 0 ? String(highestRecordedOdo + 100) : 'e.g. 500'}
                  required
                  min="0"
                  step="1"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime transition"
                />
              </div>
            </div>
          </div>

          {/* Warning banner if odometer is <= previous */}
          {isLowerThanPrevious && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Odometer ({parsedOdo} km) is lower than or equal to the previous highest reading ({highestRecordedOdo} km).
                </p>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acknowledgedOdoWarning}
                  onChange={(e) => setAcknowledgedOdoWarning(e.target.checked)}
                  className="rounded border-graphite-700 text-hunter-lime focus:ring-hunter-lime"
                />
                <span className="text-[11px] text-slate-300 font-medium">
                  I confirm this odometer reading is correct (e.g. entering older record)
                </span>
              </label>
            </div>
          )}

          {/* Row 2: Total Cost & Price Per Litre */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Paid (₹) */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 mb-1 font-bold">
                Total Paid (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  required
                  min="1"
                  step="any"
                  value={totalCost}
                  onChange={(e) => handleTotalCostChange(e.target.value)}
                  className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime transition"
                />
              </div>
            </div>

            {/* Price Per Litre (₹/L) */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 mb-1 font-bold">
                Price / Litre (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 102.50"
                  required
                  min="1"
                  step="any"
                  value={pricePerLitre}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl pl-7 pr-3 py-2.5 text-sm font-mono text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime transition"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Litres Filled (Bi-directional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 font-bold">
                Fuel Filled (Litres)
              </label>
              <span className="text-[10px] text-hunter-lime font-mono">
                Auto-calculated (or type here)
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="e.g. 4.88"
                required
                min="0.1"
                step="any"
                value={litres}
                onChange={(e) => handleLitresChange(e.target.value)}
                className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-hunter-lime/40 dark:border-hunter-lime/40 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-hunter-lime focus:outline-none focus:border-hunter-lime transition"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                Litres
              </span>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-400 text-slate-600 mb-1 font-bold">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shell V-Power, Highway cruise, City commute"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-750 dark:border-graphite-750 border-slate-300 rounded-xl px-3.5 py-2 text-xs text-white dark:text-white text-slate-900 focus:outline-none focus:border-hunter-lime transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-graphite-800 dark:bg-graphite-800 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-700 font-bold text-xs hover:bg-graphite-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-black text-xs tracking-wider uppercase shadow-dial shadow-hunter-lime/20 hover:opacity-95 active:scale-95 transition"
            >
              Review & Save
            </button>
          </div>
        </form>
      ) : (
        /* Confirmation Screen Before Saving */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-graphite-950 dark:bg-graphite-950 bg-slate-50 border border-graphite-800 dark:border-graphite-800 border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-graphite-800 dark:border-graphite-800 border-slate-200">
              <span className="text-xs text-slate-400 font-medium">Refuelling Type</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                  fuelType === 'full'
                    ? 'bg-hunter-lime/10 text-hunter-lime border border-hunter-lime/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {fuelType === 'full' ? 'Full Tank' : 'Partial Filling'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Date</span>
              <span className="text-xs font-mono font-bold text-white dark:text-white text-slate-900">{date}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Odometer</span>
              <span className="text-sm font-mono font-bold text-white dark:text-white text-slate-900">
                {formatDistance(parsedOdo)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Amount Paid</span>
              <span className="text-sm font-mono font-bold text-hunter-lime">
                {formatCurrency(parsedCost, true)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Litres Filled</span>
              <span className="text-xs font-mono font-bold text-white dark:text-white text-slate-900">
                {parsedLitres.toFixed(2)} L @ ₹{parsedPrice.toFixed(2)}/L
              </span>
            </div>

            {notes && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Notes</span>
                <span className="text-xs text-slate-300 dark:text-slate-300 text-slate-700 italic truncate max-w-[200px]">
                  {notes}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="flex-1 py-3 rounded-2xl bg-graphite-800 dark:bg-graphite-800 bg-slate-100 text-slate-300 dark:text-slate-300 text-slate-700 font-bold text-xs hover:bg-graphite-750 transition"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-hunter-lime to-lime-400 text-graphite-950 font-black text-xs tracking-wider uppercase shadow-dial shadow-hunter-lime/30 active:scale-95 transition flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Save</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
