// Pure JS test runner replicating the calculation engine functions for direct Node verification
function calculateFuelIntervals(entries) {
  if (!entries || entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => {
    if (a.odometer !== b.odometer) return a.odometer - b.odometer;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  let lastFullTankIndex = null;
  let intermediateLitresSinceFull = 0;
  let intermediateCostSinceFull = 0;

  return sorted.map((entry, index) => {
    const updated = { ...entry };

    if (index === 0) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'First refuel baseline logged';
      if (entry.fuelType === 'full') {
        lastFullTankIndex = 0;
      }
      return updated;
    }

    const prevEntry = sorted[index - 1];
    const legDistance = entry.odometer - prevEntry.odometer;

    if (legDistance <= 0) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = 0;
      updated.isPendingMileage = true;
      return updated;
    }

    // Full tank block calculation if applicable
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

        lastFullTankIndex = index;
        intermediateLitresSinceFull = 0;
        intermediateCostSinceFull = 0;
        return updated;
      }
    }

    // Standard leg calculation (supports all refills, including partial fills!)
    if (entry.litres > 0) {
      const rawMileage = legDistance / entry.litres;
      updated.calculatedMileage = Math.round(rawMileage * 10) / 10;
      updated.distanceTravelled = legDistance;
      updated.costPerKm = Math.round((entry.totalCost / legDistance) * 100) / 100;
      updated.isPendingMileage = false;
      updated.isPartialEstimate = entry.fuelType === 'partial';
    }

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
}

function calculateFuelStats(enrichedEntries) {
  const sorted = [...enrichedEntries].sort((a, b) => a.odometer - b.odometer);
  let totalLitres = 0;
  let totalCost = 0;
  let fullTanks = 0;
  let partialFills = 0;
  let validIntervalTotalDistance = 0;
  let validIntervalTotalLitres = 0;
  let latestMileage = null;
  let bestMileage = null;
  let lowestMileage = null;

  for (const entry of sorted) {
    totalLitres += entry.litres;
    totalCost += entry.totalCost;
    if (entry.fuelType === 'full') fullTanks++;
    else partialFills++;

    if (entry.calculatedMileage !== undefined && entry.distanceTravelled && entry.distanceTravelled > 0) {
      latestMileage = entry.calculatedMileage;
      if (bestMileage === null || entry.calculatedMileage > bestMileage) bestMileage = entry.calculatedMileage;
      if (lowestMileage === null || entry.calculatedMileage < lowestMileage) lowestMileage = entry.calculatedMileage;
      validIntervalTotalDistance += entry.distanceTravelled;
      validIntervalTotalLitres += entry.litres;
    }
  }

  const minOdo = sorted[0].odometer;
  const maxOdo = sorted[sorted.length - 1].odometer;
  const totalDistance = maxOdo - minOdo;
  const averageMileage = validIntervalTotalLitres > 0 ? Math.round((validIntervalTotalDistance / validIntervalTotalLitres) * 10) / 10 : null;

  return {
    latestMileage,
    averageMileage,
    bestMileage,
    lowestMileage,
    totalDistance,
    totalFuelLitres: Math.round(totalLitres * 100) / 100,
    totalExpenditure: Math.round(totalCost * 100) / 100,
    totalEntriesCount: sorted.length,
    fullTanksCount: fullTanks,
    partialFillsCount: partialFills,
  };
}

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

console.log('=== TEST SUITE: HUNTER 350 CALCULATION & PARTIAL FILL SUPPORT ===\n');

// 1. SPECIFICATION CONSECUTIVE FULL TANK
const specEntries = [
  { id: '1', date: '2026-11-01', odometer: 5000, litres: 11.0, totalCost: 1127.5, fuelType: 'full' },
  { id: '2', date: '2026-11-08', odometer: 5280, litres: 10.0, totalCost: 1025.0, fuelType: 'full' },
];
const specRes = calculateFuelIntervals(specEntries);
assert(specRes[1].distanceTravelled === 280, 'Distance is 280 km (5280 - 5000)');
assert(specRes[1].calculatedMileage === 28.0, 'Calculated mileage is exactly 28.0 km/l');

// 2. USER SCENARIO: PURELY PARTIAL PETROL FILLS (No full tank)
const partialOnlyEntries = [
  { id: '1', date: '2026-11-01', odometer: 5000, litres: 4.0, totalCost: 400, fuelType: 'partial' },
  { id: '2', date: '2026-11-05', odometer: 5140, litres: 4.0, totalCost: 400, fuelType: 'partial' }, // 140km / 4L = 35.0 km/l
  { id: '3', date: '2026-11-10', odometer: 5290, litres: 4.0, totalCost: 400, fuelType: 'partial' }, // 150km / 4L = 37.5 km/l
];
const partialOnlyRes = calculateFuelIntervals(partialOnlyEntries);
assert(partialOnlyRes[0].isPendingMileage === true, 'First partial entry establishes baseline');
assert(partialOnlyRes[1].calculatedMileage === 35.0, '2nd partial entry calculates 35.0 km/l mileage immediately');
assert(partialOnlyRes[1].distanceTravelled === 140, 'Leg distance is 140 km');
assert(partialOnlyRes[2].calculatedMileage === 37.5, '3rd partial entry calculates 37.5 km/l mileage');

const partialStats = calculateFuelStats(partialOnlyRes);
assert(partialStats.latestMileage === 37.5, 'Latest mileage shows 37.5 km/l without requiring full tank');
assert(partialStats.averageMileage === 36.3, 'Average mileage computed for partial fills (290km / 8L = 36.3 km/l)');
assert(partialStats.totalDistance === 290, 'Total distance tracked is 290 km');

// 3. MIXED PARTIAL + FULL
const mixedEntries = [
  { id: '1', date: '2026-11-01', odometer: 5000, litres: 10.0, totalCost: 1000, fuelType: 'full' },
  { id: '2', date: '2026-11-04', odometer: 5150, litres: 5.0, totalCost: 500, fuelType: 'partial' },
  { id: '3', date: '2026-11-08', odometer: 5300, litres: 6.0, totalCost: 600, fuelType: 'full' },
];
const mixedRes = calculateFuelIntervals(mixedEntries);
assert(mixedRes[1].calculatedMileage === 30.0, 'Partial leg calculates 30.0 km/l (150km / 5L)');
assert(mixedRes[2].calculatedMileage === 27.3, 'Full tank block calculates 27.3 km/l (300km / 11L)');

console.log(`\n=== ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
