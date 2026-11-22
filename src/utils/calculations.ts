import { FuelEntry, FuelStats, MonthlyExpense, MileageDataPoint, MotorcycleProfile } from '../types/fuel';

/**
 * Enriches and calculates accurate mileage for every fuel entry.
 * Supports BOTH full-tank refills and partial top-ups!
 * Calculates leg-by-leg interval mileage as well as full-tank anchor intervals.
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
  let intermediateLitresSinceFull = 0;
  let intermediateCostSinceFull = 0;

  const result: FuelEntry[] = sorted.map((entry, index) => {
    const updated: FuelEntry = { ...entry };

    // First entry in history establishes the starting baseline odometer
    if (index === 0) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.costPerKm = undefined;
      updated.isPendingMileage = true;
      updated.isPartialEstimate = entry.fuelType === 'partial';
      updated.mileageReason = 'First refuel baseline logged — mileage calculates from your 2nd refuel onward';

      if (entry.fuelType === 'full') {
        lastFullTankIndex = 0;
        intermediateLitresSinceFull = 0;
        intermediateCostSinceFull = 0;
      }
      return updated;
    }

    const prevEntry = sorted[index - 1];
    const legDistance = entry.odometer - prevEntry.odometer;

    if (legDistance <= 0) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = 0;
      updated.costPerKm = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Odometer reading must be higher than previous refill';
      return updated;
    }

    // Check if we can calculate full-tank to full-tank block mileage
    if (entry.fuelType === 'full' && lastFullTankIndex !== null) {
      const prevFull = sorted[lastFullTankIndex];
      const blockDistance = entry.odometer - prevFull.odometer;
      const totalBlockLitres = intermediateLitresSinceFull + entry.litres;
      const totalBlockCost = intermediateCostSinceFull + entry.totalCost;

      if (totalBlockLitres > 0 && blockDistance > 0) {
        const rawMileage = blockDistance / totalBlockLitres;
        updated.calculatedMileage = Math.round(rawMileage * 10) / 10;
        updated.distanceTravelled = blockDistance;
        updated.costPerKm = Math.round((totalBlockCost / blockDistance) * 100) / 100;
        updated.isPendingMileage = false;
        updated.isPartialEstimate = false;
        updated.mileageReason = intermediateLitresSinceFull > 0
          ? `Full-tank verified (${blockDistance} km across partial top-ups)`
          : 'Full-tank verified interval';

        // Reset trackers
        lastFullTankIndex = index;
        intermediateLitresSinceFull = 0;
        intermediateCostSinceFull = 0;
        return updated;
      }
    }

    // Standard Leg Mileage (supported for ALL refills, including partial fills!):
    // Leg Mileage = Distance travelled since last refuel / Litres filled
    if (entry.litres > 0) {
      const rawMileage = legDistance / entry.litres;
      updated.calculatedMileage = Math.round(rawMileage * 10) / 10;
      updated.distanceTravelled = legDistance;
      updated.costPerKm = Math.round((entry.totalCost / legDistance) * 100) / 100;
      updated.isPendingMileage = false;
      updated.isPartialEstimate = entry.fuelType === 'partial';
      updated.mileageReason = entry.fuelType === 'partial'
        ? `Partial refill interval (${legDistance} km / ${entry.litres.toFixed(1)} L)`
        : `Full refill interval (${legDistance} km / ${entry.litres.toFixed(1)} L)`;
    } else {
      updated.calculatedMileage = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Invalid fuel litres';
    }

    // Track for full tank anchors if relevant
    if (entry.fuelType === 'full') {
      lastFullTankIndex = index;
      intermediateLitresSinceFull = 0;
      intermediateCostSinceFull = 0;
    } else if (lastFullTankIndex !== null) {
      intermediateLitresSinceFull += entry.litres;
      intermediateCostSinceFull += entry.totalCost;
    }

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
      validIntervalTotalLitres += entry.litres;
    }
  }

  // Total distance tracked (from first entry or bike initial odo to highest entry)
  const baseline = initialOdo > 0 && initialOdo < minOdo ? initialOdo : minOdo;
  const totalDistance = Math.max(0, maxOdo - baseline);

  // Weighted average mileage across all valid intervals
  let averageMileage: number | null = null;
  if (validIntervalTotalLitres > 0 && validIntervalTotalDistance > 0) {
    averageMileage = Math.round((validIntervalTotalDistance / validIntervalTotalLitres) * 10) / 10;
  } else if (totalDistance > 0 && totalLitres > 0 && sorted.length > 1) {
    averageMileage = Math.round((totalDistance / totalLitres) * 10) / 10;
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
 * Prepares chart data points for mileage trends over time (supports all refuels!)
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
