export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;
export const fmt = (iso) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
export const avg = (list) => (list.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : null);
export const statusStyle = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  open: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export const Badge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[status]}`}>{status}</span>
);

export const Stars = ({ n }) => (
  <span className="text-orange-500" aria-label={`${n} out of 5`}>{'★'.repeat(n)}<span className="text-stone-300 dark:text-stone-700">{'★'.repeat(5 - n)}</span></span>
);

export const Th = ({ cols }) => (
  <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
    <tr>{cols.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
  </thead>
);

// Active students with their subscription, admin excluded.
export const students = (users) => Object.values(users).filter((u) => u.role !== 'admin');
