// Every photo URL lives here. All were checked with curl (HTTP 200) and eyeballed.
const u = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

export const images = {
  hero: { src: u('1546833999-b9f581a1996d', 1000), alt: 'A steel thali with roti, dal and vegetable curries' },
  kitchen: { src: u('1567188040759-fb8a883dc6d8', 900), alt: 'Paneer tikka sizzling on a home kitchen skillet' },
  menu: { src: u('1668236543090-82eba5ee5976', 900), alt: 'A dosa served with chutneys on a teal plate' },
  thali: { src: u('1626777552726-4a6b54c97e46', 800), alt: 'Overhead view of a thali with rice, roti and small bowls of curries' },
};

// Plan header photos by plan id; `planFallback` is used for plans the admin adds later.
export const planImages = {
  basic: { src: u('1585937421612-70a008356fbe'), alt: 'Vegetable curries with a bowl of rice' },
  ghar: { src: u('1626777552726-4a6b54c97e46'), alt: 'A full thali with rice, roti and small bowls of curries' },
  protein: { src: u('1565557623262-b51c2513a641'), alt: 'Butter chicken with naan' },
};
export const planFallback = { src: u('1631452180519-c014fe946bc7'), alt: 'A copper bowl of creamy curry' };
