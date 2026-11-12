import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, createSubscription, toggleSkip, pause, resume, mealsLeft } from './subscription.js';

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
