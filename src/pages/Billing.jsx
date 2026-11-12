import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { ADDONS, PAYMENT_METHODS, RENEW_WINDOW_DAYS, canRenew, markPaid, renew, todayISO, withDefaults } from '../lib/subscription';
import { formatINR } from '../components/PlanCard';

const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Hide everything except the invoice when printing.
const PRINT_CSS = '@media print { body * { visibility: hidden } #invoice, #invoice * { visibility: visible } #invoice { position: absolute; inset: 0; box-shadow: none } .no-print { display: none } }';

export default function Billing() {
  const user = useSelector(selectUser);
  const raw = useSelector(selectSubscription);
  const plans = useSelector((s) => s.catalog.plans);
  const dispatch = useDispatch();
  const [invoice, setInvoice] = useState(null);
  const [method, setMethod] = useState('upi');
  const today = todayISO();

  if (!raw || raw.status === 'cancelled') {
    return (
      <section className="card mx-auto mt-12 max-w-md text-center">
        <p>No billing history yet.</p>
        <Link to="/plans" className="btn-primary mt-4">Browse plans</Link>
      </section>
    );
  }

  const sub = withDefaults(raw);
  const plan = plans.find((p) => p.id === sub.planId);
  const update = (change, message) => {
    try {
      dispatch(setSubscription({ email: user.email, sub: change(sub) }));
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="space-y-6 py-12">
      <style>{PRINT_CSS}</style>
      <div className="card flex flex-wrap items-center gap-4">
        <div className="mr-auto">
          <h1 className="font-display text-3xl font-bold">Billing</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            You can renew in the last {RENEW_WINDOW_DAYS} days of an active or paused plan, so months never stack by accident.
            {!canRenew(sub, today) && ` Your plan runs till ${fmt(sub.endDate)}.`}
          </p>
        </div>
        <select className="input w-auto" aria-label="Payment method for renewal" value={method} onChange={(e) => setMethod(e.target.value)}>
          {Object.entries(PAYMENT_METHODS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <button className="btn-primary" disabled={!canRenew(sub, today)} onClick={() => update((s) => renew(s, today, method), 'Renewed for the next month (demo payment)')}>
          Renew for next month
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-stone-500">
            <tr><th className="py-2">Period</th><th>Amount</th><th>Method</th><th>Status</th><th>Paid on</th><th /></tr>
          </thead>
          <tbody>
            {sub.payments.map((p) => (
              <tr key={p.id} className="border-t border-stone-200 dark:border-stone-800">
                <td className="py-2">{fmt(p.period.from)} – {fmt(p.period.to)}</td>
                <td>{formatINR(p.amount)}</td>
                <td>{PAYMENT_METHODS[p.method]}</td>
                <td className="capitalize">{p.status}</td>
                <td>{p.paidAt ? fmt(p.paidAt) : '—'}</td>
                <td className="space-x-2 text-right">
                  {p.status === 'due' && <button className="btn-primary" onClick={() => update((s) => markPaid(s, p.id, today), 'Marked as paid')}>Mark as paid</button>}
                  <button className="btn-ghost" onClick={() => setInvoice(p)}>View invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Invoice">
          <div id="invoice" className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 text-stone-900 shadow-xl">
            <h2 className="font-display text-2xl font-bold">DabbaDost invoice</h2>
            <p className="text-xs text-stone-500">Demo invoice · {invoice.id}</p>
            <p className="text-sm">Billed to {user.name} ({user.email})<br />{sub.address}</p>
            <table className="w-full text-sm">
              <tbody>
                <tr><td>{plan?.name ?? sub.planId}</td><td className="text-right">{formatINR(sub.price)}</td></tr>
                {sub.addons.map((id) => <tr key={id}><td>Add-on: {ADDONS.find((a) => a.id === id)?.name}</td><td className="text-right">incl.</td></tr>)}
                <tr className="border-t font-semibold"><td>Total ({fmt(invoice.period.from)} – {fmt(invoice.period.to)})</td><td className="text-right">{formatINR(invoice.amount)}</td></tr>
              </tbody>
            </table>
            <p className="text-sm capitalize">{PAYMENT_METHODS[invoice.method]} · {invoice.status}{invoice.paidAt && ` on ${fmt(invoice.paidAt)}`}</p>
            <div className="no-print flex gap-3">
              <button className="btn-primary" onClick={() => window.print()}>Print</button>
              <button className="btn-ghost" onClick={() => setInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
