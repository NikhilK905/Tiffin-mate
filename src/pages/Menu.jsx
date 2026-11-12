import { useState } from 'react';
import { useSelector } from 'react-redux';
import { SkeletonGrid } from '../components/PlanCard';
import { pickDish, todayName } from '../lib/menu';

export default function Menu() {
  const { menu, status } = useSelector((s) => s.catalog);
  const today = todayName();
  const [day, setDay] = useState(today);
  const [diet, setDiet] = useState('veg');
  const selected = menu.find((m) => m.day === day) ?? menu[0];

  return (
    <section className="py-12">
      <h1 className="section-title">This week's menu</h1>
      <p className="muted mt-2">Where two options are listed, the first is non-veg and the second is veg.</p>

      {status !== 'ready' ? (
        <div className="mt-8 space-y-6">
          <SkeletonGrid count={1} height="h-48" className="" />
          <SkeletonGrid count={6} height="h-32" className="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Day" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900">
              {menu.map((m) => (
                <button
                  key={m.day}
                  role="tab"
                  aria-selected={m.day === selected.day}
                  onClick={() => setDay(m.day)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-orange-500 ${
                    m.day === selected.day ? 'bg-orange-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  }`}
                >
                  {m.day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Diet" className="flex gap-2">
              {[['veg', '🥬 Veg'], ['nonveg', '🍗 Non-veg']].map(([v, label]) => (
                <button key={v} aria-pressed={diet === v} onClick={() => setDiet(v)} className={`${diet === v ? 'btn-primary' : 'btn-ghost'} px-4 py-2`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card mt-6" role="tabpanel">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
              {selected.day}
              {selected.day === today && <span className="badge-brand">Today</span>}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[['🍛', 'Lunch · 1 pm', selected.lunch], ['🍲', 'Dinner · 8 pm', selected.dinner]].map(([icon, label, dish]) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl bg-orange-50 p-4 dark:bg-stone-800">
                  <span aria-hidden="true" className="text-4xl">{icon}</span>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
                    <p className="font-semibold">{pickDish(dish, diet)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="mt-14 font-display text-2xl font-bold">Full week</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((m) => (
              <article key={m.day} className={`card card-hover p-5 ${m.day === today ? 'border-orange-400 ring-2 ring-orange-500/60' : ''}`}>
                <h3 className="flex items-center justify-between font-semibold">
                  {m.day}
                  {m.day === today && <span className="badge-brand">Today</span>}
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="text-stone-500">Lunch</dt><dd>{pickDish(m.lunch, diet)}</dd></div>
                  <div><dt className="text-stone-500">Dinner</dt><dd>{pickDish(m.dinner, diet)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
