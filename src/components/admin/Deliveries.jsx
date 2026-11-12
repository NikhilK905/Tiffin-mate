import { useSelector } from 'react-redux';
import { todayISO } from '../../lib/subscription';
import { Th, fmt, students } from './shared';

// Print only the kitchen list, whatever chrome the app wraps around it.
const printCss = `@media print {
  body * { visibility: hidden; }
  #kitchen, #kitchen * { visibility: visible; }
  #kitchen { position: absolute; left: 0; top: 0; width: 100%; }
  #kitchen .card { border: 0; }
  #kitchen .no-print { display: none; }
}`;

const list = (v) => (Array.isArray(v) ? v.join(', ') : v);

export default function Deliveries() {
  const users = useSelector((s) => s.auth.users);
  const subs = useSelector((s) => s.subscription.byEmail);
  const plans = useSelector((s) => s.catalog.plans);
  const today = todayISO();

  const rows = students(users)
    .map((u) => ({ u, sub: subs[u.email] }))
    .filter(({ sub }) => sub && sub.status === 'active' && sub.startDate <= today && today <= sub.endDate && !sub.skips.includes(today))
    .map(({ u, sub }) => ({ u, sub, plan: plans.find((p) => p.id === sub.planId) }));
  const totals = {};
  rows.forEach(({ sub, plan }) => {
    const name = plan?.name ?? sub.planId;
    totals[name] = (totals[name] ?? 0) + 1;
  });

  return (
    <div id="kitchen" className="space-y-6">
      <style>{printCss}</style>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto font-semibold">Deliveries for {fmt(today)} · {rows.length} tiffins</h2>
        <button className="btn-ghost no-print" onClick={() => window.print()}>Print list</button>
      </div>
      <div className="card flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {Object.entries(totals).map(([name, n]) => (
          <span key={name}>{name}: <b>{n}</b></span>
        ))}
        {!rows.length && <span className="text-stone-500">Nothing to deliver today.</span>}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <Th cols={['Student', 'Plan', 'Meals', 'Address', 'Add-ons / preferences']} />
          <tbody>
            {rows.map(({ u, sub, plan }) => (
              <tr key={u.email} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{plan?.name ?? sub.planId}</td>
                <td className="px-3 py-2">{plan?.mealsPerDay === 2 ? 'Lunch + dinner' : 'Lunch'}</td>
                <td className="px-3 py-2">{sub.address}</td>
                <td className="px-3 py-2">
                  {[list(sub.addons), list(sub.preferences)].filter(Boolean).join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
