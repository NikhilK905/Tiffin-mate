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
const SPICE_ICON = { mild: '🌿', medium: '🌶️', hot: '🔥' };
const PAY_ICON = { upi: '📱', card: '💳', cash: '💵' };
const ADDON_ICON = { roti: '🫓', curd: '🥣', sweet: '🍮', fruit: '🍎' };

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
    <section className="mx-auto max-w-4xl py-10">
      <header className="mb-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="page-title mt-1">Subscribe to {plan.name}</h1>
      </header>

      <ol className="mb-8 flex items-start" aria-label="Checkout steps">
        {STEPS.map((name, i) => (
          <li key={name} aria-current={i === step ? 'step' : undefined} className={`relative flex flex-1 flex-col items-center gap-1.5 text-center text-xs font-medium sm:text-sm ${i === step ? 'text-orange-700 dark:text-orange-400' : i < step ? 'text-stone-700 dark:text-stone-300' : 'text-stone-500'}`}>
            {i > 0 && <span aria-hidden="true" className={`absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2 ${i <= step ? 'bg-orange-600' : 'bg-stone-200 dark:bg-stone-800'}`} />}
            <span className={`relative z-10 grid size-8 place-items-center rounded-full border-2 text-sm font-bold ${i <= step ? 'border-orange-600 bg-orange-600 text-white' : 'border-stone-300 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-900'} ${i === step ? 'ring-4 ring-orange-500/20' : ''}`}>
              {i < step ? '✓' : i + 1}
            </span>
            {name}
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
                    <label key={s} className={`chip flex-1 cursor-pointer justify-center capitalize has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-orange-500 ${prefs.spice === s ? 'border-orange-600 bg-orange-600 text-white' : ''}`}>
                      <input type="radio" name="spice" className="sr-only" checked={prefs.spice === s} onChange={() => setPref('spice', s)} />
                      {SPICE_ICON[s]} {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm dark:bg-green-900/20">
                <input type="checkbox" className="size-4 accent-green-700" checked={prefs.jain} onChange={(e) => setPref('jain', e.target.checked)} />
                Jain meals (no onion, no garlic)
              </label>
              <label className="label">
                Notes for the kitchen
                <textarea className="input min-h-20" value={prefs.notes} onChange={(e) => setPref('notes', e.target.value)} placeholder="e.g. less oil, no peanuts" />
              </label>
            </>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="label">Add-ons (charged every month)</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const on = addons.includes(a.id);
                  return (
                    <label key={a.id} className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-orange-500 ${on ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'border-stone-200 hover:border-orange-300 dark:border-stone-700'}`}>
                      <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleAddon(a.id)} />
                      <span className="text-2xl" aria-hidden="true">{ADDON_ICON[a.id]}</span>
                      <span className="font-semibold">{a.name}</span>
                      <span className="text-sm muted">+{formatINR(a.price)}/mo</span>
                      {on && <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-orange-600 text-xs text-white" aria-hidden="true">✓</span>}
                    </label>
                  );
                })}
              </div>
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
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {Object.entries(PAYMENT_METHODS).map(([id, name]) => (
                    <label key={id} className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center text-sm font-medium transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-orange-500 ${method === id ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30' : 'border-stone-200 hover:border-orange-300 dark:border-stone-700'}`}>
                      <input type="radio" name="method" className="sr-only" checked={method === id} onChange={() => setMethod(id)} />
                      <span className="text-2xl" aria-hidden="true">{PAY_ICON[id]}</span>
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
              <p className="rounded-xl bg-turmeric-100 p-3 text-sm text-turmeric-700 dark:bg-yellow-900/30 dark:text-yellow-200">
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

        <aside className="card h-fit md:sticky md:top-24 md:col-span-2">
          <p className="eyebrow">Order summary</p>
          <h2 className="mt-1 font-display text-xl font-semibold">{plan.name}</h2>
          <p className="muted mt-1 text-sm">{plan.mealsPerDay === 1 ? 'Lunch' : 'Lunch + dinner'} · 30 days</p>
          <dl className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
            {q.lines.map((l) => (
              <div key={l.label} className={`flex justify-between ${l.amount < 0 ? 'font-medium text-green-700 dark:text-green-400' : ''}`}><dt>{l.label}</dt><dd>{l.amount < 0 ? '−' : ''}{formatINR(Math.abs(l.amount))}</dd></div>
            ))}
            <div className="flex items-baseline justify-between border-t border-stone-200 pt-3 dark:border-stone-800"><dt className="font-semibold">Total / month</dt><dd className="font-display text-2xl font-bold text-orange-600">{formatINR(q.total)}</dd></div>
          </dl>
          <p className="badge-warn mt-4">Demo checkout · no real payment</p>
        </aside>
      </div>
    </section>
  );
}
