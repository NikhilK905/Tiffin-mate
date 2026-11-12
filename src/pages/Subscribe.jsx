import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { ADDONS, DEFAULT_PREFS, PAYMENT_METHODS, addDays, createSubscription, quote, todayISO } from '../lib/subscription';
import { formatINR } from '../components/PlanCard';

const STEPS = ['Meals', 'Add-ons', 'Delivery & payment'];
const SPICE = ['mild', 'medium', 'hot'];

export default function Subscribe() {
  const { planId } = useParams();
  const { plans, status } = useSelector((s) => s.catalog);
  const user = useSelector(selectUser);
  const current = useSelector(selectSubscription);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tomorrow = addDays(todayISO(), 1);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS, jain: user.diet === 'jain' });
  const [addons, setAddons] = useState([]);
  const [startDate, setStartDate] = useState(tomorrow);
  const [address, setAddress] = useState(user.college);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [method, setMethod] = useState('upi');
  const [codeInput, setCodeInput] = useState('');
  const [coupon, setCoupon] = useState(null); // only set once a code has been validated
  const [processing, setProcessing] = useState(false);

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

  const q = quote({ plan, addons, coupon });

  const applyCoupon = () => {
    try {
      const { coupon: code } = quote({ plan, addons, coupon: codeInput });
      setCoupon(code);
      toast.success(code ? `Coupon ${code} applied` : 'Enter a coupon code');
    } catch (err) {
      setCoupon(null);
      toast.error(err.message);
    }
  };

  const toggleAddon = (id) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const setPref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (step < 2) return setStep(step + 1);
    let sub;
    try {
      sub = createSubscription({ plan, startDate, address, today: todayISO(), addons, preferences: prefs, phone, coupon, method });
    } catch (err) {
      return toast.error(err.message);
    }
    setProcessing(true);
    // ponytail: demo payment, no gateway; the timeout only simulates latency
    setTimeout(() => {
      dispatch(setSubscription({ email: user.email, sub }));
      toast.success(`Subscribed to ${plan.name}! First tiffin on ${sub.startDate}.`);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <section className="mx-auto max-w-4xl py-12">
      <ol className="mb-6 flex gap-2 text-sm" aria-label="Checkout steps">
        {STEPS.map((name, i) => (
          <li
            key={name}
            aria-current={i === step ? 'step' : undefined}
            className={`flex-1 rounded-full px-3 py-1.5 text-center ${
              i === step
                ? 'bg-orange-600 font-semibold text-white'
                : i < step
                  ? 'bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200'
                  : 'bg-stone-100 text-stone-500 dark:bg-stone-800'
            }`}
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 md:grid-cols-5">
        <form onSubmit={onSubmit} className="card space-y-4 md:col-span-3">
          {step === 0 && (
            <>
              <fieldset>
                <legend className="label">Spice level</legend>
                <div className="mt-1 flex gap-2">
                  {SPICE.map((s) => (
                    <label key={s} className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm capitalize ${prefs.spice === s ? 'border-orange-600 bg-orange-50 font-semibold dark:bg-orange-950/40' : 'border-stone-300 dark:border-stone-700'}`}>
                      <input type="radio" name="spice" className="sr-only" checked={prefs.spice === s} onChange={() => setPref('spice', s)} />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={prefs.jain} onChange={(e) => setPref('jain', e.target.checked)} />
                Jain meals (no onion, no garlic)
              </label>
              <label className="label">
                Notes for the kitchen
                <textarea className="input min-h-20" value={prefs.notes} onChange={(e) => setPref('notes', e.target.value)} placeholder="e.g. less oil, no peanuts" />
              </label>
            </>
          )}

          {step === 1 && (
            <fieldset className="space-y-2">
              <legend className="label">Add-ons (charged every month)</legend>
              {ADDONS.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-300 px-3 py-2 text-sm dark:border-stone-700">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                    {a.name}
                  </span>
                  <span>+{formatINR(a.price)}/mo</span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 2 && (
            <>
              <label className="label">
                Start date
                <input className="input" type="date" min={tomorrow} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label className="label">
                Delivery address
                <textarea className="input min-h-20" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hostel, room number, gate" required />
              </label>
              <label className="label">
                Phone
                <input className="input" type="tel" inputMode="tel" pattern="[0-9+ ]{10,14}" title="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
              <fieldset>
                <legend className="label">Payment method</legend>
                <div className="mt-1 space-y-2">
                  {Object.entries(PAYMENT_METHODS).map(([id, name]) => (
                    <label key={id} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="method" checked={method === id} onChange={() => setMethod(id)} />
                      {name}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="label">
                Coupon code
                <div className="flex gap-2">
                  <input className="input" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="STUDENT10 or FIRST100" />
                  <button type="button" className="btn-ghost" onClick={applyCoupon}>Apply</button>
                </div>
              </div>
              <p className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
                Demo checkout: no real payment is taken. {method === 'cash' ? 'Cash will be recorded as due until the first delivery.' : `${PAYMENT_METHODS[method]} will be recorded as paid.`}
              </p>
            </>
          )}

          <div className="flex gap-3">
            {step > 0 && <button type="button" className="btn-ghost" disabled={processing} onClick={() => setStep(step - 1)}>Back</button>}
            <button className="btn-primary ml-auto" disabled={processing}>
              {processing ? 'Processing payment… (demo)' : step < 2 ? 'Next' : method === 'cash' ? `Confirm · ${formatINR(q.total)} due` : `Pay ${formatINR(q.total)} (demo)`}
            </button>
          </div>
        </form>

        <aside className="card h-fit md:sticky md:top-6 md:col-span-2">
          <p className="text-sm text-stone-500">Order summary</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{plan.name}</h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{plan.mealsPerDay === 1 ? 'Lunch' : 'Lunch + dinner'} · 30 days</p>
          <dl className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
            {q.lines.map((l) => (
              <div key={l.label} className="flex justify-between"><dt>{l.label}</dt><dd>{l.amount < 0 ? '−' : ''}{formatINR(Math.abs(l.amount))}</dd></div>
            ))}
            <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold dark:border-stone-800"><dt>Total</dt><dd>{formatINR(q.total)}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
