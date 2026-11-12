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

export const ADDONS = [
  { id: 'roti', name: 'Extra roti', price: 299 },
  { id: 'curd', name: 'Curd / raita', price: 199 },
  { id: 'sweet', name: 'Sunday sweet', price: 249 },
  { id: 'fruit', name: 'Fruit bowl', price: 399 },
];
export const PAYMENT_METHODS = { upi: 'UPI', card: 'Card', cash: 'Cash on first delivery' };
export const DEFAULT_PREFS = { spice: 'medium', jain: false, notes: '' };
const COUPONS = { STUDENT10: (sub) => Math.round(sub * 0.1), FIRST100: (sub) => Math.min(100, sub) };

// Line items + total for a plan, add-on ids and an optional coupon code. Throws on an unknown coupon.
export function quote({ plan, addons = [], coupon = null }) {
  const picked = ADDONS.filter((a) => addons.includes(a.id));
  const subtotal = plan.price + picked.reduce((n, a) => n + a.price, 0);
  const code = coupon?.trim().toUpperCase() || null;
  if (code && !COUPONS[code]) throw new Error('Invalid coupon code');
  const discount = code ? COUPONS[code](subtotal) : 0;
  const lines = [{ label: plan.name ?? plan.id, amount: plan.price }, ...picked.map((a) => ({ label: a.name, amount: a.price }))];
  if (discount) lines.push({ label: `Coupon ${code}`, amount: -discount });
  return { lines, subtotal, discount, total: subtotal - discount, coupon: code };
}

// Cash is collected later, so it starts as due; UPI/card are demo-paid immediately.
const newPayment = (id, from, to, amount, method, today) => ({
  id,
  period: { from, to },
  amount,
  method,
  status: method === 'cash' ? 'due' : 'paid',
  paidAt: method === 'cash' ? null : today,
});

// Old saved subscriptions may lack the newer fields.
export const withDefaults = (sub) => ({
  addons: [],
  phone: '',
  coupon: null,
  total: sub.price,
  ...sub,
  preferences: { ...DEFAULT_PREFS, ...sub.preferences },
  payments: sub.payments ?? [newPayment('pay-1', sub.startDate, sub.endDate, sub.price, 'cash', null)],
});

export function createSubscription({ plan, startDate, address, today, addons = [], preferences, phone = '', coupon = null, method = 'cash' }) {
  if (startDate <= today) throw new Error('Start date must be tomorrow or later');
  if (!address.trim()) throw new Error('Delivery address is required');
  if (!PAYMENT_METHODS[method]) throw new Error('Choose a payment method');
  const q = quote({ plan, addons, coupon });
  const endDate = addDays(startDate, DAYS_PER_CYCLE - 1);
  return {
    planId: plan.id,
    price: plan.price,
    startDate,
    endDate,
    address: address.trim(),
    status: 'active',
    pausedAt: null,
    skips: [],
    addons: [...addons],
    preferences: { ...DEFAULT_PREFS, ...preferences },
    phone: phone.trim(),
    coupon: q.coupon,
    total: q.total,
    payments: [newPayment('pay-1', startDate, endDate, q.total, method, today)],
  };
}

export function markPaid(sub, paymentId, today) {
  const { payments } = withDefaults(sub);
  const p = payments.find((x) => x.id === paymentId);
  if (!p) throw new Error('Payment not found');
  if (p.status === 'paid') throw new Error('Already paid');
  return { ...withDefaults(sub), payments: payments.map((x) => (x === p ? { ...x, status: 'paid', paidAt: today } : x)) };
}

// Renewal is only offered in the last 7 days of a live (active/paused) cycle, so nobody stacks months by accident.
export const RENEW_WINDOW_DAYS = 7;
export const canRenew = (sub, today) =>
  ['active', 'paused'].includes(sub.status) && diffDays(today, sub.endDate) <= RENEW_WINDOW_DAYS;

// Next month bills the plan + add-ons at full price (coupons are one-time).
export function renew(sub, today, method = 'upi') {
  if (!canRenew(sub, today)) throw new Error(`Renewal opens ${RENEW_WINDOW_DAYS} days before your plan ends`);
  if (!PAYMENT_METHODS[method]) throw new Error('Choose a payment method');
  const s = withDefaults(sub);
  const amount = quote({ plan: { id: s.planId, price: s.price }, addons: s.addons }).total;
  const from = addDays(s.endDate, 1);
  const endDate = addDays(s.endDate, DAYS_PER_CYCLE);
  return { ...s, endDate, payments: [...s.payments, newPayment(`pay-${s.payments.length + 1}`, from, endDate, amount, method, today)] };
}

// Skipping a future delivery day pushes the end date out by one, so no paid meal is lost.
export function toggleSkip(sub, date, today) {
  if (sub.status !== 'active') throw new Error('Only active subscriptions can skip days');
  if (date <= today) throw new Error('You can only skip from tomorrow onwards');
  if ((sub.skips ?? []).includes(date)) {
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
