import { AppSettings, FuelEntry } from '../types/fuel';

const STORAGE_KEYS = {
  ENTRIES: 'hunter_fuel_entries_v1',
  SETTINGS: 'hunter_fuel_settings_v1',
  THEME: 'hunter_fuel_theme_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  distanceUnit: 'km',
  fuelUnit: 'litres',
  theme: 'dark',
  notificationsEnabled: true,
  bikeProfile: {
    make: 'Royal Enfield',
    model: 'Hunter 350',
    edition: 'Graphite Grey',
    modelYear: 2026,
    fuelCapacityLitres: 13,
    initialOdometer: 0,
    registrationNumber: '',
  },
};

export function loadStoredEntries(): FuelEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load stored entries from localStorage:', err);
    return [];
  }
}

export function saveStoredEntries(entries: FuelEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save entries to localStorage:', err);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      bikeProfile: {
        ...DEFAULT_SETTINGS.bikeProfile,
        ...(parsed.bikeProfile || {}),
      },
    };
  } catch (err) {
    console.error('Failed to load stored settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function clearAllAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
  } catch (err) {
    console.error('Failed to clear app data:', err);
  }
}
