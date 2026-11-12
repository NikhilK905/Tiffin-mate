import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setSubscription } from '../../store/subscriptionSlice';
import { mealsLeft, pause, resume, todayISO } from '../../lib/subscription';
import { Badge, Empty, PageHead, TableCard, Td, fmt, students } from './shared';

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

  const FILTERS = ['all', 'active', 'paused', 'cancelled', 'none'];

  return (
    <div>
      <PageHead eyebrow="Subscribers" title="Every student" hint="Pause, resume or cancel on a student's behalf." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="input mt-0 max-w-xs" placeholder="Search name or email" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f} className="chip capitalize" aria-pressed={status === f} onClick={() => setStatus(f)}>
              {f === 'none' ? 'No plan' : f}
            </button>
          ))}
        </div>
      </div>
      <TableCard
        cols={['Student', 'Plan', 'Status', 'Start – end', 'Left', 'Address', 'Actions']}
        min="50rem"
        empty={!rows.length && <Empty icon="🔍" title="No students match" hint="Try a different search or filter." />}
      >
        {rows.map((u) => {
          const sub = subs[u.email];
          return (
            <tr key={u.email}>
              <Td>
                <div className="font-medium">{u.name}</div>
                <div className="muted text-xs">{u.email}</div>
              </Td>
              <Td>{sub ? (plans.find((p) => p.id === sub.planId)?.name ?? sub.planId) : '—'}</Td>
              <Td>{sub ? <Badge status={sub.status} /> : <span className="muted">No plan</span>}</Td>
              <Td className="whitespace-nowrap">{sub ? `${fmt(sub.startDate)} – ${fmt(sub.endDate)}` : '—'}</Td>
              <Td>{sub ? mealsLeft(sub, today) : '—'}</Td>
              <Td className="min-w-32 max-w-44">{sub?.address ?? '—'}</Td>
              <Td>
                <div className="flex gap-2">
                  {sub?.status === 'active' && <button className="btn-ghost px-3 py-1" onClick={() => act(u, (s) => pause(s, today), 'Paused')}>Pause</button>}
                  {sub?.status === 'paused' && <button className="btn-ghost px-3 py-1" onClick={() => act(u, (s) => resume(s, today), 'Resumed')}>Resume</button>}
                  {sub && sub.status !== 'cancelled' && (
                    <button className="btn-ghost px-3 py-1 text-red-600 dark:text-red-400" onClick={() => cancel(u)}>Cancel</button>
                  )}
                </div>
              </Td>
            </tr>
          );
        })}
      </TableCard>
    </div>
  );
}
