import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isSameYear,
} from "date-fns";

export function getRelativeDateLabel(date: Date): string {
  if (isNaN(date.getTime())) return "Invalid Date";

  const now = new Date();

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  const daysDiff = differenceInDays(now, date);
  const monthsDiff = differenceInMonths(now, date);
  const yearsDiff = differenceInYears(now, date);

  if (daysDiff < 30) {
    return `${daysDiff} days ago`;
  }

  if (monthsDiff === 1 && isSameYear(now, date)) {
    return "Last month";
  }

  if (monthsDiff > 1 && isSameYear(now, date)) {
    return format(date, "MMMM");
  }

  if (yearsDiff === 1) {
    return "Last year";
  }

  return format(date, "MMMM d, yyyy");
}

export function convertTimestampToDate1(timestamp: number): Date {
  return new Date(Math.floor(timestamp));
}

export function convertTimestampToDate2(timestamp: number): Date {
  return new Date(Number.parseInt(timestamp.toString()));
}

export function convertTimestampToDate3(timestamp: number): Date {
  return new Date(Math.trunc(timestamp));
}

export function testTimestampConversion() {
  const timestamp = 1748444511083.51;

  const date1 = convertTimestampToDate1(timestamp);
  const date2 = convertTimestampToDate2(timestamp);
  const date3 = convertTimestampToDate3(timestamp);

  return {
    original: timestamp,
    converted: date3,
    relative: getRelativeDateLabel(date3),
  };
}

export const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

export const formatDateToTodayOrYesterdayOrOnWeekOrMoreThanWeek = (
  date: Date
) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const onWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const moreThanWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
};
