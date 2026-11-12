import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setSubscription } from '../../store/subscriptionSlice';
import { mealsLeft, pause, resume, todayISO } from '../../lib/subscription';
import { Badge, Th, fmt, students } from './shared';

export default function Subscribers() {
  const users = useSelector((s) => s.auth.users);
  const subs = useSelector((s) => s.subscription.byEmail);
  const plans = useSelector((s) => s.catalog.plans);
  const dispatch = useDispatch();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const today = todayISO();

  const rows = students(users).filter((u) => {
    const s = subs[u.email];
    const text = `${u.name} ${u.email}`.toLowerCase();
    return text.includes(q.trim().toLowerCase()) && (status === 'all' || (status === 'none' ? !s : s?.status === status));
  });

  const act = (u, change, message) => {
    try {
      dispatch(setSubscription({ email: u.email, sub: change(subs[u.email]) }));
      toast.success(`${message}: ${u.name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };
  const cancel = (u) => {
    if (window.confirm(`Cancel ${u.name}'s subscription? This cannot be undone.`)) {
      act(u, (s) => ({ ...s, status: 'cancelled' }), 'Subscription cancelled');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input className="input mt-0 max-w-xs" placeholder="Search name or email" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input mt-0 max-w-40" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['all', 'active', 'paused', 'cancelled', 'none'].map((s) => (
            <option key={s} value={s}>{s === 'none' ? 'No plan' : s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <Th cols={['Student', 'Plan', 'Status', 'Start', 'End', 'Meals left', 'Address', 'Actions']} />
          <tbody>
            {rows.map((u) => {
              const sub = subs[u.email];
              return (
                <tr key={u.email} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                  <td className="px-3 py-2">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-stone-500">{u.email}</div>
                  </td>
                  <td className="px-3 py-2">{sub ? (plans.find((p) => p.id === sub.planId)?.name ?? sub.planId) : '—'}</td>
                  <td className="px-3 py-2">{sub ? <Badge status={sub.status} /> : <span className="text-stone-500">No plan</span>}</td>
                  <td className="px-3 py-2">{sub ? fmt(sub.startDate) : '—'}</td>
                  <td className="px-3 py-2">{sub ? fmt(sub.endDate) : '—'}</td>
                  <td className="px-3 py-2">{sub ? mealsLeft(sub, today) : '—'}</td>
                  <td className="px-3 py-2">{sub?.address ?? '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {sub?.status === 'active' && <button className="btn-ghost px-3 py-1.5" onClick={() => act(u, (s) => pause(s, today), 'Paused')}>Pause</button>}
                      {sub?.status === 'paused' && <button className="btn-ghost px-3 py-1.5" onClick={() => act(u, (s) => resume(s, today), 'Resumed')}>Resume</button>}
                      {sub && sub.status !== 'cancelled' && (
                        <button className="btn-ghost px-3 py-1.5 text-red-600 dark:text-red-400" onClick={() => cancel(u)}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={8} className="px-3 py-6 text-center text-stone-500">No students match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
