export const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Menu items list two options as "non-veg / veg"; items with one option are the same for everyone.
export const hasNonVegOption = (text) => text.includes(' / ');

export const pickDish = (text, diet) => {
  const [first, second] = text.split(' / ');
  return capitalize(second === undefined || diet === 'nonveg' ? first : second);
};

// Staples counted by keyword over every meal (a meal counts once per staple, whichever option mentions it).
const STAPLES = [
  ['Roti', /roti|poori/i],
  ['Rice', /rice|chawal/i],
  ['Dal', /dal|sambar|kadhi/i],
  ['Sabzi', /sabzi|aloo|gobi|bhindi|poriyal|mix veg|kofta/i],
  ['Paneer', /paneer/i],
  ['Biryani / pulao', /biryani|pulao/i],
  ['Egg / chicken', /egg|chicken/i],
];

export const mealsOf = (menu) => menu.flatMap((m) => [m.lunch, m.dinner]);

export const countStaples = (menu) => {
  const meals = mealsOf(menu);
  return STAPLES.map(([name, re]) => ({ name, count: meals.filter((t) => re.test(t)).length })).sort((a, b) => b.count - a.count);
};

export const dietSplit = (menu) => {
  const meals = mealsOf(menu);
  const nonVeg = meals.filter(hasNonVegOption).length;
  return { vegOnly: meals.length - nonVeg, nonVeg, total: meals.length };
};
