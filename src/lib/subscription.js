// Dates are 'YYYY-MM-DD' strings; math runs in UTC so DST never shifts a day.
export const DAYS_PER_CYCLE = 30;

export const todayISO = () => new Date().toLocaleDateString('en-CA');

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const diffDays = (from, to) =>
  Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86_400_000);

export function createSubscription({ plan, startDate, address, today }) {
  if (startDate <= today) throw new Error('Start date must be tomorrow or later');
  if (!address.trim()) throw new Error('Delivery address is required');
  return {
    planId: plan.id,
    price: plan.price,
    startDate,
    endDate: addDays(startDate, DAYS_PER_CYCLE - 1),
    address: address.trim(),
    status: 'active',
    pausedAt: null,
    skips: [],
  };
}

// Skipping a future delivery day pushes the end date out by one, so no paid meal is lost.
export function toggleSkip(sub, date, today) {
  if (sub.status !== 'active') throw new Error('Only active subscriptions can skip days');
  if (date <= today) throw new Error('You can only skip from tomorrow onwards');
  if (sub.skips.includes(date)) {
    return { ...sub, skips: sub.skips.filter((d) => d !== date), endDate: addDays(sub.endDate, -1) };
  }
  if (date < sub.startDate || date > sub.endDate) throw new Error('That date is outside your subscription');
  return { ...sub, skips: [...sub.skips, date].sort(), endDate: addDays(sub.endDate, 1) };
}

export function pause(sub, today) {
  if (sub.status !== 'active') throw new Error('Subscription is not active');
  return { ...sub, status: 'paused', pausedAt: today };
}

// Days spent paused (counted from the later of pause date and start date) are added back.
export function resume(sub, today) {
  if (sub.status !== 'paused') throw new Error('Subscription is not paused');
  const from = sub.pausedAt > sub.startDate ? sub.pausedAt : sub.startDate;
  const lost = Math.max(0, diffDays(from, today));
  return { ...sub, status: 'active', pausedAt: null, endDate: addDays(sub.endDate, lost) };
}

export function mealsLeft(sub, today) {
  const from = sub.startDate > today ? sub.startDate : addDays(today, 1);
  if (from > sub.endDate) return 0;
  const days = diffDays(from, sub.endDate) + 1;
  return days - sub.skips.filter((d) => d >= from).length;
}
