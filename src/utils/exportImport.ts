import { AppSettings, BackupData, FuelEntry } from '../types/fuel';

const BACKUP_VERSION = '1.0';

/**
 * Creates the standardized backup payload object
 */
export function createBackupPayload(
  entries: FuelEntry[],
  settings: AppSettings
): BackupData {
  return {
    version: BACKUP_VERSION,
    application: 'Hunter Fuel Tracker',
    exportedAt: new Date().toISOString(),
    bikeProfile: settings.bikeProfile,
    settings,
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      odometer: e.odometer,
      litres: e.litres,
      pricePerLitre: e.pricePerLitre,
      totalCost: e.totalCost,
      fuelType: e.fuelType,
      notes: e.notes || '',
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };
}

/**
 * Trigger download or native share for a backup file
 */
export async function exportBackupFile(
  entries: FuelEntry[],
  settings: AppSettings
): Promise<{ success: boolean; shared: boolean; message: string }> {
  try {
    const payload = createBackupPayload(entries, settings);
    const jsonString = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Hunter350_Fuel_Backup_${dateStr}.json`;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    // Attempt Native Share Sheet (iOS Safari / Android Chrome)
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] }) &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: 'Hunter 350 Fuel Backup',
          text: `Royal Enfield Hunter 350 Fuel Log Backup (${dateStr}) - ${entries.length} records.`,
          files: [file],
        });
        return { success: true, shared: true, message: 'Shared successfully via mobile share sheet' };
      } catch (shareErr: unknown) {
        if (shareErr instanceof Error && shareErr.name === 'AbortError') {
          return { success: false, shared: false, message: 'Share canceled by user' };
        }
        // If sharing failed or was refused, fallback to browser download
      }
    }

    // Direct browser download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, shared: false, message: `Backup downloaded as ${fileName}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return { success: false, shared: false, message };
  }
}

/**
 * Export entries as CSV file for Excel / Google Sheets
 */
export async function exportCsvFile(
  enrichedEntries: FuelEntry[]
): Promise<{ success: boolean; shared: boolean; message: string }> {
  try {
    const sorted = [...enrichedEntries].sort((a, b) => a.odometer - b.odometer);
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Hunter350_Fuel_Log_${dateStr}.csv`;

    const headers = [
      'Date',
      'Odometer (km)',
      'Litres Filled (L)',
      'Price Per Litre (INR)',
      'Total Paid (INR)',
      'Refuelling Type',
      'Calculated Mileage (km/L)',
      'Distance Travelled (km)',
      'Cost Per Km (INR/km)',
      'Notes',
    ];

    const rows = sorted.map((entry) => [
      `"${entry.date}"`,
      entry.odometer,
      entry.litres.toFixed(2),
      entry.pricePerLitre.toFixed(2),
      entry.totalCost.toFixed(2),
      `"${entry.fuelType === 'full' ? 'Full Tank' : 'Partial'}"`,
      entry.calculatedMileage ? entry.calculatedMileage.toFixed(1) : '""',
      entry.distanceTravelled ? entry.distanceTravelled : '""',
      entry.costPerKm ? entry.costPerKm.toFixed(2) : '""',
      `"${(entry.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], fileName, { type: 'text/csv' });

    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] }) &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: 'Hunter 350 Fuel CSV Report',
          text: `Royal Enfield Hunter 350 Fuel Log (${dateStr}) - ${sorted.length} entries.`,
          files: [file],
        });
        return { success: true, shared: true, message: 'CSV shared successfully via mobile share sheet' };
      } catch (shareErr: unknown) {
        if (shareErr instanceof Error && shareErr.name === 'AbortError') {
          return { success: false, shared: false, message: 'Share canceled' };
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, shared: false, message: `CSV downloaded as ${fileName}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'CSV export failed';
    return { success: false, shared: false, message };
  }
}

export interface ImportValidationResult {
  isValid: boolean;
  error?: string;
  payload?: BackupData;
  summary?: {
    totalRecords: number;
    newRecordsCount: number;
    duplicateRecordsCount: number;
    earliestDate?: string;
    latestDate?: string;
    bikeModel?: string;
    exportedAt?: string;
  };
}

/**
 * Validates and previews a JSON file for import
 */
export function validateAndPreviewBackup(
  jsonText: string,
  existingEntries: FuelEntry[]
): ImportValidationResult {
  try {
    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'File is not a valid JSON object.' };
    }

    // Support both direct array of entries or structured BackupData
    let entries: FuelEntry[] = [];
    let bikeProfile = parsed.bikeProfile;
    let exportedAt = parsed.exportedAt || '';

    if (Array.isArray(parsed)) {
      entries = parsed;
    } else if (Array.isArray(parsed.entries)) {
      entries = parsed.entries;
    } else {
      return { isValid: false, error: 'No fuel entries found in this backup file.' };
    }

    if (entries.length === 0) {
      return { isValid: false, error: 'The backup file contains 0 fuel records.' };
    }

    // Validate entries schema
    const validEntries: FuelEntry[] = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (
        typeof e.odometer !== 'number' ||
        typeof e.litres !== 'number' ||
        typeof e.totalCost !== 'number' ||
        !e.date
      ) {
        return {
          isValid: false,
          error: `Record #${i + 1} has invalid or missing data fields (date, odo, litres or totalCost).`,
        };
      }

      validEntries.push({
        id: e.id || `imported-${Date.now()}-${i}`,
        date: e.date,
        odometer: Number(e.odometer),
        litres: Number(e.litres),
        pricePerLitre: Number(e.pricePerLitre || (e.litres > 0 ? e.totalCost / e.litres : 0)),
        totalCost: Number(e.totalCost),
        fuelType: e.fuelType === 'partial' ? 'partial' : 'full',
        notes: e.notes || '',
        createdAt: e.createdAt || Date.now(),
        updatedAt: e.updatedAt,
      });
    }

    // Check for duplicates with existing entries
    const existingOdoDates = new Set(
      existingEntries.map((e) => `${e.odometer}_${e.date}`)
    );

    let duplicatesCount = 0;
    let newCount = 0;

    for (const item of validEntries) {
      const key = `${item.odometer}_${item.date}`;
      if (existingOdoDates.has(key)) {
        duplicatesCount++;
      } else {
        newCount++;
      }
    }

    const sortedDates = [...validEntries].map((e) => e.date).sort();

    const normalizedBackup: BackupData = {
      version: parsed.version || '1.0',
      application: parsed.application || 'Hunter Fuel Tracker',
      exportedAt,
      bikeProfile: bikeProfile || undefined,
      settings: parsed.settings || undefined,
      entries: validEntries,
    };

    return {
      isValid: true,
      payload: normalizedBackup,
      summary: {
        totalRecords: validEntries.length,
        newRecordsCount: newCount,
        duplicateRecordsCount: duplicatesCount,
        earliestDate: sortedDates[0],
        latestDate: sortedDates[sortedDates.length - 1],
        bikeModel: bikeProfile?.model ? `${bikeProfile.make} ${bikeProfile.model}` : undefined,
        exportedAt,
      },
    };
  } catch {
    return { isValid: false, error: 'Failed to parse JSON file. Please ensure it is a valid backup file.' };
  }
}

/**
 * Merges or replaces fuel entries based on user choice
 */
export function mergeImportedEntries(
  existingEntries: FuelEntry[],
  importedEntries: FuelEntry[],
  strategy: 'merge' | 'replace'
): FuelEntry[] {
  if (strategy === 'replace') {
    return [...importedEntries].sort((a, b) => a.odometer - b.odometer);
  }

  // Strategy: Merge and avoid duplicates
  const map = new Map<string, FuelEntry>();

  // Add existing entries
  for (const entry of existingEntries) {
    const key = `${entry.odometer}_${entry.date}`;
    map.set(key, entry);
  }

  // Merge imported entries (overwrite if exact match or insert new)
  for (const entry of importedEntries) {
    const key = `${entry.odometer}_${entry.date}`;
    if (!map.has(key)) {
      map.set(key, entry);
    }
  }

  return Array.from(map.values()).sort((a, b) => a.odometer - b.odometer);
}
