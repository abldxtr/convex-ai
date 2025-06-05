// import {
//   format,
//   isToday,
//   isYesterday,
//   differenceInDays,
//   differenceInMonths,
//   differenceInYears,
//   isSameYear,
// } from "date-fns";

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
  console.log({ date: date.getTime() });

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

// راه‌حل 1: استفاده از Math.floor برای حذف اعشار
export function convertTimestampToDate1(timestamp: number): Date {
  return new Date(Math.floor(timestamp));
}

// راه‌حل 2: استفاده از parseInt
export function convertTimestampToDate2(timestamp: number): Date {
  return new Date(Number.parseInt(timestamp.toString()));
}

// راه‌حل 3: استفاده از Math.trunc (بهترین روش)
export function convertTimestampToDate3(timestamp: number): Date {
  return new Date(Math.trunc(timestamp));
}

// تست کردن timestamp شما
export function testTimestampConversion() {
  const timestamp = 1748444511083.51;

  console.log("Original timestamp:", timestamp);

  // روش‌های مختلف تبدیل
  const date1 = convertTimestampToDate1(timestamp);
  const date2 = convertTimestampToDate2(timestamp);
  const date3 = convertTimestampToDate3(timestamp);

  console.log("Method 1 (Math.floor):", date1.toString());
  console.log("Method 2 (parseInt):", date2.toString());
  console.log("Method 3 (Math.trunc):", date3.toString());

  // تست relative date
  console.log("Relative date:", getRelativeDateLabel(date3));

  return {
    original: timestamp,
    converted: date3,
    relative: getRelativeDateLabel(date3),
  };
}

// export function getRelativeDateLabel(date: Date): string {
//   //   console.log({ date });
//   //   console.log({ date: date.getTime() });

//   if (isNaN(date.getTime())) return "Invalid Date";

//   const now = new Date();

//   if (isToday(date)) return "Today";
//   if (isYesterday(date)) return "Yesterday";

//   const daysDiff = differenceInDays(now, date);
//   const monthsDiff = differenceInMonths(now, date);
//   const yearsDiff = differenceInYears(now, date);

//   if (daysDiff < 30) {
//     return `${daysDiff} days ago`;
//   }

//   if (monthsDiff === 1 && isSameYear(now, date)) {
//     return "Last month";
//   }

//   if (monthsDiff > 1 && isSameYear(now, date)) {
//     return format(date, "MMMM"); // Example: February
//   }

//   if (yearsDiff === 1) {
//     return "Last year";
//   }

//   return format(date, "MMMM d, yyyy"); // Example: March 5, 2022
// }

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

// convert date to today or yesterday or on week ago or more than week ago
export const formatDateToTodayOrYesterdayOrOnWeekOrMoreThanWeek = (
  date: Date
) => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const onWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const moreThanWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
};

// export const getRelativeDateLabel = (inputDate: Date): string => {
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const input = new Date(
//     inputDate.getFullYear(),
//     inputDate.getMonth(),
//     inputDate.getDate()
//   );

//   const diffInMs = today.getTime() - input.getTime();
//   const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

//   if (diffInDays === 0) {
//     return "امروز";
//   } else if (diffInDays === 1) {
//     return "دیروز";
//   } else if (diffInDays <= 7) {
//     return "هفته قبل";
//   } else if (
//     now.getMonth() - inputDate.getMonth() === 1 &&
//     now.getFullYear() === inputDate.getFullYear()
//   ) {
//     return "ماه قبل";
//   } else {
//     // تاریخ دقیق به صورت شمسی یا میلادی (بسته به نیاز تو می‌تونم شمسی هم برگردونم)
//     return inputDate.toLocaleDateString("fa-IR");
//   }
// };

// export const getRelativeDateLabel = (inputDate: Date): string => {
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const input = new Date(
//     inputDate.getFullYear(),
//     inputDate.getMonth(),
//     inputDate.getDate()
//   );

//   const diffInMs = today.getTime() - input.getTime();
//   const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

//   if (diffInDays === 0) return "امروز";
//   if (diffInDays === 1) return "دیروز";
//   if (diffInDays <= 7) return "هفته قبل";

//   const currentYear = now.getFullYear();
//   const inputYear = inputDate.getFullYear();
//   const currentMonth = now.getMonth();
//   const inputMonth = inputDate.getMonth();

//   if (currentYear === inputYear && currentMonth - inputMonth === 1) {
//     return "ماه قبل";
//   }

//   if (currentYear === inputYear) {
//     // نمایش نام ماه به فارسی
//     return inputDate.toLocaleDateString("fa-IR", { month: "long" });
//   }

//   // نمایش سال (شمسی)
//   return inputDate.toLocaleDateString("fa-IR", { year: "numeric" });
// };
