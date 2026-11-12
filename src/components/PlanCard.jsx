import { Link } from 'react-router';
import { planFallback, planImages } from '../lib/images';
import Photo from './Photo';

export const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;

// Shimmer placeholders shown while catalog.status is 'loading'.
export function SkeletonGrid({ count = 3, height = 'h-64', className = 'md:grid-cols-3' }) {
  return (
    <div className={`grid gap-6 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => <div key={i} className={`skeleton ${height}`} />)}
    </div>
  );
}

export default function PlanCard({ plan }) {
  const perMeal = Math.round(plan.price / (30 * plan.mealsPerDay));
  const veg = plan.diet === 'veg';
  return (
    <article className={`card card-hover relative flex flex-col overflow-hidden p-0 ${plan.popular ? 'border-orange-400 ring-2 ring-orange-500/60' : ''}`}>
      <div className="relative">
        <Photo image={planImages[plan.id] ?? planFallback} emoji={veg ? '🥗' : '🍗'} className="h-40 w-full" />
        <span className={`badge absolute top-3 right-3 shadow-sm ${veg ? 'bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800' : 'bg-red-100 text-red-800 dark:bg-red-100 dark:text-red-800'}`}>{veg ? '🥬 Veg' : '🍗 Non-veg'}</span>
        {plan.popular && (
          <span className="absolute top-3 left-3 rounded-full bg-turmeric-400 px-3 py-0.5 text-xs font-bold text-stone-900 shadow-sm">⭐ Most popular</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
        <p className="muted mt-2 flex-1 text-sm">{plan.description}</p>
        <p className="mt-5">
          <span className="font-display text-4xl font-bold">{formatINR(plan.price)}</span>
          <span className="text-sm text-stone-500"> / month</span>
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {plan.mealsPerDay === 1 ? 'Lunch only' : 'Lunch + dinner'} · about {formatINR(perMeal)} a meal
        </p>
        <Link to={`/subscribe/${plan.id}`} className="btn-primary mt-5">
          Choose plan
        </Link>
      </div>
    </article>
  );
}
