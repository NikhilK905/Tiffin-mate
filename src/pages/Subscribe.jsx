import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { addDays, createSubscription, todayISO } from '../lib/subscription';
import { formatINR } from '../components/PlanCard';

export default function Subscribe() {
  const { planId } = useParams();
  const { plans, status } = useSelector((s) => s.catalog);
  const user = useSelector(selectUser);
  const current = useSelector(selectSubscription);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tomorrow = addDays(todayISO(), 1);
  const [startDate, setStartDate] = useState(tomorrow);
  const [address, setAddress] = useState(user.college);

  if (status !== 'ready') return <p className="py-12 text-stone-500">Loading…</p>;
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return <Navigate to="/" replace />;

  if (current && current.status !== 'cancelled') {
    return (
      <section className="card mx-auto mt-12 max-w-md text-center">
        <p>You already have a running subscription.</p>
        <Link to="/dashboard" className="btn-primary mt-4">Go to my tiffin</Link>
      </section>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    try {
      const sub = createSubscription({ plan, startDate, address, today: todayISO() });
      dispatch(setSubscription({ email: user.email, sub }));
      toast.success(`Subscribed to ${plan.name}! First tiffin on ${sub.startDate}.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="mx-auto grid max-w-3xl gap-6 py-12 md:grid-cols-5">
      <aside className="card md:col-span-2">
        <p className="text-sm text-stone-500">You're subscribing to</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{plan.name}</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{plan.description}</p>
        <dl className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
          <div className="flex justify-between"><dt>Duration</dt><dd>30 days</dd></div>
          <div className="flex justify-between"><dt>Meals</dt><dd>{plan.mealsPerDay === 1 ? 'Lunch' : 'Lunch + dinner'}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{formatINR(plan.price)}</dd></div>
        </dl>
      </aside>

      <form onSubmit={onSubmit} className="card space-y-4 md:col-span-3">
        <label className="label">
          Start date
          <input className="input" type="date" min={tomorrow} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </label>
        <label className="label">
          Delivery address
          <textarea
            className="input min-h-24"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Hostel, room number, gate"
            required
          />
        </label>
        <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
          Pay {formatINR(plan.price)} by cash or UPI to the delivery partner on your first delivery.
        </p>
        <button className="btn-primary w-full">Confirm subscription</button>
      </form>
    </section>
  );
}
