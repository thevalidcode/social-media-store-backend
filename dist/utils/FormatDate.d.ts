/**
 * Formats a given timestamp to a human-readable date string.
 * - If the time is less than an hour ago, returns relative time (e.g., "5 minutes ago").
 * - Otherwise, returns formatted date (e.g., "Jun 23rd, 2025").
 *
 * @param timestamp - The input date as a string, number, or Date object
 * @returns A formatted date string or "Invalid date" on error
 */
export default function formatDate(timestamp: string | number | Date): string;
