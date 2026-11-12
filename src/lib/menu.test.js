import test from 'node:test';
import assert from 'node:assert/strict';
import { countStaples, dietSplit, pickDish } from './menu.js';

test('pickDish splits "non-veg / veg" and capitalizes', () => {
  assert.equal(pickDish('egg curry / mix veg, roti', 'veg'), 'Mix veg, roti');
  assert.equal(pickDish('egg curry / mix veg, roti', 'nonveg'), 'Egg curry');
  assert.equal(pickDish('dal tadka, roti', 'nonveg'), 'Dal tadka, roti');
});

test('dietSplit counts meals with a non-veg option', () => {
  const menu = [{ lunch: 'dal, rice', dinner: 'egg curry / mix veg' }, { lunch: 'chole', dinner: 'paneer' }];
  assert.deepEqual(dietSplit(menu), { vegOnly: 3, nonVeg: 1, total: 4 });
});

test('countStaples counts a meal once per staple', () => {
  const counts = Object.fromEntries(countStaples([{ lunch: 'dal, rice, roti', dinner: 'paneer biryani' }]).map((s) => [s.name, s.count]));
  assert.equal(counts.Dal, 1);
  assert.equal(counts.Rice, 1);
  assert.equal(counts['Biryani / pulao'], 1);
  assert.equal(counts.Paneer, 1);
});
