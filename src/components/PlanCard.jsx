import { Link } from 'react-router';

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
    <article className={`card card-hover relative flex flex-col ${plan.popular ? 'border-orange-400 ring-2 ring-orange-500/60' : ''}`}>
      {plan.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-orange-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
          ⭐ Most popular
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
        <span className={veg ? 'badge-veg' : 'badge-nonveg'}>{veg ? '🥬 Veg' : '🍗 Non-veg'}</span>
      </div>
      <p className="muted mt-2 flex-1 text-sm">{plan.description}</p>
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
