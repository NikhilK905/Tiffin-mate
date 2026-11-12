import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { savePlans } from '../../store/catalogSlice';
import { Empty, PageHead, rupees } from './shared';

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
    <form onSubmit={submit} className="card mb-4 grid gap-4 p-5 sm:grid-cols-2">
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

export default function Plans() {
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
    <div>
      <PageHead eyebrow="Plans" title="Meal plans" hint="Changes show up on the public plans page straight away.">
        {!editing && <button className="btn-primary" onClick={() => setEditing(blankPlan)}>➕ Add plan</button>}
      </PageHead>
      {editing && <PlanForm key={editing.id ?? 'new'} initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((p) => (
          <div key={p.id} className="card flex flex-col p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="mr-auto font-display text-xl font-semibold">{p.name}</h3>
              {p.popular && <span className="badge-brand">★ Popular</span>}
              <span className={p.diet === 'veg' ? 'badge-veg' : 'badge-nonveg'}>{p.diet === 'veg' ? 'Veg' : 'Non-veg'}</span>
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-orange-600">
              {rupees(p.price)}<span className="muted font-sans text-sm font-normal"> / month · {p.mealsPerDay} meal{p.mealsPerDay > 1 ? 's' : ''} a day</span>
            </p>
            <p className="muted mt-2 flex-1 text-sm">{p.description}</p>
            <div className="mt-4 flex gap-3">
              <button className="btn-ghost px-4 py-1.5" onClick={() => setEditing(p)}>Edit</button>
              <button className="btn-ghost px-4 py-1.5 text-red-600 dark:text-red-400" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {!plans.length && <div className="card"><Empty icon="📋" title="No plans yet" hint="Add your first plan." /></div>}
    </div>
  );
}
