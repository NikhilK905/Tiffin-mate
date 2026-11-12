import { useSelector } from 'react-redux';
import { Stars, Th, avg, fmt } from './shared';

export default function Feedback() {
  const items = useSelector((s) => s.feedback.items);
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cards = [
    ['Overall', items],
    ['Lunch', items.filter((f) => f.meal === 'lunch')],
    ['Dinner', items.filter((f) => f.meal === 'dinner')],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {cards.map(([label, list]) => (
          <div key={label} className="card">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{list.length ? `${avg(list).toFixed(1)} ★` : '—'}</p>
            <p className="text-xs text-stone-500">{list.length} ratings</p>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <Th cols={['Date', 'Student', 'Meal', 'Rating', 'Comment']} />
          <tbody>
            {sorted.map((f) => (
              <tr key={f.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                <td className="px-3 py-2">{fmt(f.date)}</td>
                <td className="px-3 py-2">{f.name}</td>
                <td className="px-3 py-2 capitalize">{f.meal}</td>
                <td className="px-3 py-2"><Stars n={f.rating} /></td>
                <td className="px-3 py-2">{f.comment || '—'}</td>
              </tr>
            ))}
            {!sorted.length && <tr><td colSpan={5} className="px-3 py-6 text-center text-stone-500">No ratings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
