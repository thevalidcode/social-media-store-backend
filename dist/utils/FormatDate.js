"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = formatDate;
const date_fns_1 = require("date-fns");
/**
 * Formats a given timestamp to a human-readable date string.
 * - If the time is less than an hour ago, returns relative time (e.g., "5 minutes ago").
 * - Otherwise, returns formatted date (e.g., "Jun 23rd, 2025").
 *
 * @param timestamp - The input date as a string, number, or Date object
 * @returns A formatted date string or "Invalid date" on error
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        console.error("Invalid date value:", timestamp);
        return "Invalid date";
    }
    const now = new Date();
    const diffMinutes = (0, date_fns_1.differenceInMinutes)(now, date);
    if (diffMinutes < 60) {
        return (0, date_fns_1.formatDistanceToNow)(date, { addSuffix: true });
    }
    return (0, date_fns_1.format)(date, "MMM do, yyyy");
}
