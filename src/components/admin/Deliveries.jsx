import { useSelector } from 'react-redux';
import { ADDONS, todayISO } from '../../lib/subscription';
import { Empty, PageHead, TableCard, Td, fmt, students } from './shared';

// Print only the kitchen list, whatever chrome the app wraps around it.
const printCss = `@media print {
  body * { visibility: hidden; }
  #kitchen, #kitchen * { visibility: visible; }
  #kitchen { position: absolute; left: 0; top: 0; width: 100%; }
  #kitchen .card { border: 0; box-shadow: none; max-height: none; }
  #kitchen .no-print { display: none; }
}`;

// Add-on ids → names; preferences object → "Hot spice · Jain · <notes>". Old subs may store strings.
const addonNames = (v) => (Array.isArray(v) ? v.map((id) => ADDONS.find((a) => a.id === id)?.name ?? id).join(', ') : v);
const prefText = (p) =>
  p && typeof p === 'object'
    ? [p.spice && `${p.spice[0].toUpperCase()}${p.spice.slice(1)} spice`, p.jain && 'Jain', p.notes].filter(Boolean).join(' · ')
    : p;

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
    <div id="kitchen">
      <style>{printCss}</style>
      <PageHead eyebrow="Kitchen list" title={`Deliveries for ${fmt(today)}`} hint={`${rows.length} tiffins going out today.`}>
        <button className="btn-primary no-print" onClick={() => window.print()}>🖨️ Print list</button>
      </PageHead>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(totals).map(([name, n]) => (
          <span key={name} className="badge-brand px-3 py-1 text-sm">{name}: {n}</span>
        ))}
      </div>
      <TableCard
        cols={['Student', 'Plan', 'Meals', 'Address', 'Add-ons / preferences']}
        min="46rem"
        empty={!rows.length && <Empty icon="🍽️" title="Nothing to deliver today" hint="Active subscriptions that start today or earlier, and aren't skipped, show up here." />}
      >
        {rows.map(({ u, sub, plan }) => (
          <tr key={u.email}>
            <Td className="font-medium">{u.name}</Td>
            <Td>{plan?.name ?? sub.planId}</Td>
            <Td><span className="badge-brand">{plan?.mealsPerDay === 2 ? 'Lunch + dinner' : 'Lunch'}</span></Td>
            <Td>{sub.address}</Td>
            <Td className="muted">{[addonNames(sub.addons), prefText(sub.preferences)].filter(Boolean).join(' · ') || '—'}</Td>
          </tr>
        ))}
      </TableCard>
    </div>
  );
}
