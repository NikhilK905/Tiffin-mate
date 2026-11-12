import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { addFeedback, selectMyFeedback } from '../store/feedbackSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { addDays, mealsLeft, pause, resume, todayISO, toggleSkip } from '../lib/subscription';
import { STAGES, blockedReason, calendarCells, dayName, deliveredDays, mealStage, mealsOf, minutesOf, stats } from '../lib/tracking';

const statusBadge = { active: 'badge-veg', paused: 'badge-warn', cancelled: 'badge' };
const STAGE_ICONS = ['📋', '🧑‍🍳', '🛵', '✅'];
const BLOCKED = { skipped: 'Skipped today', paused: 'Paused', ended: 'Plan ended', cancelled: 'Cancelled' };
const BLOCKED_ICON = { skipped: '⏭️', paused: '⏸️', ended: '🏁', cancelled: '🚫', upcoming: '🗓️' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const monthOf = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

function Stepper({ stage }) {
  return (
    <ol className="mt-4 flex">
      {STAGES.map((st, i) => {
        const done = i < stage;
        const current = i === stage;
        return (
          <li key={st} aria-current={current ? 'step' : undefined} className="relative flex-1 text-center">
            {i > 0 && (
              <span aria-hidden="true" className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${i <= stage ? 'bg-orange-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
            )}
            <span
              className={`relative mx-auto grid size-10 place-items-center rounded-full border-2 text-lg ${
                current
                  ? 'border-orange-600 bg-orange-100 ring-4 ring-orange-500/20 dark:bg-orange-900/40'
                  : done
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-stone-200 bg-white grayscale dark:border-stone-700 dark:bg-stone-900'
              }`}
            >
              {done ? <span className="text-sm font-bold">✓</span> : <span aria-hidden="true">{STAGE_ICONS[i]}</span>}
            </span>
            <span className={`mt-2 block text-[11px] leading-tight sm:text-xs ${current ? 'font-semibold text-orange-700 dark:text-orange-400' : 'muted'}`}>{st}</span>
          </li>
        );
      })}
    </ol>
  );
}

function MealTrack({ meal, dish, label, blocked }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4 dark:bg-stone-800/40">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold capitalize">{meal}</p>
        {typeof label === 'string' ? (
          <span className="badge-brand">{BLOCKED_ICON[blocked]} {label}</span>
        ) : (
          <span className="badge-brand">{STAGES[label]}</span>
        )}
      </div>
      {dish && <p className="muted mt-0.5 text-sm">{dish}</p>}
      {typeof label !== 'string' && <Stepper stage={label} />}
    </div>
  );
}

function RateMeal({ date, meal, dish, existing, onSave }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const changed = rating !== (existing?.rating ?? 0) || comment.trim() !== (existing?.comment ?? '');
  return (
    <li className="rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium capitalize">{meal} <span className="muted font-normal">· {fmt(date)}</span></p>
        {existing && !changed && <span className="badge-veg">Rated</span>}
      </div>
      {dish && <p className="muted text-sm">{dish}</p>}
      <div role="radiogroup" aria-label={`Rate ${meal} on ${fmt(date)}`} className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => setRating(n)}
            className={`grid size-11 place-items-center rounded-xl text-3xl leading-none transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-orange-500 ${
              n <= rating ? 'text-turmeric-400' : 'text-stone-300 dark:text-stone-600'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input className="input !mt-0 min-w-0 flex-1" placeholder="Any comment? (optional)" aria-label="Comment" value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn-primary" disabled={!rating || (existing && !changed)} onClick={() => onSave({ date, meal, rating, comment: comment.trim() })}>
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
  const [showAll, setShowAll] = useState(false);
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
      <section className="py-10">
        <div className="card mx-auto max-w-md py-12 text-center">
          <p className="text-5xl" aria-hidden="true">🍱</p>
          <h1 className="mt-3 font-display text-2xl font-bold">Hi {user.name.split(' ')[0]} 👋</h1>
          <p className="muted mt-1 text-sm">You don't have an active tiffin plan.</p>
          <Link to="/plans" className="btn-primary mt-5">Browse plans</Link>
        </div>
      </section>
    );
  }

  const skips = sub.skips ?? [];
  const plan = plans.find((p) => p.id === sub.planId);
  const cells = calendarCells(sub.startDate, sub.endDate);
  const left = mealsLeft(sub, today);
  const meals = mealsOf(sub, plan);
  const st = stats(sub, plan, today);
  const dishOf = (date, meal) => menu.find((m) => m.day === dayName(date))?.[meal];
  const rateable = deliveredDays(sub, today, addDays(today, -7)).reverse();
  const shown = showAll ? rateable : rateable.slice(0, 2);
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

  const statCards = [
    ['🍽️', 'Meals left', left],
    ['😋', 'Meals eaten', st.eaten],
    ['⏭️', 'Days skipped', st.skipped],
    ['💰', 'Saved vs canteen', `₹${st.saved.toLocaleString('en-IN')}`],
  ];

  return (
    <section className="space-y-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title mt-1">Hi {user.name.split(' ')[0]} 👋</h1>
          <p className="muted mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="badge-brand">{plan?.name ?? sub.planId}</span>
            <span className={`${statusBadge[sub.status] ?? 'badge'} capitalize`}>{sub.status}</span>
            <span>{fmt(sub.startDate)} – {fmt(sub.endDate)} · {sub.address}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/billing" className="btn-ghost">Billing</Link>
          <Link to="/profile" className="btn-ghost">Profile</Link>
          {sub.status === 'active' ? (
            <button className="btn-ghost" onClick={() => update((s) => pause(s, today), 'Deliveries paused')}>Pause</button>
          ) : (
            <button className="btn-primary" onClick={() => update((s) => resume(s, today), 'Deliveries resumed, paused days added back')}>Resume</button>
          )}
          <button className="btn-ghost text-red-600 hover:!text-red-700 dark:text-red-400" onClick={onCancel}>Cancel plan</button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(([icon, k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-sm muted"><span aria-hidden="true">{icon}</span> {k}</p>
            <p className="mt-1 font-display text-3xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Today's tracking</h2>
          <p className="muted text-sm">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
        <div className={`mt-4 grid gap-4 ${meals.length > 1 ? 'lg:grid-cols-2' : ''}`}>
          {meals.map((meal) => (
            <MealTrack key={meal} meal={meal} dish={dishOf(today, meal)} blocked={blocked} label={label ?? mealStage(meal, minutesOf(now))} />
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-semibold">Delivery calendar</h2>
        <p className="muted mt-1 text-sm">
          {monthOf(sub.startDate)}{monthOf(sub.endDate) !== monthOf(sub.startDate) && ` – ${monthOf(sub.endDate)}`}. Tap a future day to skip it; skipped days are added to the end of your plan.
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-stone-500 sm:gap-2">
          {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
        </div>
        <ul className="mt-1.5 grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((d, i) => {
            if (!d) return <li key={`pad${i}`} aria-hidden="true" />;
            const skipped = skips.includes(d);
            const past = d <= today;
            const delivered = past && !blockedReason(sub, d);
            const first = d === sub.startDate || d.endsWith('-01');
            return (
              <li key={d}>
                <button
                  disabled={past || sub.status !== 'active'}
                  aria-pressed={skipped}
                  aria-label={`${fmt(d)}, ${skipped ? 'skipped' : delivered ? 'delivered' : past ? 'not delivered' : 'upcoming'}`}
                  onClick={() => update((s) => toggleSkip(s, d, today), skipped ? `${fmt(d)} back on` : `${fmt(d)} skipped`)}
                  className={`flex h-12 w-full flex-col items-center justify-center rounded-xl border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-orange-500 enabled:hover:-translate-y-0.5 disabled:cursor-default sm:h-14 ${
                    d === today ? 'ring-2 ring-orange-500 ring-offset-1 ' : ''
                  }${
                    skipped
                      ? 'border-dashed border-stone-400 bg-stone-200 text-stone-500 line-through dark:border-stone-600 dark:bg-stone-800'
                      : delivered
                        ? 'border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : past
                          ? 'border-transparent text-stone-400'
                          : 'border-orange-200 bg-orange-50 text-orange-800 enabled:hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200'
                  }`}
                >
                  <span>{Number(d.slice(8))}</span>
                  {first && <span className="text-[10px] font-medium uppercase no-underline opacity-70">{fmt(d).split(' ')[1]}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="muted mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <li><span className="mr-1.5 inline-block size-3 rounded border border-orange-200 bg-orange-50 align-middle" />Upcoming</li>
          <li><span className="mr-1.5 inline-block size-3 rounded border border-dashed border-stone-400 bg-stone-200 align-middle" />Skipped</li>
          <li><span className="mr-1.5 inline-block size-3 rounded border border-green-300 bg-green-100 align-middle" />Delivered</li>
          <li><span className="mr-1.5 inline-block size-3 rounded border border-orange-500 align-middle ring-1 ring-orange-500" />Today</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="font-display text-xl font-semibold">Rate your meals</h2>
        {rateable.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-4xl" aria-hidden="true">⭐</p>
            <p className="muted mt-2 text-sm">Delivered meals from the last 7 days will show up here.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {shown.flatMap((d) => meals.map((meal) => (
              <RateMeal key={`${d}${meal}`} date={d} meal={meal} dish={dishOf(d, meal)} onSave={saveRating}
                existing={feedback.find((f) => f.date === d && f.meal === meal)} />
            )))}
          </ul>
        )}
        {rateable.length > 2 && (
          <button className="btn-ghost mt-4" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show fewer' : `Show older (${rateable.length - 2} more days)`}
          </button>
        )}
      </div>
    </section>
  );
}
