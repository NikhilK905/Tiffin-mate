import { useState } from 'react';
import { useSelector } from 'react-redux';
import Photo from '../components/Photo';
import { SkeletonGrid } from '../components/PlanCard';
import { images } from '../lib/images';
import { countStaples, dietSplit, hasNonVegOption, pickDish, todayName } from '../lib/menu';

// Horizontal bars: one series, so no legend; the title names it and every bar carries its value.
function StapleChart({ staples, total }) {
  const max = Math.max(1, ...staples.map((s) => s.count));
  return (
    <figure className="card" aria-labelledby="staples-title">
      <figcaption id="staples-title" className="font-display text-lg font-semibold">What's on the plate this week</figcaption>
      <p className="muted text-sm">Meals (out of {total}) that feature each staple</p>
      <ul className="mt-4 space-y-2.5">
        {staples.map(({ name, count }) => (
          <li key={name} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_2rem]">
            <span>{name}</span>
            <span className="h-3 rounded-r-full bg-stone-100 dark:bg-stone-800" aria-hidden="true">
              <span className="block h-full rounded-r-full bg-orange-600" style={{ width: `${(count / max) * 100}%` }} />
            </span>
            <span className="text-right font-semibold tabular-nums">{count}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

// Stacked bar with a 2px surface gap between segments; counts are written out, not colour-only.
function DietSplit({ split: { vegOnly, nonVeg, total } }) {
  const parts = [
    { label: 'Veg only', count: vegOnly, icon: '🥬', bar: 'bg-green-700 text-white' },
    { label: 'Has a non-veg option', count: nonVeg, icon: '🍗', bar: 'bg-turmeric-400 text-stone-900' },
  ];
  return (
    <figure className="card flex flex-col" aria-labelledby="split-title">
      <figcaption id="split-title" className="font-display text-lg font-semibold">Veg vs non-veg options</figcaption>
      <p className="muted text-sm">All {total} meals this week</p>
      <div className="mt-6 flex h-12 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label}: ${p.count} of ${total}`).join(', ')}>
        {parts.filter((p) => p.count > 0).map((p) => (
          <div key={p.label} className={`flex items-center justify-center text-sm font-bold ${p.bar}`} style={{ flexGrow: p.count, flexBasis: 0 }}>{p.count}</div>
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-3 w-3 rounded-sm ${p.bar.split(' ')[0]}`} />
            <span aria-hidden="true">{p.icon}</span>
            <span>{p.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{p.count} · {Math.round((p.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
      <p className="muted mt-auto pt-4 text-xs">Non-veg plans get the first option wherever two are listed.</p>
    </figure>
  );
}

export default function Menu() {
  const { menu, status } = useSelector((s) => s.catalog);
  const today = todayName();
  const [day, setDay] = useState(today);
  const [diet, setDiet] = useState('veg');
  const staples = countStaples(menu);
  const split = dietSplit(menu);
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

          <h2 className="mt-14 font-display text-2xl font-bold">Menu at a glance</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_2fr]">
            <StapleChart staples={staples} total={split.total} />
            <DietSplit split={split} />
          </div>

          <h2 className="mt-14 font-display text-2xl font-bold">Full week</h2>
          <div className="card mt-4 overflow-clip p-0">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Weekly menu for the {diet === 'veg' ? 'veg' : 'non-veg'} diet</caption>
              <thead>
                <tr>
                  {['Day', 'Lunch (1 pm)', 'Dinner (8 pm)'].map((h) => (
                    <th key={h} scope="col" className="sticky top-[61px] z-[5] bg-turmeric-100 px-3 py-3 font-semibold sm:px-4 dark:bg-stone-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {menu.map((m) => (
                  <tr key={m.day} className={`border-t border-stone-100 dark:border-stone-800 ${m.day === today ? 'bg-orange-100 dark:bg-orange-900/20' : 'odd:bg-stone-50 dark:odd:bg-stone-900/60'}`}>
                    <th scope="row" className="px-3 py-3 align-top font-semibold sm:px-4">
                      <span className="sm:hidden">{m.day.slice(0, 3)}</span>
                      <span className="hidden sm:inline">{m.day}</span>
                      {m.day === today && <span className="badge-brand mt-1 block w-fit">Today</span>}
                    </th>
                    {[m.lunch, m.dinner].map((meal, i) => (
                      <td key={i} className="px-3 py-3 align-top sm:px-4">
                        <span title={hasNonVegOption(meal) ? 'Has a non-veg option' : 'Veg only'} className="mr-1">
                          <span aria-hidden="true">{hasNonVegOption(meal) ? '🍗' : '🥬'}</span>
                          <span className="sr-only">{hasNonVegOption(meal) ? 'Has a non-veg option: ' : 'Veg only: '}</span>
                        </span>
                        {pickDish(meal, diet)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted mt-3 text-xs">🥬 veg only · 🍗 has a non-veg option</p>
        </>
      )}
    </section>
  );
}
