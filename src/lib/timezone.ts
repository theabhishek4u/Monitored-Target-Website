import { toZonedTime, fromZonedTime } from "date-fns-tz";
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  parseISO,
  isValid,
} from "date-fns";

export const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";

/**
 * Returns the current date in the specified timezone
 */
export function getNowInTimezone(timeZone = DEFAULT_TIMEZONE): Date {
  return toZonedTime(new Date(), timeZone);
}

/**
 * Calculates start and end of Today in UTC based on the application timezone.
 */
export function getTodayBounds(timeZone = DEFAULT_TIMEZONE) {
  const zonedNow = toZonedTime(new Date(), timeZone);
  const zonedStart = startOfDay(zonedNow);
  const zonedEnd = endOfDay(zonedNow);

  return {
    start: fromZonedTime(zonedStart, timeZone),
    end: fromZonedTime(zonedEnd, timeZone),
    zonedDate: zonedNow,
    formattedDate: format(zonedNow, "yyyy-MM-dd"),
    displayDate: format(zonedNow, "dd MMM yyyy"),
  };
}

/**
 * Calculates start and end of Yesterday in UTC based on the application timezone.
 */
export function getYesterdayBounds(timeZone = DEFAULT_TIMEZONE) {
  const zonedNow = toZonedTime(new Date(), timeZone);
  const zonedYesterday = subDays(zonedNow, 1);
  const zonedStart = startOfDay(zonedYesterday);
  const zonedEnd = endOfDay(zonedYesterday);

  return {
    start: fromZonedTime(zonedStart, timeZone),
    end: fromZonedTime(zonedEnd, timeZone),
    zonedDate: zonedYesterday,
    formattedDate: format(zonedYesterday, "yyyy-MM-dd"),
    displayDate: format(zonedYesterday, "dd MMM yyyy"),
  };
}

/**
 * Calculates start of last N days until now in UTC based on application timezone.
 */
export function getLastNDaysBounds(days = 30, timeZone = DEFAULT_TIMEZONE) {
  const zonedNow = toZonedTime(new Date(), timeZone);
  const zonedStart = startOfDay(subDays(zonedNow, days - 1));
  const zonedEnd = endOfDay(zonedNow);

  return {
    start: fromZonedTime(zonedStart, timeZone),
    end: fromZonedTime(zonedEnd, timeZone),
    daysCount: days,
  };
}

/**
 * Formats a Date object or ISO string for UI display in the configured timezone.
 */
export function formatDateInTimezone(
  date: Date | string | number | null | undefined,
  formatPattern = "dd MMM yyyy, hh:mm a",
  timeZone = DEFAULT_TIMEZONE
): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(d)) return "-";
    const zoned = toZonedTime(d, timeZone);
    return format(zoned, formatPattern);
  } catch {
    return "-";
  }
}

/**
 * Formats just the date part (e.g. 23 Aug 2026)
 */
export function formatOnlyDate(
  date: Date | string | number | null | undefined,
  timeZone = DEFAULT_TIMEZONE
): string {
  return formatDateInTimezone(date, "dd MMM yyyy", timeZone);
}
