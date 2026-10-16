/**
 * Date formatting service.
 * Uses Madagascar local time (Indian/Antananarivo, UTC+3).
 * All dates are stored in ISO 8601 format in SQLite.
 */

/**
 * Get the current date/time in Madagascar (UTC+3) as an ISO 8601 string.
 * Example: "2024-01-15T14:30:00.000Z"
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Get the current date in Madagascar as "YYYY-MM-DD".
 */
export function todayDate(): string {
  return toMadagascarDate(new Date());
}

/**
 * Convert a Date to Madagascar local date string "YYYY-MM-DD".
 */
export function toMadagascarDate(date: Date): string {
  // Madagascar is UTC+3, no DST
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const d = String(mg.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convert a Date to Madagascar local datetime string "YYYY-MM-DD HH:mm".
 */
export function toMadagascarDateTime(date: Date): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const d = String(mg.getDate()).padStart(2, '0');
  const hh = String(mg.getHours()).padStart(2, '0');
  const mm = String(mg.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

/**
 * Format a date string for display: "15 janv. 2024"
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];
  const mg = toMadagascarDate(date);
  const [y, m, d] = mg.split('-');
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

/**
 * Format a datetime string for display: "15 janv. 2024 14:30"
 */
export function formatDateTimeDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];
  const mg = toMadagascarDateTime(date);
  const [datePart, timePart] = mg.split(' ');
  const [y, m, d] = datePart.split('-');
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y} ${timePart}`;
}

/**
 * Format a date string for input fields: "2024-01-15"
 */
export function formatDateInput(dateStr: string): string {
  return toMadagascarDate(new Date(dateStr));
}

/**
 * Get the start of today (00:00:00) in Madagascar as ISO string.
 * Utilise l'heure locale (UTC+3) pour inclure les ventes dès minuit locale.
 */
export function startOfTodayISO(): string {
  const today = todayDate();
  return new Date(`${today}T00:00:00`).toISOString();
}

/**
 * Get the end of today (23:59:59) in Madagascar as ISO string.
 * Utilise l'heure locale (UTC+3) pour inclure les ventes jusqu'à 23:59:59 locale.
 */
export function endOfTodayISO(): string {
  const today = todayDate();
  return new Date(`${today}T23:59:59.999`).toISOString();
}

/**
 * Get the start of yesterday in Madagascar as ISO string (heure locale).
 */
export function startOfYesterdayISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  mg.setDate(mg.getDate() - 1);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const day = String(mg.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${day}T00:00:00`).toISOString();
}

/**
 * Get the end of yesterday in Madagascar as ISO string (heure locale).
 */
export function endOfYesterdayISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  mg.setDate(mg.getDate() - 1);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const day = String(mg.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${day}T23:59:59.999`).toISOString();
}

/**
 * Get ISO date string N days ago at 00:00:00 (heure locale).
 */
export function daysAgoISO(n: number): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  mg.setDate(mg.getDate() - n);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const day = String(mg.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${day}T00:00:00`).toISOString();
}

/**
 * Get the start of the current week (Monday) in Madagascar (heure locale).
 */
export function startOfWeekISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const day = mg.getDay(); // 0 = Sunday
  const diff = mg.getDate() - day + (day === 0 ? -6 : 1); // Monday
  mg.setDate(diff);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  const dayStr = String(mg.getDate()).padStart(2, '0');
  return new Date(`${y}-${m}-${dayStr}T00:00:00`).toISOString();
}

/**
 * Get the start of the current month in Madagascar (heure locale).
 */
export function startOfMonthISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const y = mg.getFullYear();
  const m = String(mg.getMonth() + 1).padStart(2, '0');
  return new Date(`${y}-${m}-01T00:00:00`).toISOString();
}

/**
 * Get the start of the current quarter in Madagascar (heure locale).
 */
export function startOfQuarterISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const q = Math.floor(mg.getMonth() / 3) * 3 + 1;
  const y = mg.getFullYear();
  const m = String(q).padStart(2, '0');
  return new Date(`${y}-${m}-01T00:00:00`).toISOString();
}

/**
 * Get the start of the current year in Madagascar (heure locale).
 */
export function startOfYearISO(): string {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const mg = new Date(utc + 3 * 3600000);
  const y = mg.getFullYear();
  return new Date(`${y}-01-01T00:00:00`).toISOString();
}

/**
 * Get the end of the current period (now) in Madagascar as ISO string.
 */
export function endOfPeriodISO(): string {
  return nowISO();
}
