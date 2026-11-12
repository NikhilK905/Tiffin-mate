import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { saveMenu, savePlans } from '../store/catalogSlice';
import { mealsLeft, todayISO } from '../lib/subscription';
import RequireAdmin from '../components/RequireAdmin';

export { RequireAdmin };

const TABS = ['Subscribers', 'Plans', 'Menu'];
const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;
const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
const statusStyle = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

function Subscribers() {
  const users = useSelector((s) => s.auth.users);
  const subs = useSelector((s) => s.subscription.byEmail);
  const plans = useSelector((s) => s.catalog.plans);
  const today = todayISO();
  const students = Object.values(users).filter((u) => u.role !== 'admin');
  const subList = students.map((u) => subs[u.email]).filter(Boolean);
  const active = subList.filter((x) => x.status === 'active');
  const cards = [
    ['Total students', students.length],
    ['Active subscriptions', active.length],
    ['Paused', subList.filter((x) => x.status === 'paused').length],
    ['Monthly revenue', rupees(active.reduce((sum, x) => sum + x.price, 0))],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-sm text-stone-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
            <tr>
              {['Student', 'Plan', 'Status', 'Start', 'End', 'Meals left', 'Address'].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((u) => {
              const sub = subs[u.email];
              return (
                <tr key={u.email} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                  <td className="px-3 py-2">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-stone-500">{u.email}</div>
                  </td>
                  <td className="px-3 py-2">{sub ? (plans.find((p) => p.id === sub.planId)?.name ?? sub.planId) : '—'}</td>
                  <td className="px-3 py-2">
                    {sub ? (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyle[sub.status]}`}>{sub.status}</span>
                    ) : (
                      <span className="text-stone-500">No plan</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{sub ? fmt(sub.startDate) : '—'}</td>
                  <td className="px-3 py-2">{sub ? fmt(sub.endDate) : '—'}</td>
                  <td className="px-3 py-2">{sub ? mealsLeft(sub, today) : '—'}</td>
                  <td className="px-3 py-2">{sub?.address ?? '—'}</td>
                </tr>
              );
            })}
            {!students.length && (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-stone-500">No students yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const blankPlan = { name: '', diet: 'veg', mealsPerDay: 1, price: '', description: '', popular: false };

function PlanForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const price = Number(f.price);
    if (!f.name.trim()) return toast.error('Plan name is required');
    if (!(price > 0)) return toast.error('Enter a price above 0');
    if (!f.description.trim()) return toast.error('Description is required');
    onSave({ ...f, name: f.name.trim(), description: f.description.trim(), price, mealsPerDay: Number(f.mealsPerDay) });
  };

  return (
    <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2">
      <label className="label">Name<input className="input" value={f.name} onChange={set('name')} /></label>
      <label className="label">Price (₹ / month)<input className="input" type="number" min="1" value={f.price} onChange={set('price')} /></label>
      <label className="label">Diet
        <select className="input" value={f.diet} onChange={set('diet')}>
          <option value="veg">Veg</option>
          <option value="nonveg">Non-veg</option>
        </select>
      </label>
      <label className="label">Meals per day
        <select className="input" value={f.mealsPerDay} onChange={set('mealsPerDay')}>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </label>
      <label className="label sm:col-span-2">Description<input className="input" value={f.description} onChange={set('description')} /></label>
      <label className="label flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" checked={!!f.popular} onChange={set('popular')} /> Mark as popular
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button className="btn-primary" type="submit">Save plan</button>
        <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function Plans() {
  const plans = useSelector((s) => s.catalog.plans);
  const subs = useSelector((s) => s.subscription.byEmail);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null); // plan object, blankPlan for new, or null

  const save = (plan) => {
    const isNew = !plan.id;
    const next = isNew
      ? [...plans, { ...plan, id: `${plan.name.toLowerCase().replace(/\W+/g, '-')}-${Date.now().toString(36)}` }]
      : plans.map((p) => (p.id === plan.id ? plan : p));
    dispatch(savePlans(next));
    setEditing(null);
    toast.success(isNew ? 'Plan added' : 'Plan updated');
  };

  const remove = (plan) => {
    const n = Object.values(subs).filter((s) => s.planId === plan.id).length;
    const warn = n ? ` ${n} subscriber(s) are on it and will keep their subscription.` : '';
    if (!window.confirm(`Delete "${plan.name}"?${warn}`)) return;
    dispatch(savePlans(plans.filter((p) => p.id !== plan.id)));
    toast.success('Plan deleted');
  };

  return (
    <div className="space-y-4">
      {editing ? (
        <PlanForm key={editing.id ?? 'new'} initial={editing} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <button className="btn-primary" onClick={() => setEditing(blankPlan)}>Add plan</button>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="card">
            <h3 className="flex flex-wrap items-center gap-2 font-semibold">
              {p.name}
              {p.popular && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">Popular</span>}
            </h3>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              {p.diet === 'veg' ? 'Veg' : 'Non-veg'} · {p.mealsPerDay} meal{p.mealsPerDay > 1 ? 's' : ''}/day · {rupees(p.price)}/month
            </p>
            <p className="mt-2 text-sm">{p.description}</p>
            <div className="mt-4 flex gap-3">
              <button className="btn-ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn-ghost text-red-600 dark:text-red-400" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Menu() {
  const menu = useSelector((s) => s.catalog.menu);
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(menu);

  const set = (i, k) => (e) => setDraft(draft.map((row, j) => (j === i ? { ...row, [k]: e.target.value } : row)));
  const save = () => {
    if (draft.some((r) => !r.lunch.trim() || !r.dinner.trim())) return toast.error('Fill in lunch and dinner for every day');
    dispatch(saveMenu(draft.map((r) => ({ ...r, lunch: r.lunch.trim(), dinner: r.dinner.trim() }))));
    toast.success('Menu saved');
  };

  return (
    <div className="card space-y-4">
      {draft.map((row, i) => (
        <div key={row.day} className="grid gap-3 sm:grid-cols-[7rem_1fr_1fr] sm:items-end">
          <p className="font-semibold sm:pb-2.5">{row.day}</p>
          <label className="label">Lunch<input className="input" value={row.lunch} onChange={set(i, 'lunch')} /></label>
          <label className="label">Dinner<input className="input" value={row.dinner} onChange={set(i, 'dinner')} /></label>
        </div>
      ))}
      <button className="btn-primary" onClick={save}>Save menu</button>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <section className="space-y-6 py-12">
      <h1 className="font-display text-3xl font-bold">Admin panel</h1>
      <div className="flex gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={tab === t ? 'btn-primary' : 'btn-ghost'}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Subscribers' && <Subscribers />}
      {tab === 'Plans' && <Plans />}
      {tab === 'Menu' && <Menu />}
    </section>
  );
}
