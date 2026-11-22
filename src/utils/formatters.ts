/**
 * Formatting utilities for Indian Rupee, distances, dates and mileage
 */

export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  // Format to Indian numbering system (e.g., ₹1,25,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

export function formatDistance(km: number): string {
  if (isNaN(km) || km === null || km === undefined) return '0 km';
  return new Intl.NumberFormat('en-IN').format(Math.round(km)) + ' km';
}

export function formatOdometer(km: number): string {
  if (isNaN(km) || km === null || km === undefined) return '000000';
  return String(Math.round(km)).padStart(6, '0');
}

export function formatLitres(litres: number): string {
  if (isNaN(litres) || litres === null || litres === undefined) return '0.00 L';
  return (Math.round(litres * 100) / 100).toFixed(2) + ' L';
}

export function formatMileage(kmPerLitre: number | null | undefined): string {
  if (kmPerLitre === null || kmPerLitre === undefined || isNaN(kmPerLitre)) {
    return '--.-';
  }
  return kmPerLitre.toFixed(1) + ' km/l';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entryDate = new Date(dateStr);
  entryDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - entryDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return formatDate(dateStr);
}

export function parseNumberSafe(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
