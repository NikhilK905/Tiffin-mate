import { useSelector } from 'react-redux';
import { Empty, PageHead, Stat, avg, fmt, rupees, students } from './shared';

export default function Overview() {
  const users = useSelector((s) => s.auth.users);
  const subs = useSelector((s) => s.subscription.byEmail);
  const plans = useSelector((s) => s.catalog.plans);
  const feedback = useSelector((s) => s.feedback.items);

  const list = students(users);
  const all = list.map((u) => subs[u.email]).filter(Boolean);
  const active = all.filter((x) => x.status === 'active');
  const rating = avg(feedback);
  const perPlan = plans.map((p) => ({ name: p.name, n: active.filter((x) => x.planId === p.id).length }));
  const max = Math.max(1, ...perPlan.map((p) => p.n));
  const latest = list.slice(-5).reverse(); // users are stored in signup order

  return (
    <div>
      <PageHead eyebrow="Overview" title="How DabbaDost is doing" hint="Live numbers from every student account." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <Stat icon="🎓" tone="brand" label="Students" value={list.length} />
        <Stat icon="✅" tone="green" label="Active" value={active.length} />
        <Stat icon="⏸️" tone="yellow" label="Paused" value={all.filter((x) => x.status === 'paused').length} />
        <Stat icon="🚫" tone="stone" label="Cancelled" value={all.filter((x) => x.status === 'cancelled').length} />
        <Stat icon="💰" tone="brand" label="Monthly revenue" value={rupees(active.reduce((sum, x) => sum + x.price, 0))} hint="From active plans" />
        <Stat icon="⭐" tone="yellow" label="Average rating" value={rating ? rating.toFixed(1) : '—'} hint={`${feedback.length} rating${feedback.length === 1 ? '' : 's'}`} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="font-display text-xl font-semibold">Active subscribers per plan</h3>
          <ul className="mt-4 space-y-4">
            {perPlan.map((p) => (
              <li key={p.name} className="text-sm">
                <div className="flex justify-between"><span>{p.name}</span><b>{p.n}</b></div>
                <div className="mt-1.5 h-3 rounded-full bg-stone-100 dark:bg-stone-800">
                  <div className="h-3 rounded-full bg-orange-600 transition-all" style={{ width: `${(p.n / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          {!perPlan.length && <Empty icon="📋" title="No plans yet" hint="Add one in the Plans section." />}
        </div>
        <div className="card p-5">
          <h3 className="font-display text-xl font-semibold">Latest signups</h3>
          <ul className="mt-2 divide-y divide-stone-100 dark:divide-stone-800">
            {latest.map((u) => (
              <li key={u.email} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-100 font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {u.name[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 text-sm">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="muted truncate text-xs">{u.email}</p>
                </div>
                <span className="muted ml-auto shrink-0 text-xs">{subs[u.email] ? `Starts ${fmt(subs[u.email].startDate)}` : 'No plan'}</span>
              </li>
            ))}
          </ul>
          {!latest.length && <Empty icon="🎓" title="No students yet" />}
        </div>
      </div>
    </div>
  );
}
