export type ExpirationSetting =
  | '1d'
  | '7d'
  | '15d'
  | '1m'
  | '3m'
  | '6m'
  | '1y'
  | 'custom'
  | 'never';

export interface ExpirationOption {
  id: ExpirationSetting;
  label: string;
  description: string;
  isDefault?: boolean;
}

export const EXPIRATION_OPTIONS: ExpirationOption[] = [
  { id: '1d', label: '1 Day', description: '24-hour romantic reveal' },
  { id: '7d', label: '7 Days', description: 'One week celebration' },
  { id: '15d', label: '15 Days', description: 'Two weeks of memories' },
  { id: '1m', label: '1 Month', description: 'One calendar month (Recommended)', isDefault: true },
  { id: '3m', label: '3 Months', description: 'Full season window' },
  { id: '6m', label: '6 Months', description: 'Half a year' },
  { id: '1y', label: '1 Year', description: 'Full milestone year' },
  { id: 'custom', label: 'Custom Date & Time', description: 'Pick your exact expiration moment' },
  { id: 'never', label: 'Never Expires', description: 'Permanent digital keepsake' },
];

/**
 * Calendar month addition with end-of-month clamping (e.g. Oct 31 -> Nov 30, Jan 31 -> Feb 28)
 */
export function addCalendarMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const originalDay = d.getDate();
  const targetMonth = d.getMonth() + months;
  
  d.setMonth(targetMonth);
  // Check if day rolled over into next month (e.g., Feb 30 -> Mar 2)
  const normalizedTargetMonth = ((targetMonth % 12) + 12) % 12;
  if (d.getMonth() !== normalizedTargetMonth) {
    d.setDate(0); // Clamps to the last day of the intended month
  }
  return d;
}

/**
 * Calculates the UTC ISO expiration timestamp based on preset or custom time.
 */
export function calculateExpirationDate(
  setting: ExpirationSetting,
  baseDate: Date = new Date(),
  customIso?: string | null
): string | null {
  if (setting === 'never') {
    return null;
  }

  if (setting === 'custom') {
    if (!customIso) {
      throw new Error('Please select a custom expiration date and time.');
    }
    const customDate = new Date(customIso);
    if (isNaN(customDate.getTime())) {
      throw new Error('Invalid custom expiration date.');
    }
    if (customDate.getTime() <= Date.now()) {
      throw new Error('Custom expiration date must be in the future.');
    }
    return customDate.toISOString();
  }

  const d = new Date(baseDate.getTime());

  switch (setting) {
    case '1d':
      d.setDate(d.getDate() + 1);
      return d.toISOString();
    case '7d':
      d.setDate(d.getDate() + 7);
      return d.toISOString();
    case '15d':
      d.setDate(d.getDate() + 15);
      return d.toISOString();
    case '1m':
      return addCalendarMonths(d, 1).toISOString();
    case '3m':
      return addCalendarMonths(d, 3).toISOString();
    case '6m':
      return addCalendarMonths(d, 6).toISOString();
    case '1y':
      return addCalendarMonths(d, 12).toISOString();
    default:
      return addCalendarMonths(d, 1).toISOString();
  }
}

/**
 * Formats expiration timestamp for display using the user's local timezone.
 */
export function formatExpirationDisplay(isoString: string | null | undefined): string {
  if (!isoString) {
    return 'Never expires (Permanent)';
  }
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const dateStr = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  let tzAbbr = '';
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart) tzAbbr = ` ${tzPart.value}`;
  } catch {}

  const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${dateStr}, ${timeStr}${tzAbbr ? ` (${tzAbbr.trim()})` : ` [${timeZoneName}]`}`;
}

/**
 * Returns whether a gift is expired based on current timestamp.
 */
export function isGiftExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  if (isNaN(time)) return false;
  return Date.now() > time;
}

/**
 * Human readable remaining time text (e.g. "29 days left", "Expired").
 */
export function getRemainingTimeText(expiresAt: string | null | undefined): string {
  if (!expiresAt) return 'Never expires';
  const time = new Date(expiresAt).getTime();
  if (isNaN(time)) return '';
  const diff = time - Date.now();
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 1) return `${days} days left`;
  if (days === 1) return `1 day, ${hours}h left`;
  if (hours > 0) return `${hours} hours left`;
  if (minutes > 0) return `${minutes} minutes left`;
  return 'Less than a minute left';
}
