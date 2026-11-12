import { addDays, diffDays } from './subscription.js';

export const STAGES = ['Scheduled', 'Preparing', 'Out for delivery', 'Delivered'];
export const CANTEEN_PRICE = 90;

// minutes since midnight at which each stage after "Scheduled" begins
const STARTS = { lunch: [600, 735, 780], dinner: [1080, 1170, 1200] };

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const dayName = (iso) => DAY_NAMES[new Date(`${iso}T00:00:00Z`).getUTCDay()];
export const minutesOf = (date) => date.getHours() * 60 + date.getMinutes();

// Stage index (0-3) of a meal at the given minute of the day.
export const mealStage = (meal, minutes) => STARTS[meal].filter((m) => minutes >= m).length;

export const mealsOf = (sub, plan) => ((plan?.mealsPerDay ?? sub?.mealsPerDay) === 2 ? ['lunch', 'dinner'] : ['lunch']);

// Why nothing is delivered on `date` ('upcoming' | 'ended' | 'skipped' | 'paused' | 'cancelled'), or null on a delivery day.
export function blockedReason(sub, date) {
  if (date < sub.startDate) return 'upcoming';
  if (date > sub.endDate) return 'ended';
  if ((sub.skips ?? []).includes(date)) return 'skipped';
  if (sub.status === 'paused' && date >= (sub.pausedAt ?? sub.startDate)) return 'paused';
  if (sub.status === 'cancelled') return 'cancelled';
  return null;
}

// Past (before today) days that were really delivered, oldest first.
export function deliveredDays(sub, today, from = sub.startDate) {
  const out = [];
  for (let d = from < sub.startDate ? sub.startDate : from; d < today && d <= sub.endDate; d = addDays(d, 1)) {
    if (!blockedReason(sub, d)) out.push(d);
  }
  return out;
}

export function stats(sub, plan, today) {
  const perDay = mealsOf(sub, plan).length;
  const eaten = deliveredDays(sub, today).length * perDay;
  const perMeal = (sub.price ?? plan?.price ?? 0) / (30 * perDay);
  const skipped = (sub.skips ?? []).length;
  return { eaten, skipped, saved: Math.max(0, Math.round(eaten * (CANTEEN_PRICE - perMeal))) };
}

// Month-style grid, Monday first: leading nulls pad the first week.
export function calendarCells(startDate, endDate) {
  const lead = (new Date(`${startDate}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days = Array.from({ length: Math.max(0, diffDays(startDate, endDate) + 1) }, (_, i) => addDays(startDate, i));
  return [...Array(lead).fill(null), ...days];
}

export function reminders(sub, today) {
  if (!sub || sub.status === 'cancelled') return [];
  const out = [];
  const left = diffDays(today, sub.endDate);
  if (left >= 0 && left <= 5) {
    out.push({ id: 'renew', title: `Your plan ends in ${left} day${left === 1 ? '' : 's'}, renew now`, body: 'Pick a plan to keep your tiffins coming.', to: '/plans' });
  }
  if ((sub.payments ?? []).some((p) => p.status === 'due')) {
    out.push({ id: 'due', title: 'Payment due', body: 'You have a pending payment.', to: '/billing' });
  }
  if (sub.status === 'paused') {
    out.push({ id: 'paused', title: 'Deliveries are paused', body: 'Resume from your dashboard to get meals again.', to: '/dashboard' });
  }
  return out;
}
