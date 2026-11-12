import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { addFeedback, selectMyFeedback } from '../store/feedbackSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { addDays, mealsLeft, pause, resume, todayISO, toggleSkip } from '../lib/subscription';
import { STAGES, blockedReason, calendarCells, dayName, deliveredDays, mealStage, mealsOf, minutesOf, stats } from '../lib/tracking';

const statusStyle = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  cancelled: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const BLOCKED = { skipped: 'Skipped today', paused: 'Paused', ended: 'Plan ended', cancelled: 'Cancelled' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Timeline({ meal, dish, label }) {
  return (
    <div>
      <p className="text-sm font-medium capitalize">{meal}{dish && <span className="font-normal text-stone-500"> · {dish}</span>}</p>
      {typeof label === 'string' ? (
        <p className="mt-2 text-sm text-stone-500">{label}</p>
      ) : (
        <ol className="mt-3 flex gap-1">
          {STAGES.map((st, i) => (
            <li key={st} aria-current={i === label ? 'step' : undefined} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= label ? 'bg-orange-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
              <p className={`mt-1 text-xs ${i === label ? 'font-semibold text-orange-600' : 'text-stone-500'}`}>{st}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function RateMeal({ date, meal, dish, existing, onSave }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  return (
    <li className="rounded-xl border border-stone-200 p-3 dark:border-stone-800">
      <p className="text-sm font-medium capitalize">{fmt(date)} · {meal}{dish && <span className="font-normal text-stone-500"> · {dish}</span>}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={`Rate ${meal} on ${fmt(date)}`} className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)} className={`px-0.5 text-2xl leading-none ${n <= rating ? 'text-orange-500' : 'text-stone-300 dark:text-stone-600'}`}>★</button>
          ))}
        </div>
        <input className="input min-w-0 flex-1" placeholder="Comment (optional)" aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn-ghost" disabled={!rating} onClick={() => onSave({ date, meal, rating, comment: comment.trim() })}>
          {existing ? 'Update' : 'Submit'}
        </button>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const user = useSelector(selectUser);
  const sub = useSelector(selectSubscription);
  const plans = useSelector((s) => s.catalog.plans);
  const menu = useSelector((s) => s.catalog.menu);
  const feedback = useSelector(selectMyFeedback);
  const dispatch = useDispatch();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
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
  const cells = calendarCells(sub.startDate, sub.endDate);
  const left = mealsLeft(sub, today);
  const meals = mealsOf(sub, plan);
  const st = stats(sub, plan, today);
  const dishOf = (date, meal) => menu.find((m) => m.day === dayName(date))?.[meal];
  const rateable = deliveredDays(sub, today, addDays(today, -7)).reverse();
  const saveRating = (f) => {
    dispatch(addFeedback({ ...f, email: user.email, name: user.name }));
    toast.success('Thanks for the feedback!');
  };
  const blocked = blockedReason(sub, today);
  const label = blocked === 'upcoming' ? `Starts on ${fmt(sub.startDate)}` : BLOCKED[blocked];

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

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Meals left', left],
          ['Meals eaten', st.eaten],
          ['Days skipped', st.skipped],
          ['Saved vs canteen', `₹${st.saved.toLocaleString('en-IN')}`],
        ].map(([k, v]) => (
          <div key={k} className="card py-4">
            <p className="font-display text-2xl font-bold">{v}</p>
            <p className="text-sm text-stone-500">{k}</p>
          </div>
        ))}
        <div className="card flex flex-col justify-center gap-2 py-4">
          <Link to="/billing" className="text-sm font-medium text-orange-600 hover:underline">Billing &amp; payments →</Link>
          <Link to="/profile" className="text-sm font-medium text-orange-600 hover:underline">Profile &amp; preferences →</Link>
        </div>
      </div>

      <div className="card space-y-5">
        <h2 className="font-semibold">Today's order</h2>
        {meals.map((meal) => (
          <Timeline key={meal} meal={meal} dish={dishOf(today, meal)} label={label ?? mealStage(meal, minutesOf(now))} />
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold">Rate your meals</h2>
        {rateable.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Delivered meals from the last 7 days will show up here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rateable.flatMap((d) => meals.map((meal) => (
              <RateMeal key={`${d}${meal}`} date={d} meal={meal} dish={dishOf(d, meal)} onSave={saveRating}
                existing={feedback.find((f) => f.date === d && f.meal === meal)} />
            )))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold">Delivery calendar</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Tap a future day to skip it. Each skipped day is added to the end of your plan.
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-stone-500">
          {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
        </div>
        <ul className="mt-1.5 grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <li key={`pad${i}`} aria-hidden="true" />;
            const skipped = (sub.skips ?? []).includes(d);
            const past = d <= today;
            const delivered = past && !blockedReason(sub, d);
            return (
              <li key={d}>
                <button
                  disabled={past || sub.status !== 'active'}
                  aria-pressed={skipped}
                  aria-label={`${fmt(d)}, ${skipped ? 'skipped' : delivered ? 'delivered' : past ? 'not delivered' : 'upcoming'}`}
                  onClick={() => update((s) => toggleSkip(s, d, today), skipped ? `${fmt(d)} back on` : `${fmt(d)} skipped`)}
                  className={`w-full rounded-lg border px-1 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed ${
                    d === today ? 'ring-2 ring-orange-400 ' : ''
                  }${
                    skipped
                      ? 'border-stone-300 bg-stone-100 text-stone-400 line-through dark:border-stone-700 dark:bg-stone-800'
                      : delivered
                        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
                        : past
                          ? 'border-transparent text-stone-400'
                          : 'border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200'
                  }`}
                >
                  {d.endsWith('-01') || d === sub.startDate ? fmt(d) : Number(d.slice(8))}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-4 text-xs text-stone-600 dark:text-stone-400">
          <li><span className="mr-1.5 inline-block size-3 rounded border border-orange-200 bg-orange-50 align-middle" />Upcoming</li>
          <li><span className="mr-1.5 inline-block size-3 rounded border border-stone-300 bg-stone-100 align-middle" />Skipped</li>
          <li><span className="mr-1.5 inline-block size-3 rounded border border-green-200 bg-green-50 align-middle" />Delivered</li>
        </ul>
      </div>
    </section>
  );
}
