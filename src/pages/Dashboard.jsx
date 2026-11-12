import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { addDays, diffDays, mealsLeft, pause, resume, todayISO, toggleSkip } from '../lib/subscription';

const statusStyle = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export default function Dashboard() {
  const user = useSelector(selectUser);
  const sub = useSelector(selectSubscription);
  const plans = useSelector((s) => s.catalog.plans);
  const dispatch = useDispatch();
  const today = todayISO();

  const update = (change, message) => {
    try {
      dispatch(setSubscription({ email: user.email, sub: change(sub) }));
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!sub || sub.status === 'cancelled') {
    return (
      <section className="card mx-auto mt-12 max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Hi {user.name.split(' ')[0]} 👋</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">You don't have an active tiffin plan.</p>
        <Link to="/plans" className="btn-primary mt-6">Browse plans</Link>
      </section>
    );
  }

  const plan = plans.find((p) => p.id === sub.planId);
  const days = Array.from({ length: diffDays(sub.startDate, sub.endDate) + 1 }, (_, i) => addDays(sub.startDate, i));
  const left = mealsLeft(sub, today);

  const onCancel = () => {
    if (!window.confirm('Cancel your subscription? This cannot be undone.')) return;
    update((s) => ({ ...s, status: 'cancelled' }), 'Subscription cancelled');
  };

  return (
    <section className="space-y-6 py-12">
      <div className="card flex flex-wrap items-start gap-6">
        <div className="mr-auto">
          <p className="text-sm text-stone-500">Your plan</p>
          <h1 className="mt-1 flex items-center gap-3 font-display text-3xl font-bold">
            {plan?.name ?? sub.planId}
            <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium capitalize ${statusStyle[sub.status]}`}>
              {sub.status}
            </span>
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {fmt(sub.startDate)} – {fmt(sub.endDate)} · delivering to {sub.address}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold text-orange-600">{left}</p>
          <p className="text-sm text-stone-500">delivery days left</p>
        </div>
        <div className="flex w-full flex-wrap gap-3">
          {sub.status === 'active' ? (
            <button className="btn-ghost" onClick={() => update((s) => pause(s, today), 'Deliveries paused')}>
              Pause deliveries
            </button>
          ) : (
            <button className="btn-primary" onClick={() => update((s) => resume(s, today), 'Deliveries resumed, paused days added back')}>
              Resume deliveries
            </button>
          )}
          <button className="btn-ghost text-red-600 dark:text-red-400" onClick={onCancel}>
            Cancel subscription
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold">Delivery calendar</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Tap a future day to skip it. Each skipped day is added to the end of your plan.
        </p>
        <ul className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10">
          {days.map((d) => {
            const skipped = sub.skips.includes(d);
            const past = d <= today;
            return (
              <li key={d}>
                <button
                  disabled={past || sub.status !== 'active'}
                  aria-pressed={skipped}
                  aria-label={`${fmt(d)}${skipped ? ', skipped' : ''}`}
                  onClick={() => update((s) => toggleSkip(s, d, today), skipped ? `${fmt(d)} back on` : `${fmt(d)} skipped`)}
                  className={`w-full rounded-xl border px-1 py-2 text-xs font-medium transition disabled:cursor-not-allowed ${
                    skipped
                      ? 'border-stone-300 bg-stone-100 text-stone-400 line-through dark:border-stone-700 dark:bg-stone-800'
                      : past
                        ? 'border-transparent text-stone-400'
                        : 'border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200'
                  }`}
                >
                  {fmt(d)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
