import test from 'node:test';
import assert from 'node:assert/strict';
import { blockedReason, calendarCells, dayName, deliveredDays, mealStage, reminders, stats } from './tracking.js';

const sub = { startDate: '2026-11-02', endDate: '2026-12-01', skips: ['2026-11-04'], status: 'active', price: 3000 };

test('meal stages follow the clock', () => {
  assert.equal(mealStage('lunch', 599), 0);
  assert.equal(mealStage('lunch', 600), 1);
  assert.equal(mealStage('lunch', 735), 2);
  assert.equal(mealStage('lunch', 780), 3);
  assert.equal(mealStage('dinner', 1100), 1);
  assert.equal(mealStage('dinner', 1200), 3);
});

test('dayName and blocked reasons', () => {
  assert.equal(dayName('2026-11-12'), 'Thursday');
  assert.equal(blockedReason(sub, '2026-11-01'), 'upcoming');
  assert.equal(blockedReason(sub, '2026-11-04'), 'skipped');
  assert.equal(blockedReason(sub, '2026-11-05'), null);
  assert.equal(blockedReason({ ...sub, status: 'paused', pausedAt: '2026-11-06' }, '2026-11-07'), 'paused');
});

test('delivered days exclude skips and today', () => {
  assert.deepEqual(deliveredDays(sub, '2026-11-06'), ['2026-11-02', '2026-11-03', '2026-11-05']);
});

test('stats: savings vs canteen', () => {
  // 3 days x 1 meal at 3000/30 = 100? plan price per meal is 100 > 90, savings clamp to 0
  assert.equal(stats(sub, { mealsPerDay: 1 }, '2026-11-06').saved, 0);
  const s = stats({ ...sub, price: 1800 }, { mealsPerDay: 1 }, '2026-11-06'); // 60/meal
  assert.deepEqual(s, { eaten: 3, skipped: 1, saved: 90 });
});

test('calendar pads to Monday', () => {
  const c = calendarCells('2026-11-04', '2026-11-06'); // Wednesday
  assert.equal(c.length, 5);
  assert.equal(c[1], null);
  assert.equal(c[2], '2026-11-04');
});

test('reminders', () => {
  assert.equal(reminders(sub, '2026-11-12').length, 0);
  const r = reminders({ ...sub, status: 'paused', payments: [{ status: 'due' }] }, '2026-11-28');
  assert.deepEqual(r.map((x) => x.id), ['renew', 'due', 'paused']);
  assert.match(r[0].title, /ends in 3 days/);
});
