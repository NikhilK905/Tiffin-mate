import { useSelector } from 'react-redux';
import PlanCard from '../components/PlanCard';

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

export default function Home() {
  const { plans, status } = useSelector((s) => s.catalog);

  return (
    <>
      <section className="py-16 text-center sm:py-24">
        <p className="text-sm font-semibold tracking-wide text-orange-600 uppercase">Monthly tiffin for students</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-tight font-bold sm:text-6xl">
          Home-style food, delivered to your hostel every day.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-stone-600 dark:text-stone-400">
          Fresh meals from local home kitchens, for less than the canteen. One subscription, no daily ordering.
        </p>
        <a href="#plans" className="btn-primary mt-8 px-7 py-3 text-base">See plans</a>
      </section>

      <section id="plans" className="scroll-mt-20">
        <h2 className="font-display text-3xl font-bold">Plans</h2>
        {status !== 'ready' ? (
          <p className="mt-6 text-stone-500">Loading plans…</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {plans.map((p) => <PlanCard key={p.id} plan={p} />)}
          </div>
        )}
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map(([title, body], i) => (
            <li key={title} className="card">
              <span className="font-display text-3xl font-bold text-orange-600">{i + 1}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold">Why students love us</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([icon, title, body]) => (
            <div key={title} className="card">
              <span className="text-3xl" aria-hidden="true">{icon}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold">What students say</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map(([name, quote]) => (
            <figure key={name} className="card">
              <blockquote className="text-sm text-stone-700 dark:text-stone-300">“{quote}”</blockquote>
              <figcaption className="mt-3 text-sm font-semibold">{name} <span className="font-normal text-stone-500">· fictional student</span></figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
