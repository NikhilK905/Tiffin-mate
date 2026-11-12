export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;
export const fmt = (iso) => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
export const avg = (list) => (list.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : null);

const badgeClass = { active: 'badge-veg', paused: 'badge-warn', cancelled: 'badge', open: 'badge-warn', resolved: 'badge-veg' };
export const Badge = ({ status }) => <span className={`${badgeClass[status]} capitalize`}>{status}</span>;

export const Stars = ({ n }) => (
  <span className="whitespace-nowrap text-turmeric-400" aria-label={`${n} out of 5`}>
    {'★'.repeat(n)}<span className="text-stone-300 dark:text-stone-700">{'★'.repeat(5 - n)}</span>
  </span>
);

const tones = {
  brand: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-turmeric-100 text-turmeric-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  stone: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

export const Stat = ({ icon, tone = 'brand', label, value, hint }) => (
  <div className="card flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
    <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl ${tones[tone]}`} aria-hidden="true">{icon}</span>
    <div className="min-w-0">
      <p className="text-sm muted">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs muted">{hint}</p>}
    </div>
  </div>
);

export const Empty = ({ icon, title, hint }) => (
  <div className="py-12 text-center">
    <p className="text-5xl" aria-hidden="true">{icon}</p>
    <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
    {hint && <p className="muted mt-1 text-sm">{hint}</p>}
  </div>
);

// Scrolls sideways on phones; header stays put while the body scrolls; zebra rows.
export function TableCard({ cols, min = '40rem', empty, children }) {
  return (
    <div className="card max-h-[34rem] overflow-auto p-0">
      <table className="w-full text-left text-sm" style={{ minWidth: min }}>
        <thead className="sticky top-0 z-10 bg-stone-100 dark:bg-stone-800">
          <tr>{cols.map((h) => <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-stone-100 dark:[&>tr]:border-stone-800 [&>tr:nth-child(even)]:bg-stone-50 dark:[&>tr:nth-child(even)]:bg-stone-800/30">
          {children}
        </tbody>
      </table>
      {empty}
    </div>
  );
}
export const Td = ({ className = '', ...p }) => <td className={`px-4 py-3 ${className}`} {...p} />;

export const PageHead = ({ eyebrow, title, hint, children }) => (
  <header className="mb-6 flex flex-wrap items-end gap-3">
    <div className="mr-auto">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {hint && <p className="muted mt-1 text-sm">{hint}</p>}
    </div>
    {children}
  </header>
);

// Students only, admin excluded.
export const students = (users) => Object.values(users).filter((u) => u.role !== 'admin');
