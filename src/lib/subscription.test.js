import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, createSubscription, toggleSkip, pause, resume, mealsLeft, quote, markPaid, withDefaults, canRenew, renew } from './subscription.js';

const plan = { id: 'ghar', price: 3499 };
const today = '2026-03-28';

test('30-day cycle, skips extend it, DST-safe', () => {
  assert.equal(addDays('2026-03-28', 2), '2026-03-30');
  assert.throws(() => createSubscription({ plan, startDate: today, address: 'Hostel 4', today }));

  let sub = createSubscription({ plan, startDate: '2026-04-01', address: ' Hostel 4 ', today });
  assert.equal(sub.endDate, '2026-04-30');
  assert.equal(sub.address, 'Hostel 4');
  assert.equal(mealsLeft(sub, today), 30);

  sub = toggleSkip(sub, '2026-04-05', today);
  assert.equal(sub.endDate, '2026-05-01');
  assert.equal(mealsLeft(sub, today), 30);
  assert.throws(() => toggleSkip(sub, today, today));
  assert.throws(() => toggleSkip(sub, '2026-06-01', today));

  sub = toggleSkip(sub, '2026-04-05', today);
  assert.deepEqual(sub.skips, []);
  assert.equal(sub.endDate, '2026-04-30');
});

test('pause before start adds nothing, pause mid-cycle adds paused days', () => {
  const sub = createSubscription({ plan, startDate: '2026-04-01', address: 'Hostel 4', today });
  assert.equal(resume(pause(sub, today), '2026-03-30').endDate, '2026-04-30');
  assert.equal(resume(pause(sub, '2026-04-10'), '2026-04-15').endDate, '2026-05-05');
  assert.throws(() => resume(sub, today));
});

const ghar = { id: 'ghar', name: 'Ghar Ka Khana', price: 3499 };

test('quote: add-ons and coupons', () => {
  let q = quote({ plan: ghar, addons: ['roti', 'fruit'] });
  assert.equal(q.total, 3499 + 299 + 399);
  assert.equal(quote({ plan: ghar, coupon: ' student10 ' }).total, 3499 - 350);
  q = quote({ plan: ghar, addons: ['curd'], coupon: 'FIRST100' });
  assert.equal(q.total, 3499 + 199 - 100);
  assert.equal(q.lines.at(-1).amount, -100);
  assert.throws(() => quote({ plan: ghar, coupon: 'NOPE' }), /Invalid coupon/);
});

test('payments: upi paid, cash due, markPaid, old subs default', () => {
  const mk = (method) =>
    createSubscription({ plan: ghar, startDate: '2026-04-01', address: 'H4', today, addons: ['sweet'], phone: ' 98 ', method });
  const upi = mk('upi');
  assert.equal(upi.total, 3748);
  assert.equal(upi.phone, '98');
  assert.deepEqual(upi.payments[0], { id: 'pay-1', period: { from: '2026-04-01', to: '2026-04-30' }, amount: 3748, method: 'upi', status: 'paid', paidAt: today });

  const cash = mk('cash');
  assert.equal(cash.payments[0].status, 'due');
  const done = markPaid(cash, 'pay-1', '2026-04-02');
  assert.equal(done.payments[0].paidAt, '2026-04-02');
  assert.throws(() => markPaid(done, 'pay-1', today), /Already/);
  assert.throws(() => markPaid(done, 'x', today));

  const old = { planId: 'ghar', price: 3499, startDate: '2026-04-01', endDate: '2026-04-30', address: 'H4', status: 'active', pausedAt: null, skips: [] };
  const d = withDefaults(old);
  assert.deepEqual([d.addons, d.total, d.preferences.spice, d.payments.length, d.payments[0].status], [[], 3499, 'medium', 1, 'due']);
});

test('renew: only in the last 7 days, appends payment and extends 30 days', () => {
  const sub = createSubscription({ plan: ghar, startDate: '2026-04-01', address: 'H4', today, addons: ['roti'], coupon: 'FIRST100', method: 'upi' });
  assert.equal(canRenew(sub, '2026-04-10'), false);
  assert.throws(() => renew(sub, '2026-04-10'));
  const r = renew(sub, '2026-04-25', 'cash');
  assert.equal(r.endDate, '2026-05-30');
  assert.equal(r.payments.length, 2);
  assert.deepEqual(r.payments[1], { id: 'pay-2', period: { from: '2026-05-01', to: '2026-05-30' }, amount: 3798, method: 'cash', status: 'due', paidAt: null });
  assert.equal(canRenew({ ...sub, status: 'cancelled' }, '2026-04-25'), false);
  assert.equal(canRenew(pause(sub, '2026-04-20'), '2026-04-25'), true);
});
