import { FuelEntry, FuelStats, MonthlyExpense, MileageDataPoint, MotorcycleProfile } from '../types/fuel';

/**
 * Enriches and calculates accurate mileage for a list of fuel entries.
 * Entries can be passed in any order; they will be sorted chronologically by odometer & date.
 */
export function calculateFuelIntervals(
  entries: FuelEntry[],
  bikeProfile?: MotorcycleProfile
): FuelEntry[] {
  if (!entries || entries.length === 0) return [];

  // Sort chronologically (ascending by odometer, then date/created timestamp)
  const sorted = [...entries].sort((a, b) => {
    if (a.odometer !== b.odometer) {
      return a.odometer - b.odometer;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  let lastFullTankIndex: number | null = null;
  let intermediateLitres = 0;
  let intermediateCost = 0;

  const result: FuelEntry[] = sorted.map((entry, index) => {
    const updated: FuelEntry = { ...entry };

    if (entry.fuelType === 'partial') {
      // Partial refill: cannot determine exact fuel consumed yet
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.costPerKm = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Partial refill – mileage recorded at next full tank';

      if (lastFullTankIndex !== null) {
        intermediateLitres += entry.litres;
        intermediateCost += entry.totalCost;
      }
      return updated;
    }

    // It's a full tank entry!
    if (lastFullTankIndex === null) {
      // First full tank anchor in history
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.costPerKm = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Baseline full-tank established – next full refill will show mileage';
      lastFullTankIndex = index;
      intermediateLitres = 0;
      intermediateCost = 0;
      return updated;
    }

    const prevFullEntry = sorted[lastFullTankIndex];
    const distance = entry.odometer - prevFullEntry.odometer;

    if (distance <= 0) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = 0;
      updated.costPerKm = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Odometer reading must be higher than previous full tank';
      lastFullTankIndex = index;
      intermediateLitres = 0;
      intermediateCost = 0;
      return updated;
    }

    // Total fuel consumed to bring the tank back to full = all partials in between + this refill
    const totalLitresConsumed = intermediateLitres + entry.litres;
    const totalIntervalCost = intermediateCost + entry.totalCost;

    if (totalLitresConsumed > 0) {
      const rawMileage = distance / totalLitresConsumed;
      updated.calculatedMileage = Math.round(rawMileage * 10) / 10;
      updated.distanceTravelled = distance;
      updated.costPerKm = Math.round((totalIntervalCost / distance) * 100) / 100;
      updated.isPendingMileage = false;
      updated.mileageReason = undefined;
    } else {
      updated.calculatedMileage = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Invalid fuel volume';
    }

    // Reset trackers for the next interval
    lastFullTankIndex = index;
    intermediateLitres = 0;
    intermediateCost = 0;

    return updated;
  });

  return result;
}

/**
 * Calculates aggregate statistics from enriched fuel entries
 */
export function calculateFuelStats(
  enrichedEntries: FuelEntry[],
  bikeProfile?: MotorcycleProfile
): FuelStats {
  const initialOdo = bikeProfile?.initialOdometer || 0;

  if (!enrichedEntries || enrichedEntries.length === 0) {
    return {
      latestMileage: null,
      averageMileage: null,
      bestMileage: null,
      lowestMileage: null,
      totalDistance: 0,
      totalFuelLitres: 0,
      totalExpenditure: 0,
      averageCostPerKm: null,
      totalEntriesCount: 0,
      fullTanksCount: 0,
      partialFillsCount: 0,
      currentOdometer: initialOdo,
      initialOdometer: initialOdo,
    };
  }

  // Sorted by odometer ascending
  const sorted = [...enrichedEntries].sort((a, b) => a.odometer - b.odometer);
  const minOdo = sorted[0].odometer;
  const maxOdo = sorted[sorted.length - 1].odometer;

  let totalLitres = 0;
  let totalCost = 0;
  let fullTanks = 0;
  let partialFills = 0;

  // For weighted average mileage: sum of all valid interval distances / sum of interval litres
  let validIntervalTotalDistance = 0;
  let validIntervalTotalLitres = 0;

  let bestMileage: number | null = null;
  let lowestMileage: number | null = null;
  let latestMileage: number | null = null;

  for (const entry of sorted) {
    totalLitres += entry.litres;
    totalCost += entry.totalCost;

    if (entry.fuelType === 'full') {
      fullTanks++;
    } else {
      partialFills++;
    }

    if (entry.calculatedMileage !== undefined && entry.distanceTravelled && entry.distanceTravelled > 0) {
      latestMileage = entry.calculatedMileage;

      if (bestMileage === null || entry.calculatedMileage > bestMileage) {
        bestMileage = entry.calculatedMileage;
      }
      if (lowestMileage === null || entry.calculatedMileage < lowestMileage) {
        lowestMileage = entry.calculatedMileage;
      }

      validIntervalTotalDistance += entry.distanceTravelled;
      // Calculate interval litres: distance / mileage
      const intervalLitres = entry.distanceTravelled / entry.calculatedMileage;
      validIntervalTotalLitres += intervalLitres;
    }
  }

  // Total distance tracked (from first entry or bike initial odo to highest entry)
  const baseline = initialOdo > 0 && initialOdo < minOdo ? initialOdo : minOdo;
  const totalDistance = Math.max(0, maxOdo - baseline);

  // Weighted average mileage
  let averageMileage: number | null = null;
  if (validIntervalTotalLitres > 0 && validIntervalTotalDistance > 0) {
    averageMileage = Math.round((validIntervalTotalDistance / validIntervalTotalLitres) * 10) / 10;
  }

  // Average cost per km
  let averageCostPerKm: number | null = null;
  if (totalDistance > 0 && totalCost > 0) {
    averageCostPerKm = Math.round((totalCost / totalDistance) * 100) / 100;
  }

  return {
    latestMileage,
    averageMileage,
    bestMileage,
    lowestMileage,
    totalDistance,
    totalFuelLitres: Math.round(totalLitres * 100) / 100,
    totalExpenditure: Math.round(totalCost * 100) / 100,
    averageCostPerKm,
    totalEntriesCount: sorted.length,
    fullTanksCount: fullTanks,
    partialFillsCount: partialFills,
    currentOdometer: maxOdo,
    initialOdometer: baseline,
  };
}

/**
 * Prepares chart data points for mileage trends over time
 */
export function getMileageTrendData(enrichedEntries: FuelEntry[]): MileageDataPoint[] {
  const sorted = [...enrichedEntries].sort((a, b) => a.odometer - b.odometer);
  const dataPoints: MileageDataPoint[] = [];

  for (const entry of sorted) {
    if (entry.calculatedMileage !== undefined) {
      const dateObj = new Date(entry.date);
      const formattedDate = dateObj.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });

      dataPoints.push({
        date: entry.date,
        formattedDate,
        odometer: entry.odometer,
        mileage: entry.calculatedMileage,
        fuelType: entry.fuelType,
        costPerKm: entry.costPerKm,
      });
    }
  }

  return dataPoints;
}

/**
 * Prepares monthly aggregated metrics for analytics
 */
export function getMonthlyAnalytics(enrichedEntries: FuelEntry[]): MonthlyExpense[] {
  const map = new Map<string, MonthlyExpense>();

  for (const entry of enrichedEntries) {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const displayMonth = date.toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit',
    });

    if (!map.has(monthKey)) {
      map.set(monthKey, {
        monthKey,
        displayMonth,
        totalCost: 0,
        totalLitres: 0,
        totalDistance: 0,
        averageMileage: null,
        entriesCount: 0,
      });
    }

    const cur = map.get(monthKey)!;
    cur.totalCost += entry.totalCost;
    cur.totalLitres += entry.litres;
    cur.entriesCount += 1;
    if (entry.distanceTravelled) {
      cur.totalDistance += entry.distanceTravelled;
    }
  }

  const list = Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Compute average mileage per month
  for (const item of list) {
    item.totalCost = Math.round(item.totalCost);
    item.totalLitres = Math.round(item.totalLitres * 10) / 10;
    if (item.totalDistance > 0 && item.totalLitres > 0) {
      item.averageMileage = Math.round((item.totalDistance / item.totalLitres) * 10) / 10;
    }
  }

  return list;
}
