export const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// Menu items list two options as "non-veg / veg"; items with one option are the same for everyone.
export const pickDish = (text, diet) => {
  const [first, second] = text.split(' / ');
  return second === undefined || diet === 'nonveg' ? first : second;
};
