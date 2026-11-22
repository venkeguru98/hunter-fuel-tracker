// Pure JS test runner replicating the calculation engine functions for direct Node verification
function calculateFuelIntervals(entries) {
  if (!entries || entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => {
    if (a.odometer !== b.odometer) return a.odometer - b.odometer;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  let lastFullTankIndex = null;
  let intermediateLitres = 0;
  let intermediateCost = 0;

  return sorted.map((entry, index) => {
    const updated = { ...entry };

    if (entry.fuelType === 'partial') {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Partial refill – mileage recorded at next full tank';
      if (lastFullTankIndex !== null) {
        intermediateLitres += entry.litres;
        intermediateCost += entry.totalCost;
      }
      return updated;
    }

    if (lastFullTankIndex === null) {
      updated.calculatedMileage = undefined;
      updated.distanceTravelled = undefined;
      updated.isPendingMileage = true;
      updated.mileageReason = 'Baseline full-tank established';
      lastFullTankIndex = index;
      intermediateLitres = 0;
      intermediateCost = 0;
      return updated;
    }

    const prevFullEntry = sorted[lastFullTankIndex];
    const distance = entry.odometer - prevFullEntry.odometer;

    if (distance <= 0) {
      updated.calculatedMileage = undefined;
      updated.isPendingMileage = true;
      lastFullTankIndex = index;
      intermediateLitres = 0;
      intermediateCost = 0;
      return updated;
    }

    const totalLitresConsumed = intermediateLitres + entry.litres;
    const totalIntervalCost = intermediateCost + entry.totalCost;

    if (totalLitresConsumed > 0) {
      const rawMileage = distance / totalLitresConsumed;
      updated.calculatedMileage = Math.round(rawMileage * 10) / 10;
      updated.distanceTravelled = distance;
      updated.costPerKm = Math.round((totalIntervalCost / distance) * 100) / 100;
      updated.isPendingMileage = false;
    }

    lastFullTankIndex = index;
    intermediateLitres = 0;
    intermediateCost = 0;
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
      validIntervalTotalLitres += (entry.distanceTravelled / entry.calculatedMileage);
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

console.log('=== TEST SUITE: HUNTER 350 CALCULATION & DATA LOGIC ===\n');

// 1. SPECIFICATION CASE
const specEntries = [
  { id: '1', date: '2026-11-01', odometer: 5000, litres: 11.0, totalCost: 1127.5, fuelType: 'full' },
  { id: '2', date: '2026-11-08', odometer: 5280, litres: 10.0, totalCost: 1025.0, fuelType: 'full' },
];
const specRes = calculateFuelIntervals(specEntries);
assert(specRes[1].distanceTravelled === 280, 'Distance is 280 km (5280 - 5000)');
assert(specRes[1].calculatedMileage === 28.0, 'Calculated mileage is exactly 28.0 km/l');

// 2. INTERMEDIATE PARTIAL CASE
const partialEntries = [
  { id: '1', date: '2026-11-01', odometer: 5000, litres: 10.0, totalCost: 1000, fuelType: 'full' },
  { id: '2', date: '2026-11-04', odometer: 5150, litres: 5.0, totalCost: 500, fuelType: 'partial' },
  { id: '3', date: '2026-11-08', odometer: 5300, litres: 6.0, totalCost: 600, fuelType: 'full' },
];
const partialRes = calculateFuelIntervals(partialEntries);
assert(partialRes[1].isPendingMileage === true, 'Partial refill is marked pending');
assert(partialRes[2].distanceTravelled === 300, 'Distance across partial fill is 300 km');
assert(partialRes[2].calculatedMileage === 27.3, 'Fuel consumed correctly totals 11L -> 27.3 km/l');

// 3. STATS AGGREGATION
const statsRes = calculateFuelStats(partialRes);
assert(statsRes.totalDistance === 300, 'Total distance tracked is 300 km');
assert(statsRes.totalFuelLitres === 21.0, 'Total fuel volume is 21.0 L');
assert(statsRes.totalExpenditure === 2100, 'Total expenditure is ₹2100');
assert(statsRes.latestMileage === 27.3, 'Latest mileage is 27.3 km/l');

console.log(`\n=== ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) process.exit(1);
