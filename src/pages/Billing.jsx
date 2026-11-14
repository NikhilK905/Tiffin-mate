import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { selectUser } from '../store/authSlice';
import { selectSubscription, setSubscription } from '../store/subscriptionSlice';
import { ADDONS, PAYMENT_METHODS, RENEW_WINDOW_DAYS, addDays, canRenew, markPaid, renew, todayISO, withDefaults } from '../lib/subscription';
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

  const paid = sub.payments.filter((p) => p.status === 'paid').reduce((n, p) => n + p.amount, 0);
  const due = sub.payments.filter((p) => p.status === 'due').reduce((n, p) => n + p.amount, 0);
  const renewable = canRenew(sub, today);
  const actions = (p) => (
    <>
      {p.status === 'due' && <button className="btn-primary px-4 py-1.5" onClick={() => update((s) => markPaid(s, p.id, today), 'Marked as paid')}>Mark as paid</button>}
      <button className="btn-ghost px-4 py-1.5" onClick={() => setInvoice(p)}>View invoice</button>
    </>
  );

  return (
    <section className="py-10">
      <style>{PRINT_CSS}</style>
      <header className="mb-8">
        <p className="eyebrow">Billing</p>
        <h1 className="page-title mt-1">Payments & invoices</h1>
        <p className="muted mt-2">{plan?.name ?? sub.planId} · runs till {fmt(sub.endDate)}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm muted">Total paid</p>
          <p className="mt-1 font-display text-3xl font-bold">{formatINR(paid)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm muted">Amount due</p>
          <p className="mt-1 font-display text-3xl font-bold">{formatINR(due)}</p>
          {due > 0 ? <span className="badge-warn mt-2">Pay on first delivery</span> : <span className="badge-veg mt-2">All clear</span>}
        </div>
        <div className="card p-5">
          <p className="text-sm muted">Next renewal</p>
          <p className="mt-1 font-display text-3xl font-bold">{fmt(addDays(sub.endDate, 1))}</p>
          <span className={`${renewable ? 'badge-brand' : 'badge'} mt-2`}>{renewable ? 'Renewal open' : `Opens ${fmt(addDays(sub.endDate, -RENEW_WINDOW_DAYS))}`}</span>
        </div>
      </div>

      <div className="card mt-6 flex flex-wrap items-center gap-4">
        <p className="muted mr-auto max-w-xl text-sm">
          You can renew in the last {RENEW_WINDOW_DAYS} days of an active or paused plan, so months never stack by accident.
        </p>
        <select className="input mt-0 w-auto" aria-label="Payment method for renewal" value={method} onChange={(e) => setMethod(e.target.value)}>
          {Object.entries(PAYMENT_METHODS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <button className="btn-primary" disabled={!renewable} onClick={() => update((s) => renew(s, today, method), 'Renewed for the next month (demo payment)')}>
          Renew for next month
        </button>
      </div>

      <h2 className="mt-8 mb-3 font-display text-xl font-semibold">Billing history</h2>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="bg-stone-100 dark:bg-stone-800/50">
            <tr>{['Period', 'Amount', 'Method', 'Status', 'Paid on', ''].map((h, i) => <th key={i} className={`px-4 py-3 font-semibold ${i === 5 ? 'hidden sm:table-cell' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {sub.payments.map((p) => (
              <tr key={p.id} className="border-t border-stone-100 dark:border-stone-800">
                <td className="px-4 py-3">{fmt(p.period.from)} – {fmt(p.period.to)}<div className="mt-2 flex flex-wrap gap-2 sm:hidden">{actions(p)}</div></td>
                <td className="px-4 py-3 font-medium">{formatINR(p.amount)}</td>
                <td className="px-4 py-3">{PAYMENT_METHODS[p.method]}</td>
                <td className="px-4 py-3"><span className={p.status === 'paid' ? 'badge-veg' : 'badge-warn'}>{p.status === 'paid' ? 'Paid' : 'Due'}</span></td>
                <td className="px-4 py-3">{p.paidAt ? fmt(p.paidAt) : '—'}</td>
                <td className="hidden px-4 py-2 sm:table-cell"><div className="flex justify-end gap-2">{actions(p)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Invoice">
          <div id="invoice" className="w-full max-w-md rounded-2xl bg-white p-7 text-stone-900 shadow-2xl">
            <div className="flex items-start justify-between border-b border-dashed border-stone-300 pb-4">
              <div>
                <p className="font-display text-2xl font-bold text-orange-600">TiffinMate 🍱</p>
                <p className="text-xs text-stone-500">Demo receipt · no real payment</p>
              </div>
              <div className="text-right text-xs text-stone-500">
                <p className="font-semibold text-stone-900">{invoice.id.toUpperCase()}</p>
                <span className={invoice.status === 'paid' ? 'badge-veg mt-1' : 'badge-warn mt-1'}>{invoice.status === 'paid' ? 'PAID' : 'DUE'}</span>
              </div>
            </div>
            <p className="mt-4 text-sm"><span className="text-stone-500">Billed to</span><br /><b>{user.name}</b> · {user.email}<br />{sub.address}</p>
            <p className="mt-3 text-sm"><span className="text-stone-500">Period</span><br />{fmt(invoice.period.from)} – {fmt(invoice.period.to)}</p>
            <table className="mt-4 w-full text-sm">
              <tbody>
                <tr><td className="py-1">{plan?.name ?? sub.planId}</td><td className="text-right">{formatINR(sub.price)}</td></tr>
                {sub.addons.map((id) => <tr key={id}><td className="py-1">+ {ADDONS.find((a) => a.id === id)?.name}</td><td className="text-right">{formatINR(ADDONS.find((a) => a.id === id)?.price ?? 0)}</td></tr>)}
                <tr className="border-t border-dashed border-stone-300 font-bold"><td className="pt-3">Total</td><td className="pt-3 text-right font-display text-xl">{formatINR(invoice.amount)}</td></tr>
              </tbody>
            </table>
            <p className="mt-4 text-xs text-stone-500">{PAYMENT_METHODS[invoice.method]}{invoice.paidAt && ` · paid ${fmt(invoice.paidAt)}`}</p>
            <div className="no-print mt-5 flex gap-3">
              <button className="btn-primary" onClick={() => window.print()}>Print</button>
              <button className="btn-ghost" onClick={() => setInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
