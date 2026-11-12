import { useState } from 'react';
import { useSelector } from 'react-redux';
import Photo from '../components/Photo';
import { SkeletonGrid } from '../components/PlanCard';
import { images } from '../lib/images';
import { pickDish, todayName } from '../lib/menu';

export default function Menu() {
  const { menu, status } = useSelector((s) => s.catalog);
  const today = todayName();
  const [day, setDay] = useState(today);
  const [diet, setDiet] = useState('veg');
  const selected = menu.find((m) => m.day === day) ?? menu[0];

  return (
    <section className="py-10">
      <header className="grid items-center gap-6 overflow-hidden rounded-3xl bg-turmeric-100 sm:grid-cols-[1fr_16rem] dark:bg-stone-900">
        <div className="p-6 sm:p-8">
          <p className="eyebrow">Fresh every day</p>
          <h1 className="page-title mt-1">This week's menu</h1>
          <p className="muted mt-2">Where two options are listed, the first is non-veg and the second is veg.</p>
        </div>
        <Photo image={images.menu} className="hidden h-full min-h-40 w-full sm:block" />
      </header>

      {status !== 'ready' ? (
        <div className="mt-8 space-y-6">
          <SkeletonGrid count={1} height="h-48" className="" />
          <SkeletonGrid count={6} height="h-32" className="sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Day" className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {menu.map((m) => (
                <button
                  key={m.day}
                  role="tab"
                  aria-selected={m.day === selected.day}
                  onClick={() => setDay(m.day)}
                  className="chip"
                >
                  {m.day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Diet" className="flex gap-2">
              {[['veg', '🥬 Veg'], ['nonveg', '🍗 Non-veg']].map(([v, label]) => (
                <button key={v} aria-pressed={diet === v} onClick={() => setDiet(v)} className="chip">
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
