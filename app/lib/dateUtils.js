/**
 * Date utilities for the job hours tracker.
 * All dates are handled as YYYY-MM-DD strings to avoid timezone issues.
 */

/**
 * Format a date as YYYY-MM-DD string (timezone-safe).
 */
export function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get the number of days in a given month.
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week (0=Mon, 6=Sun) for the first day of a month.
 */
export function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay();
  // Convert from Sun=0 to Mon=0
  return day === 0 ? 6 : day - 1;
}

/**
 * Check if a date falls on a weekend (Saturday or Sunday).
 */
export function isWeekend(year, month, day) {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

/**
 * Calculate the number of working days in a month.
 * @param {number} year 
 * @param {number} month - 0-indexed
 * @param {boolean} includeWeekends - if true, all days are working days
 * @param {string[]} holidays - array of YYYY-MM-DD strings to exclude
 */
export function getWorkingDays(year, month, includeWeekends = false, holidays = []) {
  const daysInMonth = getDaysInMonth(year, month);
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toDateString(year, month, day);
    if (holidays.includes(dateStr)) continue;
    if (includeWeekends || !isWeekend(year, month, day)) {
      count++;
    }
  }
  return count;
}

/**
 * Get month name.
 */
export function getMonthName(month) {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return names[month];
}

/**
 * Get short day names starting from Monday.
 */
export function getDayNames() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

/**
 * Format a number to avoid floating point display issues.
 * Shows up to 2 decimal places, but strips trailing zeros.
 */
export function formatHours(value) {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  // Round to 2 decimal places to avoid floating point artifacts
  const rounded = Math.round(num * 100) / 100;
  return rounded.toString();
}

/**
 * Format decimal hours into "Xh Ym" (e.g. 7.5 -> 7h 30m).
 * If 0 minutes, just returns "Xh".
 */
export function formatHoursMinutes(value) {
  if (value === null || value === undefined) return '0h';
  const num = Number(value);
  if (isNaN(num)) return '0h';
  
  const hours = Math.floor(num);
  const decimalPart = num - hours;
  const minutes = Math.round(decimalPart * 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  if (minutes === 60) {
    return `${hours + 1}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Format percentage to 1 decimal place.
 */
export function formatPercent(value) {
  if (!isFinite(value)) return '0';
  return (Math.round(value * 10) / 10).toString();
}

/**
 * Check if a given date string is today.
 */
export function isToday(dateStr) {
  const now = new Date();
  const todayStr = toDateString(now.getFullYear(), now.getMonth(), now.getDate());
  return dateStr === todayStr;
}

/**
 * Check if a date is in the past (before today).
 */
export function isPast(dateStr) {
  const now = new Date();
  const todayStr = toDateString(now.getFullYear(), now.getMonth(), now.getDate());
  return dateStr < todayStr;
}
