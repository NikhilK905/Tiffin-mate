import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setSubscription } from '../../store/subscriptionSlice';
import { register } from '../../store/authSlice';
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

  const blank = { name: '', email: '', password: '', college: '' };
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(blank);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const addStudent = async (e) => {
    e.preventDefault();
    try {
      const user = await dispatch(register({ ...form, byAdmin: true })).unwrap();
      toast.success(`Account created: ${user.name}`);
      setForm(blank);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not create the account');
    }
  };

  return (
    <div>
      <PageHead eyebrow="Subscribers" title="Every student" hint="Add students, or pause, resume or cancel on their behalf.">
        <button className={adding ? 'btn-ghost' : 'btn-primary'} aria-expanded={adding} onClick={() => setAdding(!adding)}>
          {adding ? 'Close' : '+ Add student'}
        </button>
      </PageHead>
      {adding && (
        <form onSubmit={addStudent} className="card mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
          <label className="label">Full name<input className="input" value={form.name} onChange={set('name')} required /></label>
          <label className="label">Email<input className="input" type="email" value={form.email} onChange={set('email')} required /></label>
          <label className="label">Password<input className="input" type="text" value={form.password} onChange={set('password')} minLength={6} required autoComplete="off" /></label>
          <label className="label">College / hostel<input className="input" value={form.college} onChange={set('college')} /></label>
          <button className="btn-primary">Create</button>
        </form>
      )}
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
