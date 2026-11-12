import { Link } from 'react-router';

export const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function PlanCard({ plan }) {
  const perMeal = Math.round(plan.price / (30 * plan.mealsPerDay));
  return (
    <article className={`card relative flex flex-col ${plan.popular ? 'ring-2 ring-orange-500' : ''}`}>
      {plan.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-orange-600 px-3 py-0.5 text-xs font-semibold text-white">
          Most popular
        </span>
      )}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            plan.diet === 'veg'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          {plan.diet === 'veg' ? 'Veg' : 'Non-veg'}
        </span>
      </div>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{plan.description}</p>
      <p className="mt-6">
        <span className="font-display text-4xl font-bold">{formatINR(plan.price)}</span>
        <span className="text-sm text-stone-500"> / month</span>
      </p>
      <p className="mt-1 text-sm text-stone-500">
        {plan.mealsPerDay === 1 ? 'Lunch only' : 'Lunch + dinner'} · about {formatINR(perMeal)} a meal
      </p>
      <Link to={`/subscribe/${plan.id}`} className="btn-primary mt-6">
        Choose plan
      </Link>
    </article>
  );
}
