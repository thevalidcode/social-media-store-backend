import { 
  format,
  formatDistanceToNow,
  differenceInMinutes,
 } from 'date-fns';

export default function formatDate(timestamp) ;{
  const date = new Date(timestamp);
  if (isNaN(date)) {
    console.error("Invalid date value:", timestamp);
    return "Invalid date";
  }

  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  if (diffMinutes < 60) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM do, yyyy");
};
