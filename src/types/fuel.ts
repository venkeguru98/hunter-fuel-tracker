export type FuelingType = 'full' | 'partial';

export interface FuelEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  odometer: number; // in km
  litres: number; // in L
  pricePerLitre: number; // in ₹
  totalCost: number; // in ₹
  fuelType: FuelingType;
  notes?: string;
  createdAt: number; // timestamp
  updatedAt?: number;

  // Calculated fields (populated by calculation engine)
  calculatedMileage?: number; // km/l (for full tank entries or leg intervals)
  distanceTravelled?: number; // km travelled in this interval
  costPerKm?: number; // ₹/km
  isPendingMileage?: boolean; // true if baseline anchor
  mileageReason?: string; // explanation
  isPartialEstimate?: boolean; // true if calculated from partial fill
}

export interface MotorcycleProfile {
  make: string;
  model: string;
  edition: string;
  modelYear: number;
  fuelCapacityLitres: number;
  initialOdometer: number;
  registrationNumber?: string;
  customPhotoUrl?: string; // Base64 compressed image from phone gallery
}

export interface AppSettings {
  currency: string;
  distanceUnit: 'km';
  fuelUnit: 'litres';
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  bikeProfile: MotorcycleProfile;
}

export interface FuelStats {
  latestMileage: number | null;
  averageMileage: number | null;
  bestMileage: number | null;
  lowestMileage: number | null;
  totalDistance: number;
  totalFuelLitres: number;
  totalExpenditure: number;
  averageCostPerKm: number | null;
  totalEntriesCount: number;
  fullTanksCount: number;
  partialFillsCount: number;
  currentOdometer: number;
  initialOdometer: number;
}

export interface MonthlyExpense {
  monthKey: string; // e.g. "2026-11"
  displayMonth: string; // e.g. "Nov 2026"
  totalCost: number;
  totalLitres: number;
  totalDistance: number;
  averageMileage: number | null;
  entriesCount: number;
}

export interface MileageDataPoint {
  date: string;
  formattedDate: string;
  odometer: number;
  mileage: number;
  fuelType: FuelingType;
  costPerKm?: number;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  application: string;
  bikeProfile: MotorcycleProfile;
  settings: AppSettings;
  entries: FuelEntry[];
}
