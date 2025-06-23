import {
  format,
  formatDistanceToNow,
  differenceInMinutes,
} from "date-fns";

/**
 * Formats a given timestamp to a human-readable date string.
 * - If the time is less than an hour ago, returns relative time (e.g., "5 minutes ago").
 * - Otherwise, returns formatted date (e.g., "Jun 23rd, 2025").
 *
 * @param timestamp - The input date as a string, number, or Date object
 * @returns A formatted date string or "Invalid date" on error
 */
export default function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    console.error("Invalid date value:", timestamp);
    return "Invalid date";
  }

  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);

  if (diffMinutes < 60) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, "MMM do, yyyy");
}
