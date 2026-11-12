import { useSelector } from 'react-redux';

export default function Menu() {
  const menu = useSelector((s) => s.catalog.menu);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <section className="py-12">
      <h1 className="font-display text-4xl font-bold">This week's menu</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Non-veg plans get the first option where two are listed.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.map((m) => (
          <article key={m.day} className={`card ${m.day === today ? 'ring-2 ring-orange-500' : ''}`}>
            <h2 className="flex items-center justify-between font-semibold">
              {m.day}
              {m.day === today && <span className="text-xs font-medium text-orange-600">Today</span>}
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Lunch</dt>
                <dd>{m.lunch}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Dinner</dt>
                <dd>{m.dinner}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
