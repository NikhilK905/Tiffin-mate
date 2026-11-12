import { useSelector } from 'react-redux';
import { avg, fmt, rupees, students } from './shared';

export default function Overview() {
  const users = useSelector((s) => s.auth.users);
  const subs = useSelector((s) => s.subscription.byEmail);
  const plans = useSelector((s) => s.catalog.plans);
  const feedback = useSelector((s) => s.feedback.items);

  const list = students(users);
  const all = list.map((u) => subs[u.email]).filter(Boolean);
  const active = all.filter((x) => x.status === 'active');
  const rating = avg(feedback);
  const cards = [
    ['Students', list.length],
    ['Active', active.length],
    ['Paused', all.filter((x) => x.status === 'paused').length],
    ['Cancelled', all.filter((x) => x.status === 'cancelled').length],
    ['Monthly revenue', rupees(active.reduce((sum, x) => sum + x.price, 0))],
    ['Average rating', rating ? `${rating.toFixed(1)} ★` : '—'],
  ];
  const perPlan = plans.map((p) => ({ name: p.name, n: active.filter((x) => x.planId === p.id).length }));
  const max = Math.max(1, ...perPlan.map((p) => p.n));
  const latest = list.slice(-5).reverse(); // users are stored in signup order

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">Active subscribers per plan</h2>
          <ul className="mt-4 space-y-3">
            {perPlan.map((p) => (
              <li key={p.name} className="text-sm">
                <div className="flex justify-between"><span>{p.name}</span><span className="font-medium">{p.n}</span></div>
                <div className="mt-1 h-3 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div className="h-3 rounded-full bg-orange-500" style={{ width: `${(p.n / max) * 100}%` }} />
                </div>
              </li>
            ))}
            {!perPlan.length && <li className="text-sm text-stone-500">No plans yet.</li>}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold">Latest signups</h2>
          <ul className="mt-4 divide-y divide-stone-100 text-sm dark:divide-stone-800">
            {latest.map((u) => (
              <li key={u.email} className="py-2">
                <span className="font-medium">{u.name}</span> <span className="text-stone-500">{u.email}</span>
                {subs[u.email] && <span className="block text-xs text-stone-500">Starts {fmt(subs[u.email].startDate)}</span>}
              </li>
            ))}
            {!latest.length && <li className="py-2 text-stone-500">No students yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
