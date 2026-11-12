import { useState } from 'react';
import { useSelector } from 'react-redux';
import PlanCard, { formatINR } from '../components/PlanCard';

const filters = [['all', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-veg']];

export default function Plans() {
  const { plans, status } = useSelector((s) => s.catalog);
  const [diet, setDiet] = useState('all');
  const shown = plans.filter((p) => diet === 'all' || p.diet === diet);

  return (
    <>
      <h1 className="font-display text-4xl font-bold">Our plans</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Billed monthly. Skip days when you are away.</p>

      <div className="mt-6 flex gap-2" role="group" aria-label="Filter by diet">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={diet === value}
            onClick={() => setDiet(value)}
            className={diet === value ? 'btn-primary' : 'btn-ghost'}
          >
            {label}
          </button>
        ))}
      </div>

      {status !== 'ready' ? (
        <p className="mt-8 text-stone-500">Loading plans…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {shown.map((p) => <PlanCard key={p.id} plan={p} />)}
          </div>
          {shown.length === 0 && <p className="mt-8 text-stone-500">No plans match this filter.</p>}

          <h2 className="mt-16 font-display text-2xl font-bold">Compare plans</h2>
          <div className="card mt-4 overflow-x-auto p-0">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-stone-200 dark:border-stone-800">
                <tr>
                  {['Plan', 'Diet', 'Meals', 'Price / month'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.diet === 'veg' ? 'Veg' : 'Non-veg'}</td>
                    <td className="px-4 py-3">{p.mealsPerDay === 1 ? 'Lunch' : 'Lunch + dinner'}</td>
                    <td className="px-4 py-3">{formatINR(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
