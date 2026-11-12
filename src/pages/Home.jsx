import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import PlanCard, { SkeletonGrid } from '../components/PlanCard';
import { pickDish, todayName } from '../lib/menu';

const stats = [['2,000+', 'students fed'], ['4.8★', 'average rating'], ['12', 'colleges']];

const steps = [
  ['Pick a plan', 'Veg or non-veg, lunch only or both meals. Billed monthly, cancel anytime.'],
  ['Get it delivered', 'Hot tiffin at your hostel or PG gate by 1 pm and 8 pm.'],
  ['Skip when you are away', 'Going home for the weekend? Skip a day and it gets added to the end of your month.'],
];

const features = [
  ['💸', 'Pocket-friendly', 'Cheaper per meal than most canteens.'],
  ['🍲', 'Home-style taste', 'Cooked fresh by local home kitchens.'],
  ['🚪', 'At your gate', 'Delivered to your hostel or PG on time.'],
  ['⏸️', 'Flexible', 'Skip days when you travel; cancel anytime.'],
];

const testimonials = [
  ['Aarav', 'Tastes like mom’s cooking, and I never have to queue at the mess again.'],
  ['Meera', 'The skip feature is great for weekends when I go home.'],
  ['Kabir', 'The Protein Pack keeps me going through gym season.'],
];

const faqs = [
  ['Can I skip a day?', 'Yes. Skip from your dashboard and the day is added to the end of your month.'],
  ['How do I cancel?', 'Cancel any time from your dashboard; you are not billed for the next month.'],
  ['Where do you deliver?', 'Hostels and PGs near our partner campuses, at the gate by 1 pm and 8 pm.'],
];

function TodayCard({ menu }) {
  const today = menu.find((m) => m.day === todayName()) ?? menu[0];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-200 via-amber-100 to-green-100 blur-2xl dark:from-orange-900/40 dark:via-amber-900/20 dark:to-green-900/20" />
      <div className="card relative -rotate-1 p-7 shadow-(--shadow-lift)">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-orange-600">Today's tiffin</p>
          <span className="badge-brand">{today ? today.day : '…'}</span>
        </div>
        {!today ? (
          <div className="skeleton mt-4 h-40" />
        ) : (
          <div className="mt-5 space-y-5">
            {[['🍛', 'Lunch · 1 pm', today.lunch], ['🍲', 'Dinner · 8 pm', today.dinner]].map(([icon, label, dish]) => (
              <div key={label} className="flex items-start gap-4">
                <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-3xl dark:bg-stone-800">{icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">{label}</p>
                  <p className="font-semibold">{pickDish(dish, 'veg')}</p>
                  {dish.includes(' / ') && <p className="text-xs text-stone-500">Non-veg: {pickDish(dish, 'nonveg')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center gap-2 border-t border-dashed border-stone-200 pt-4 text-xs text-stone-500 dark:border-stone-700">
          <span aria-hidden="true">🛵</span> Out for delivery from local home kitchens
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { plans, menu, status } = useSelector((s) => s.catalog);
  const loading = status !== 'ready';

  return (
    <>
      <section className="grid items-center gap-12 py-12 sm:py-20 lg:grid-cols-2">
        <div>
          <span className="badge-brand">🍱 Monthly tiffin for students</span>
          <h1 className="mt-4 font-display text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
            Home-style food, delivered to your <span className="text-orange-600">hostel</span> every day.
          </h1>
          <p className="muted mt-5 max-w-lg text-lg">
            Fresh meals from local home kitchens, for less than the canteen. One subscription, no daily ordering.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/plans" className="btn-primary px-7 py-3 text-base">See plans</Link>
            <Link to="/menu" className="btn-ghost px-7 py-3 text-base">View menu</Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-stone-200 pt-6 dark:border-stone-800">
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold sm:text-3xl">{value}</dt>
                <dd className="text-xs text-stone-500 sm:text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <TodayCard menu={menu} />
      </section>

      <section className="section" id="plans">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Pick your plan</h2>
          <Link to="/plans" className="text-sm font-semibold text-orange-600 hover:underline">Compare all plans →</Link>
        </div>
        <div className="mt-8">
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">{plans.map((p) => <PlanCard key={p.id} plan={p} />)}</div>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map(([title, body], i) => (
            <li key={title} className="card card-hover">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 font-display text-lg font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="muted mt-1 text-sm">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2 className="section-title">Why students love us</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([icon, title, body]) => (
            <div key={title} className="card card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl dark:bg-stone-800" aria-hidden="true">{icon}</span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="muted mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">What students say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map(([name, quote]) => (
            <figure key={name} className="card flex flex-col">
              <p className="text-amber-500" aria-label="5 out of 5 stars">★★★★★</p>
              <blockquote className="mt-3 flex-1 text-stone-700 dark:text-stone-300">“{quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm">
                <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">{name[0]}</span>
                <span><span className="font-semibold">{name}</span> <span className="text-stone-500">· fictional student</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section grid gap-8 lg:grid-cols-3">
        <div>
          <h2 className="section-title">Questions?</h2>
          <p className="muted mt-2">The quick answers. Need more? <Link to="/contact" className="font-semibold text-orange-600 hover:underline">Talk to us</Link>.</p>
        </div>
        <div className="space-y-3 lg:col-span-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="card py-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="muted mt-2 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 px-6 py-14 text-center text-white shadow-(--shadow-lift)">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Skip the canteen queue.</h2>
        <p className="mx-auto mt-3 max-w-md text-orange-50">Join thousands of students eating better for less. Cancel any time.</p>
        <Link to="/register" className="btn mt-7 bg-white px-7 py-3 text-base text-orange-700 shadow-md hover:-translate-y-0.5 hover:bg-orange-50">Get started</Link>
      </section>
    </>
  );
}
